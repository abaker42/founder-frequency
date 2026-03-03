"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// useSearchParams() requires a Suspense boundary — SuccessContent is the
// inner component, SuccessPage (default export) wraps it.


// ── Tier display helpers ────────────────────────────────────────────────────

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

// ── Simple report renderer ──────────────────────────────────────────────────

function ReportSection({ text }: { text: string }) {
	const lines = text.split("\n");
	return (
		<div className='space-y-4 font-body text-zinc-300 leading-relaxed text-sm'>
			{lines.map((line, i) => {
				if (line.startsWith("## ")) {
					return (
						<h2
							key={i}
							className='font-display text-xl font-medium text-zinc-100 mt-10 mb-2 tracking-tight'
						>
							{line.replace(/^## /, "")}
						</h2>
					);
				}
				if (line.startsWith("# ")) {
					return (
						<h1
							key={i}
							className='font-display text-2xl font-medium text-zinc-100 mt-12 mb-3 tracking-tight'
						>
							{line.replace(/^# /, "")}
						</h1>
					);
				}
				if (line.startsWith("### ")) {
					return (
						<h3
							key={i}
							className='font-display text-base font-semibold text-brand-gold mt-8 mb-1 tracking-wide uppercase text-xs'
						>
							{line.replace(/^### /, "")}
						</h3>
					);
				}
				if (line.startsWith("---") || line.startsWith("___")) {
					return (
						<div
							key={i}
							className='freq-line my-8'
							aria-hidden='true'
						/>
					);
				}
				if (line.trim() === "") {
					return <div key={i} className='h-2' />;
				}
				// Inline bold: **text**
				const parts = line.split(/(\*\*[^*]+\*\*)/g);
				return (
					<p key={i}>
						{parts.map((part, j) =>
							part.startsWith("**") && part.endsWith("**") ? (
								<strong key={j} className='text-zinc-100 font-semibold'>
									{part.slice(2, -2)}
								</strong>
							) : (
								<span key={j}>{part}</span>
							),
						)}
					</p>
				);
			})}
		</div>
	);
}

// ── Download helper ─────────────────────────────────────────────────────────

function downloadReport(text: string, name: string) {
	const blob = new Blob([text], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `founder-frequency-${name.split(" ")[0].toLowerCase()}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}

// ── Main Page ───────────────────────────────────────────────────────────────

type Phase =
	| "verifying"
	| "generating"
	| "done"
	| "error";

function SuccessContent() {
	const params = useSearchParams();
	const sessionId = params.get("session_id");

	const [phase, setPhase] = useState<Phase>("verifying");
	const [error, setError] = useState("");
	const [profileName, setProfileName] = useState("");
	const [tierLabel, setTierLabel] = useState("Founder Frequency Report");
	const [report, setReport] = useState("");
	const reportRef = useRef<HTMLDivElement>(null);

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

			const { tier, name, dob } = await verifyRes.json();

			setProfileName(name ?? "");
			setTierLabel(TIER_LABELS[tier] ?? "Founder Frequency Report");

			// 2. Generate report
			setPhase("generating");

			const genTier = GENERATE_TIER[tier] ?? "insight";
			const genRes = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, dob, tier: genTier }),
			});

			if (!genRes.ok) {
				const data = await genRes.json();
				setError(data.error || "Report generation failed. Please contact support.");
				setPhase("error");
				return;
			}

			const { report: reportText } = await genRes.json();
			setReport(reportText);
			setPhase("done");

			setTimeout(() => {
				reportRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 300);
		}

		run().catch((err) => {
			console.error(err);
			setError("Something went wrong. Please contact support.");
			setPhase("error");
		});
	}, [sessionId]);

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
				<div className='max-w-3xl mx-auto'>
					{/* ── Verifying ─────────────────────────────────────── */}
					{phase === "verifying" && (
						<div className='text-center py-24'>
							<div
								className='w-3 h-3 rounded-full bg-brand-gold animate-pulse-glow mx-auto mb-8'
								aria-hidden='true'
							/>
							<p className='font-display text-xl tracking-tight text-zinc-300'>
								Confirming your payment...
							</p>
						</div>
					)}

					{/* ── Generating ────────────────────────────────────── */}
					{phase === "generating" && (
						<div className='text-center py-24'>
							<div className='flex justify-center gap-1.5 mb-8' aria-hidden='true'>
								{[0, 1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className='w-1 bg-brand-gold rounded-full animate-pulse'
										style={{
											height: `${12 + i * 6}px`,
											animationDelay: `${i * 150}ms`,
										}}
									/>
								))}
							</div>
							<p className='font-display text-2xl font-medium tracking-tight mb-3'>
								{profileName
									? `Decoding ${profileName.split(" ")[0]}'s frequency...`
									: "Generating your report..."}
							</p>
							<p className='text-zinc-500 text-sm'>
								Your {tierLabel} is being assembled. This takes 60–90 seconds.
							</p>
						</div>
					)}

					{/* ── Error ─────────────────────────────────────────── */}
					{phase === "error" && (
						<div className='text-center py-24'>
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

					{/* ── Report ────────────────────────────────────────── */}
					{phase === "done" && (
						<>
							{/* Header */}
							<div className='text-center mb-16 pt-8'>
								<div
									className='w-2 h-2 rounded-full bg-brand-gold mx-auto mb-6 animate-pulse-glow'
									aria-hidden='true'
								/>
								<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-3'>
									{tierLabel}
								</p>
								<h1 className='font-display text-3xl sm:text-4xl font-medium tracking-tight mb-3'>
									{profileName
										? `${profileName.split(" ")[0]}, your report is ready.`
										: "Your report is ready."}
								</h1>
								<p className='text-zinc-500 text-sm'>
									Save it now — bookmark this page or download below.
								</p>

								<div className='flex items-center justify-center gap-3 mt-6'>
									<button
										onClick={() => downloadReport(report, profileName)}
										className='px-5 py-2.5 bg-brand-gold text-zinc-950 font-semibold rounded-lg text-sm tracking-wide hover:bg-brand-gold-light transition-all'
									>
										Download .txt
									</button>
									<button
										onClick={() => window.print()}
										className='px-5 py-2.5 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:border-zinc-500 transition-all'
									>
										Save as PDF
									</button>
								</div>
							</div>

							{/* Divider */}
							<div className='freq-line mb-16' aria-hidden='true' />

							{/* Report content */}
							<article
								ref={reportRef}
								className='prose-report'
								aria-label='Your Founder Frequency Report'
							>
								<ReportSection text={report} />
							</article>

							{/* Footer CTA */}
							<div className='mt-20 pt-12 border-t border-zinc-800/50 text-center'>
								<div className='freq-line mb-12' aria-hidden='true' />
								<p className='text-zinc-500 text-xs mb-6 tracking-wide'>
									Questions about your report? Reply to your receipt email.
								</p>
								<a
									href='/'
									className='text-sm text-zinc-600 hover:text-zinc-400 transition-colors'
								>
									← Back to Founder Frequency
								</a>
							</div>
						</>
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
