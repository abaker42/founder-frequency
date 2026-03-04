"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// useSearchParams() requires a Suspense boundary — SuccessContent is the
// inner component, SuccessPage (default export) wraps it.

// ── Tier display helpers ─────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
	report: "Frequency Report",
	blueprint: "Full Frequency Blueprint",
	circle: "Frequency Circle",
};

// Map checkout tier → generate API tier
const GENERATE_TIER: Record<string, "insight" | "blueprint"> = {
	report: "insight",
	blueprint: "blueprint",
	circle: "blueprint", // Circle members get Blueprint-depth content
};

// ── Main Page ────────────────────────────────────────────────────────────────

type Phase = "verifying" | "generating" | "done" | "error";

function SuccessContent() {
	const params = useSearchParams();
	const sessionId = params.get("session_id");

	const [phase, setPhase] = useState<Phase>("verifying");
	const [error, setError] = useState("");
	const [profileName, setProfileName] = useState("");
	const [tierLabel, setTierLabel] = useState("Founder Frequency Report");
	const [customerEmail, setCustomerEmail] = useState("");

	useEffect(() => {
		if (!sessionId) {
			setError("No session found. If you completed payment, contact support.");
			setPhase("error");
			return;
		}

		async function run() {
			// 1. Verify payment
			const verifyRes = await fetch(
				`/api/verify-session?session_id=${sessionId}`,
			);
			if (!verifyRes.ok) {
				const data = await verifyRes.json();
				setError(data.error || "Could not verify your payment.");
				setPhase("error");
				return;
			}

			const { tier, name, dob, email } = await verifyRes.json();

			setProfileName(name ?? "");
			setTierLabel(TIER_LABELS[tier] ?? "Founder Frequency Report");
			if (email) setCustomerEmail(email);

			// 2. Generate report + send email
			setPhase("generating");

			const genTier = GENERATE_TIER[tier] ?? "insight";
			const genRes = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, dob, tier: genTier, email }),
			});

			if (!genRes.ok) {
				const data = await genRes.json();
				setError(data.error || "Report generation failed. Please contact support.");
				setPhase("error");
				return;
			}

			setPhase("done");
		}

		run().catch((err) => {
			console.error(err);
			setError("Something went wrong. Please contact support.");
			setPhase("error");
		});
	}, [sessionId]);

	const firstName = profileName ? profileName.split(" ")[0] : "";

	return (
		<div className='min-h-screen bg-zinc-950 text-zinc-100'>
			{/* Nav */}
			<header className='fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50'>
				<div className='max-w-6xl mx-auto px-6 h-16 flex items-center'>
					<a
						href='/'
						className='flex items-center gap-2'
						aria-label='Founder Frequency home'
					>
						<div className='w-2 h-2 rounded-full bg-brand-gold' aria-hidden='true' />
						<span className='font-display text-lg tracking-tight'>
							Founder<span className='text-brand-gold'>Frequency</span>
						</span>
					</a>
				</div>
			</header>

			<main className='pt-24 pb-24 px-6'>
				<div className='max-w-md mx-auto text-center'>

					{/* ── Verifying ───────────────────────────────────────── */}
					{phase === "verifying" && (
						<div className='py-24'>
							<div
								className='w-3 h-3 rounded-full bg-brand-gold animate-pulse-glow mx-auto mb-8'
								aria-hidden='true'
							/>
							<p className='font-display text-xl tracking-tight text-zinc-300'>
								Confirming your payment...
							</p>
						</div>
					)}

					{/* ── Generating ──────────────────────────────────────── */}
					{phase === "generating" && (
						<div className='py-24'>
							<div
								className='w-3 h-3 rounded-full bg-brand-gold animate-pulse-glow mx-auto mb-10'
								aria-hidden='true'
							/>
							<h2 className='font-display text-2xl font-medium tracking-tight text-zinc-100 mb-4'>
								{firstName
									? `Your report is on its way, ${firstName}.`
									: "Your report is on its way."}
							</h2>
							<p className='text-zinc-400 text-sm leading-relaxed mb-6'>
								We&apos;re assembling your {tierLabel} now. You&apos;ll receive a PDF at{" "}
								{customerEmail ? (
									<span className='text-brand-gold'>{customerEmail}</span>
								) : (
									"the email you entered at checkout"
								)}{" "}
								within a few minutes.
							</p>
							<p className='text-zinc-600 text-xs'>
								This page will update automatically when it&apos;s ready.
							</p>
						</div>
					)}

					{/* ── Done ────────────────────────────────────────────── */}
					{phase === "done" && (
						<div className='py-24'>
							{/* Check mark */}
							<div className='w-12 h-12 rounded-full border border-brand-gold/40 flex items-center justify-center mx-auto mb-8'>
								<svg
									className='w-5 h-5 text-brand-gold'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									strokeWidth={2}
									aria-hidden='true'
								>
									<path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
								</svg>
							</div>

							<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-4'>
								{tierLabel}
							</p>

							<h1 className='font-display text-3xl font-medium tracking-tight mb-4'>
								{firstName ? `Check your inbox, ${firstName}.` : "Check your inbox."}
							</h1>

							<p className='text-zinc-400 text-sm leading-relaxed mb-2'>
								Your {tierLabel} has been sent to
							</p>
							{customerEmail && (
								<p className='text-brand-gold font-medium mb-8'>
									{customerEmail}
								</p>
							)}

							<p className='text-zinc-600 text-xs mb-12'>
								Don&apos;t see it? Check your spam folder or reply to your receipt email.
							</p>

							<a
								href='/'
								className='text-sm text-zinc-500 hover:text-zinc-300 transition-colors'
							>
								← Back to Founder Frequency
							</a>
						</div>
					)}

					{/* ── Error ───────────────────────────────────────────── */}
					{phase === "error" && (
						<div className='py-24'>
							<p className='font-display text-2xl font-medium tracking-tight mb-4 text-zinc-200'>
								Something went wrong
							</p>
							<p className='text-zinc-500 text-sm mb-8 max-w-md mx-auto'>
								{error}
							</p>
							<a
								href='/'
								className='inline-flex items-center px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:border-brand-gold/40 hover:text-brand-gold transition-all'
							>
								Return home
							</a>
						</div>
					)}

				</div>
			</main>
		</div>
	);
}

export default function SuccessPage() {
	return (
		<Suspense>
			<SuccessContent />
		</Suspense>
	);
}
