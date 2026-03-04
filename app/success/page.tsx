"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// useSearchParams() requires a Suspense boundary — SuccessContent is the
// inner component, SuccessPage (default export) wraps it.

// ── Tier display helpers ─────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
	report: "Frequency Report",
	blueprint: "Full Frequency Blueprint",
	circle: "Frequency Circle",
};

// ── Main Page ────────────────────────────────────────────────────────────────

type Phase = "verifying" | "confirmed" | "error";

function SuccessContent() {
	const params = useSearchParams();
	const sessionId = params.get("session_id");
	const hasRun = useRef(false);

	const [phase, setPhase] = useState<Phase>("verifying");
	const [error, setError] = useState("");
	const [profileName, setProfileName] = useState("");
	const [tierLabel, setTierLabel] = useState("Founder Frequency Report");
	const [customerEmail, setCustomerEmail] = useState("");

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		if (!sessionId) {
			setError("No session found. If you completed payment, contact support.");
			setPhase("error");
			return;
		}

		async function run() {
			const verifyRes = await fetch(
				`/api/verify-session?session_id=${sessionId}`,
			);
			if (!verifyRes.ok) {
				const data = await verifyRes.json();
				setError(data.error || "Could not verify your payment.");
				setPhase("error");
				return;
			}

			const { tier, name, email } = await verifyRes.json();

			setProfileName(name ?? "");
			setTierLabel(TIER_LABELS[tier] ?? "Founder Frequency Report");
			if (email) setCustomerEmail(email);

			// Report generation is handled server-side via Stripe webhook → Inngest.
			// Nothing to wait for here — the email is already on its way.
			setPhase("confirmed");
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

					{/* ── Confirmed ───────────────────────────────────────── */}
					{phase === "confirmed" && (
						<div className='py-24'>
							{/* Checkmark */}
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
								{firstName ? `You're all set, ${firstName}.` : "You're all set."}
							</h1>

							<p className='text-zinc-400 text-sm leading-relaxed mb-2'>
								Your {tierLabel} is being assembled and will arrive at
							</p>
							{customerEmail && (
								<p className='text-brand-gold font-medium mb-8'>
									{customerEmail}
								</p>
							)}
							{!customerEmail && (
								<p className='text-zinc-400 text-sm mb-8'>
									the email you entered at checkout
								</p>
							)}

							<p className='text-zinc-600 text-xs mb-12'>
								Expect it within a few minutes. Check your spam folder if it doesn&apos;t appear.
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
