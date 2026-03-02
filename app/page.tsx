"use client";

import { useState, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────

interface CalculatorResult {
	firstName: string;
	summary: {
		life_path: number;
		birthday: string;
		expression: number;
		soul_urge: number;
		personality: number;
		western: string;
		chinese: string;
	};
	teaser: {
		headline: string;
		body: string;
		tensionCount: number;
		amplificationCount: number;
		hasMasterNumber: boolean;
		hasKarmicDebt: boolean;
	};
}

// ── JSON-LD Structured Data ──────────────────────────────────────────

const SITE_URL = "https://founderfrequency.com";

const jsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		// WebSite — enables sitelinks search box in Google
		{
			"@type": "WebSite",
			"@id": `${SITE_URL}/#website`,
			url: SITE_URL,
			name: "Founder Frequency",
			description:
				"Decode your founder frequency into strategic business intelligence using numerology, astrology, and AI.",
			inLanguage: "en-US",
			potentialAction: {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: `${SITE_URL}/?q={search_term_string}`,
				},
				"query-input": "required name=search_term_string",
			},
		},
		// Organization
		{
			"@type": "Organization",
			"@id": `${SITE_URL}/#organization`,
			name: "Founder Frequency",
			url: SITE_URL,
			logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
			description:
				"AI-powered business intelligence reports for entrepreneurs and founders, " +
				"synthesizing numerological and astrological profiling into actionable strategy.",
			areaServed: { "@type": "Country", name: "US" },
			serviceType: "Business Intelligence Report",
		},
		// Product — Frequency Report ($33)
		{
			"@type": "Product",
			"@id": `${SITE_URL}/#product-insight`,
			name: "Founder Frequency Report",
			description:
				"A 10–14 page strategic business intelligence report covering decision-making frequency, " +
				"wealth psychology, risk tolerance, leadership style, scaling patterns, blind spots, " +
				"and revenue model alignment. Personalized to your unique numerological and astrological profile.",
			brand: { "@type": "Brand", name: "Founder Frequency" },
			offers: {
				"@type": "Offer",
				price: "33.00",
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				url: `${SITE_URL}/#pricing`,
			},
			category: "Business Intelligence",
			audience: {
				"@type": "Audience",
				audienceType: "Entrepreneurs, Founders, Solopreneurs",
			},
		},
		// Product — Full Blueprint ($88)
		{
			"@type": "Product",
			"@id": `${SITE_URL}/#product-blueprint`,
			name: "Full Frequency Blueprint",
			description:
				"A 22–28 page comprehensive strategic blueprint with 11 chapters including burnout prevention, " +
				"partnership compatibility matrix, 90-day action plan, and quarterly frequency forecast. " +
				"The complete founder intelligence system.",
			brand: { "@type": "Brand", name: "Founder Frequency" },
			offers: {
				"@type": "Offer",
				price: "88.00",
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				url: `${SITE_URL}/#pricing`,
			},
			category: "Business Intelligence",
			audience: {
				"@type": "Audience",
				audienceType: "Entrepreneurs, Founders, Solopreneurs",
			},
		},
		// FAQPage — rich snippet eligible
		{
			"@type": "FAQPage",
			"@id": `${SITE_URL}/#faq`,
			mainEntity: [
				{
					"@type": "Question",
					name: "How is Founder Frequency different from a horoscope or personality quiz?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Horoscopes give everyone born in the same month the same reading. Personality quizzes rely on self-reported data. Founder Frequency synthesizes five independent profiling systems — numerological, astrological, and elemental — into a unique combination specific to your exact name and birthdate. Every trait is tied to a concrete business behavior, not a vague personality label.",
					},
				},
				{
					"@type": "Question",
					name: "What is the difference between the $33 and $88 report?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "The Frequency Report ($33) is a strategic snapshot with 7 chapters covering core decision-making, wealth, risk, and leadership patterns. The Full Blueprint ($88) goes deeper with 11 chapters, adding burnout cycle analysis, partnership compatibility matrix, a 90-day action plan, and quarterly energy forecast.",
					},
				},
				{
					"@type": "Question",
					name: "How long does it take to get my Founder Frequency report?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Under 2 minutes. After payment, your unique frequency profile is calculated and your personalized report is generated in real-time by an advanced AI engine.",
					},
				},
				{
					"@type": "Question",
					name: "Why do you need my birth name for the numerology report?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Numerological calculations use the vibrational frequency of your birth name — the name given at birth. It represents your foundational frequency, while your current name represents your adapted frequency.",
					},
				},
				{
					"@type": "Question",
					name: "Is my personal data stored or shared?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Your name and date of birth are used solely to generate your report. We do not store personal information after delivery and never share it with third parties.",
					},
				},
				{
					"@type": "Question",
					name: "Why are the prices $33, $88, and $11?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "33, 88, and 11 are significant numbers in numerology. 33 is the Master Teacher, 88 is the Power Builder doubled, and 11 is the Intuitive Visionary — each reflects the energy of its tier.",
					},
				},
			],
		},
	],
};

// ── Reusable Components ──────────────────────────────────────────────

function FrequencyWave({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox='0 0 1200 120'
			className={`w-full ${className}`}
			preserveAspectRatio='none'
			fill='none'
			role='img'
			aria-hidden='true'
		>
			<path
				d='M0 60 Q150 20 300 60 Q450 100 600 60 Q750 20 900 60 Q1050 100 1200 60'
				stroke='url(#waveGrad)'
				strokeWidth='1'
				opacity='0.4'
			/>
			<path
				d='M0 60 Q100 35 200 60 Q300 85 400 60 Q500 35 600 60 Q700 85 800 60 Q900 35 1000 60 Q1100 85 1200 60'
				stroke='url(#waveGrad)'
				strokeWidth='0.5'
				opacity='0.2'
			/>
			<defs>
				<linearGradient
					id='waveGrad'
					x1='0'
					y1='0'
					x2='1200'
					y2='0'
					gradientUnits='userSpaceOnUse'
				>
					<stop offset='0%' stopColor='transparent' />
					<stop offset='30%' stopColor='#D4A853' />
					<stop offset='50%' stopColor='#E8C97A' />
					<stop offset='70%' stopColor='#D4A853' />
					<stop offset='100%' stopColor='transparent' />
				</linearGradient>
			</defs>
		</svg>
	);
}

function ChannelBadge({
	label,
	value,
	delay,
}: {
	label: string;
	value: string | number;
	delay: number;
}) {
	return (
		<div
			className='opacity-0 animate-decode flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50'
			style={{ animationDelay: `${delay}ms` }}
			role='listitem'
		>
			<span className='text-xs font-medium tracking-widest uppercase text-zinc-400'>
				{label}
			</span>
			<span className='font-display text-brand-gold text-lg'>{value}</span>
		</div>
	);
}

function Divider() {
	return (
		<div className='py-12' aria-hidden='true'>
			<div className='freq-line max-w-xl mx-auto' />
		</div>
	);
}

function Check() {
	return (
		<svg
			className='w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5'
			viewBox='0 0 16 16'
			fill='currentColor'
			aria-hidden='true'
		>
			<path d='M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z' />
		</svg>
	);
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
	const [open, setOpen] = useState(false);
	const id = question.replace(/\s+/g, "-").toLowerCase().slice(0, 40);

	return (
		<div className='border-b border-zinc-800/80'>
			<h3>
				<button
					onClick={() => setOpen(!open)}
					className='w-full flex items-center justify-between py-5 text-left group'
					aria-expanded={open}
					aria-controls={`faq-${id}`}
				>
					<span className='font-body text-zinc-200 font-medium pr-8 group-hover:text-brand-gold-light transition-colors'>
						{question}
					</span>
					<span
						className={`text-brand-gold transition-transform duration-300 text-xl leading-none ${open ? "rotate-45" : ""}`}
						aria-hidden='true'
					>
						+
					</span>
				</button>
			</h3>
			<div
				id={`faq-${id}`}
				role='region'
				aria-labelledby={`faq-${id}`}
				className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 pb-5" : "max-h-0"}`}
			>
				<p className='text-zinc-400 text-sm leading-relaxed'>{answer}</p>
			</div>
		</div>
	);
}

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════

export default function Home() {
	const [name, setName] = useState("");
	const [dob, setDob] = useState("");
	const [result, setResult] = useState<CalculatorResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const calculatorRef = useRef<HTMLElement>(null);
	const resultRef = useRef<HTMLDivElement>(null);

	const handleCalculate = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setResult(null);
		setLoading(true);

		try {
			const res = await fetch("/api/calculate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, dob }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong.");
			}

			const data: CalculatorResult = await res.json();
			setResult(data);

			setTimeout(() => {
				resultRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 200);
		} catch (err: any) {
			setError(
				err.message || "Invalid input. Check your name and date format.",
			);
		} finally {
			setLoading(false);
		}
	};

	const scrollToCalculator = () => {
		calculatorRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	};

	return (
		<>
			{/* ── JSON-LD Structured Data ───────────────────────────── */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* ── Skip to main content (accessibility) ─────────────── */}
			<a
				href='#main'
				className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-gold focus:text-zinc-950 focus:rounded'
			>
				Skip to main content
			</a>

			{/* ── Navigation ──────────────────────────────────────────── */}
			<header className='fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50'>
				<nav
					className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'
					aria-label='Primary navigation'
				>
					<a
						href='/'
						className='flex items-center gap-2'
						aria-label='Founder Frequency home'
					>
						<div
							className='w-2 h-2 rounded-full bg-brand-gold animate-pulse-glow'
							aria-hidden='true'
						/>
						<span className='font-display text-lg tracking-tight'>
							Founder<span className='text-brand-gold'>Frequency</span>
						</span>
					</a>
					<button
						onClick={scrollToCalculator}
						className='text-sm font-medium text-brand-gold hover:text-brand-gold-light transition-colors tracking-wide uppercase'
						aria-label='Scroll to free frequency calculator'
					>
						Decode Yours →
					</button>
				</nav>
			</header>

			<main id='main'>
				{/* ── Hero ────────────────────────────────────────────── */}
				<section
					className='relative pt-32 pb-16 px-6 noise-overlay overflow-hidden'
					aria-labelledby='hero-heading'
				>
					{/* Background ambient glows */}
					<div
						className='absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-burgundy/10 rounded-full blur-[120px] pointer-events-none'
						aria-hidden='true'
					/>
					<div
						className='absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none'
						aria-hidden='true'
					/>

					<div className='max-w-4xl mx-auto text-center relative z-10'>
						<p className='opacity-0 animate-fade-in text-xs font-body font-semibold tracking-[0.3em] uppercase text-brand-gold mb-6'>
							Strategic Business Intelligence for Entrepreneurs
						</p>

						<h1
							id='hero-heading'
							className='opacity-0 animate-fade-in-up delay-100 font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.1] tracking-tight mb-8'
						>
							Your business decisions
							<br />
							run on a frequency
							<br />
							<span className='text-gradient-gold italic'>
								you&apos;ve never decoded
							</span>
						</h1>

						<p className='opacity-0 animate-fade-in-up delay-300 font-body text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light'>
							Five ancient profiling systems — numerology, astrology, and
							elemental analysis — synthesized by AI into a personalized
							business intelligence report. Decision-making psychology, wealth
							patterns, risk tolerance, leadership style, and revenue alignment
							decoded from your name and birthday.
						</p>

						<div className='opacity-0 animate-fade-in-up delay-500 flex flex-col sm:flex-row items-center justify-center gap-4'>
							<button
								onClick={scrollToCalculator}
								className='px-8 py-4 bg-brand-gold text-zinc-950 font-body font-semibold rounded-lg hover:bg-brand-gold-light transition-all duration-300 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25 text-sm tracking-wide uppercase'
							>
								Free Founder Frequency Scan
							</button>
							<a
								href='#pricing'
								className='text-sm text-zinc-500 hover:text-zinc-300 font-medium tracking-wide transition-colors'
							>
								View report pricing →
							</a>
						</div>
					</div>

					<div className='mt-20 opacity-0 animate-fade-in-slow delay-700'>
						<FrequencyWave className='h-16 opacity-40' />
					</div>
				</section>

				{/* ── Trust Signals Bar ──────────────────────────────────── */}
				<section
					className='border-y border-zinc-800/50 bg-zinc-950/50'
					aria-label='Key facts'
				>
					<div className='max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs tracking-widest uppercase text-zinc-500'>
						<span>5 Profiling Systems</span>
						<span className='text-brand-gold/40' aria-hidden='true'>
							◆
						</span>
						<span>Numerology × Astrology × AI</span>
						<span className='text-brand-gold/40' aria-hidden='true'>
							◆
						</span>
						<span>Personalized to Your Name &amp; Birthday</span>
						<span className='text-brand-gold/40' aria-hidden='true'>
							◆
						</span>
						<span>15–28 Page Reports</span>
					</div>
				</section>

				{/* ── Calculator Widget ───────────────────────────────────── */}
				<section
					ref={calculatorRef}
					id='calculator'
					className='relative py-24 px-6'
					aria-labelledby='calc-heading'
				>
					<div
						className='absolute inset-0 bg-gradient-to-b from-transparent via-brand-burgundy-dark/5 to-transparent pointer-events-none'
						aria-hidden='true'
					/>

					<div className='max-w-xl mx-auto relative z-10'>
						<div className='text-center mb-12'>
							<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-3'>
								Free Founder Personality Calculator
							</p>
							<h2
								id='calc-heading'
								className='font-display text-3xl sm:text-4xl font-medium tracking-tight mb-3'
							>
								What&apos;s your founder frequency?
							</h2>
							<p className='text-zinc-500 text-sm'>
								Enter your full birth name and date of birth. 60 seconds to your
								frequency profile.
							</p>
						</div>

						<form
							onSubmit={handleCalculate}
							className='space-y-4'
							aria-label='Founder frequency calculator'
						>
							<div>
								<label
									htmlFor='calc-name'
									className='block text-xs tracking-widest uppercase text-zinc-500 mb-2 font-medium'
								>
									Full Birth Name
								</label>
								<input
									id='calc-name'
									type='text'
									required
									autoComplete='name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder='Anthony Baker'
									className='w-full px-4 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-100 font-body placeholder:text-zinc-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all'
								/>
							</div>

							<div>
								<label
									htmlFor='calc-dob'
									className='block text-xs tracking-widest uppercase text-zinc-500 mb-2 font-medium'
								>
									Date of Birth
								</label>
								<input
									id='calc-dob'
									type='text'
									required
									inputMode='numeric'
									value={dob}
									onChange={(e) => setDob(e.target.value)}
									placeholder='MM/DD/YYYY'
									className='w-full px-4 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-100 font-body placeholder:text-zinc-600 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all'
								/>
							</div>

							{error && (
								<div
									role='alert'
									className='text-sm text-red-400 bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-2.5'
								>
									{error}
								</div>
							)}

							<button
								type='submit'
								disabled={loading}
								className='w-full py-4 bg-brand-gold text-zinc-950 font-semibold rounded-lg hover:bg-brand-gold-light transition-all duration-300 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25 text-sm tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{loading ? (
									<span className='flex items-center justify-center gap-2'>
										<svg
											className='animate-spin h-4 w-4'
											viewBox='0 0 24 24'
											aria-hidden='true'
										>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'
												fill='none'
											/>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
											/>
										</svg>
										Decoding your frequency...
									</span>
								) : (
									"Decode My Founder Frequency"
								)}
							</button>
						</form>

						{/* ── Calculator Results ─────────────────────────────── */}
						{result && (
							<div
								ref={resultRef}
								className='mt-10 space-y-6'
								aria-live='polite'
							>
								<div className='text-center opacity-0 animate-fade-in-up'>
									<p className='font-display text-2xl sm:text-3xl tracking-tight mb-2'>
										{result.firstName}, your founder frequency is
									</p>
									<p className='font-display text-4xl sm:text-5xl text-gradient-gold font-medium tracking-tight'>
										{result.summary.life_path}–{result.summary.expression}–
										{result.summary.western.split(" ")[0]}
									</p>
								</div>

								{/* 5 frequency channels */}
								<div
									className='space-y-2 mt-8'
									role='list'
									aria-label='Your five frequency channels'
								>
									<ChannelBadge
										label='Life Path Frequency'
										value={result.summary.life_path}
										delay={200}
									/>
									<ChannelBadge
										label='Birthday Imprint'
										value={result.summary.birthday}
										delay={350}
									/>
									<ChannelBadge
										label='Expression Frequency'
										value={result.summary.expression}
										delay={500}
									/>
									<ChannelBadge
										label='Western Zodiac'
										value={result.summary.western}
										delay={650}
									/>
									<ChannelBadge
										label='Chinese Zodiac'
										value={result.summary.chinese}
										delay={800}
									/>
								</div>

								{/* Special badges */}
								{(result.teaser.hasMasterNumber ||
									result.teaser.hasKarmicDebt ||
									result.teaser.tensionCount > 0) && (
									<div
										className='flex flex-wrap justify-center gap-2 opacity-0 animate-fade-in delay-700 pt-2'
										aria-label='Profile markers'
									>
										{result.teaser.hasMasterNumber && (
											<span className='px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full'>
												Master Number Carrier
											</span>
										)}
										{result.teaser.hasKarmicDebt && (
											<span className='px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-brand-burgundy/20 text-brand-burgundy-light border border-brand-burgundy/30 rounded-full'>
												Karmic Debt Detected
											</span>
										)}
										{result.teaser.tensionCount > 0 && (
											<span className='px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full'>
												{result.teaser.tensionCount} Active Tension
												{result.teaser.tensionCount > 1 ? "s" : ""}
											</span>
										)}
									</div>
								)}

								{/* Teaser paragraph */}
								<div className='opacity-0 animate-fade-in-up delay-800 mt-6 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/60'>
									<p className='text-zinc-300 text-sm leading-relaxed'>
										{result.teaser.body}
									</p>
								</div>

								{/* Upsell CTA */}
								<div className='opacity-0 animate-fade-in-up delay-800 text-center pt-4'>
									<p className='text-zinc-500 text-xs mb-4 tracking-wide'>
										This is the surface. The full report goes 15–28 pages deep
										into your business psychology.
									</p>
									<a
										href='#pricing'
										className='inline-flex items-center gap-2 px-8 py-4 bg-brand-gold text-zinc-950 font-semibold rounded-lg hover:bg-brand-gold-light transition-all duration-300 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25 text-sm tracking-wide uppercase'
									>
										Get Your Full Founder Report
									</a>
								</div>
							</div>
						)}
					</div>
				</section>

				<Divider />

				{/* ── How It Works ────────────────────────────────────────── */}
				<section className='py-16 px-6' aria-labelledby='how-heading'>
					<div className='max-w-5xl mx-auto'>
						<div className='text-center mb-16'>
							<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-3'>
								How It Works
							</p>
							<h2
								id='how-heading'
								className='font-display text-3xl sm:text-4xl font-medium tracking-tight'
							>
								Three inputs. Five systems. One founder frequency.
							</h2>
						</div>

						<div className='grid md:grid-cols-3 gap-8'>
							{[
								{
									step: "01",
									title: "Enter Your Name & Birthday",
									desc: "Your full birth name and date of birth are the raw signal. No quizzes, no personality tests, no self-reported data that skews the result.",
								},
								{
									step: "02",
									title: "Five Profiling Systems Converge",
									desc: "Life Path number, Birthday Imprint, Expression number, Western Zodiac, and Chinese Zodiac — cross-referenced and checked for tensions, amplifications, and karmic patterns.",
								},
								{
									step: "03",
									title: "AI Decodes Your Frequency",
									desc: "An advanced AI engine synthesizes your unique combination into strategic business intelligence — decision psychology, wealth frequency, risk profile, leadership mode, blind spots, and revenue alignment.",
								},
							].map((item) => (
								<article key={item.step} className='group'>
									<span
										className='font-display text-5xl text-brand-gold/15 font-medium block mb-4 group-hover:text-brand-gold/30 transition-colors'
										aria-hidden='true'
									>
										{item.step}
									</span>
									<h3 className='font-display text-xl font-medium mb-3 tracking-tight'>
										{item.title}
									</h3>
									<p className='text-zinc-500 text-sm leading-relaxed'>
										{item.desc}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<Divider />

				{/* ── What's Inside the Report ─────────────────────────────── */}
				<section className='py-16 px-6' aria-labelledby='chapters-heading'>
					<div className='max-w-5xl mx-auto'>
						<div className='text-center mb-16'>
							<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-3'>
								Report Chapters
							</p>
							<h2
								id='chapters-heading'
								className='font-display text-3xl sm:text-4xl font-medium tracking-tight'
							>
								Not astrology. Not a personality quiz.
							</h2>
							<p className='text-zinc-500 mt-3 max-w-xl mx-auto text-sm'>
								Applied strategic intelligence for entrepreneurs — every trait
								tied to a concrete business behavior, decision pattern, or
								revenue model you&apos;ll recognize immediately.
							</p>
						</div>

						<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
							{[
								{
									title: "Decision-Making Frequency",
									desc: "How you actually make choices under pressure — your primary decision loop, override pattern, and the speed modifier you don't see.",
								},
								{
									title: "Wealth Frequency",
									desc: "Your money psychology decoded — earning style, spending patterns, and the financial belief that's costing you the most.",
								},
								{
									title: "Risk Tolerance Profile",
									desc: 'Dual-channel risk analysis with a scenario matrix. Not "you\'re a risk-taker" — real specifics for real decisions.',
								},
								{
									title: "Leadership Mode",
									desc: "Your default leadership frequency, how it shifts under pressure, and your delegation blind spot. Named and specific.",
								},
								{
									title: "Scaling Pattern",
									desc: "Where your frequency naturally stalls growth — and the exact partner type that breaks through the plateau.",
								},
								{
									title: "Blind Spot Analysis",
									desc: "The business mistakes your profile is wired to make, repeatedly. Named, specific, and uncomfortable.",
								},
								{
									title: "Revenue Model Alignment",
									desc: "Which business models your founder frequency is built for — and which ones will drain you dry.",
								},
								{
									title: "Burnout Cycle Prevention",
									desc: "Your 5-phase burnout pattern mapped to specific triggers and recovery windows. Prevention, not recovery.",
									premium: true,
								},
							].map((item) => (
								<article
									key={item.title}
									className='card-glow p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 relative'
								>
									{item.premium && (
										<span className='absolute top-3 right-3 text-[10px] font-bold tracking-widest uppercase text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full'>
											Blueprint Only
										</span>
									)}
									<h3 className='font-display text-base font-medium mb-2 tracking-tight'>
										{item.title}
									</h3>
									<p className='text-zinc-500 text-xs leading-relaxed'>
										{item.desc}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<Divider />

				{/* ── Pricing ─────────────────────────────────────────────── */}
				<section
					id='pricing'
					className='relative py-24 px-6'
					aria-labelledby='pricing-heading'
				>
					<div
						className='absolute inset-0 bg-gradient-to-b from-transparent via-brand-burgundy-dark/5 to-transparent pointer-events-none'
						aria-hidden='true'
					/>

					<div className='max-w-5xl mx-auto relative z-10'>
						<div className='text-center mb-16'>
							<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-3'>
								Pricing
							</p>
							<h2
								id='pricing-heading'
								className='font-display text-3xl sm:text-4xl font-medium tracking-tight'
							>
								Two static snapshots. One living system.
							</h2>
							<p className='text-zinc-500 mt-3 text-sm'>
								The Report and Blueprint are maps — you own them forever. The Circle is a GPS that recalculates every month.
							</p>
						</div>

						<div className='grid md:grid-cols-3 gap-6 items-start'>
							{/* ── Frequency Report $33 ──────────────────────────── */}
							<article
								className='card-glow rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8'
								aria-labelledby='tier-insight'
							>
								<p className='text-xs font-semibold tracking-[0.25em] uppercase text-zinc-400 mb-1'>
									Frequency Report
								</p>
								<div className='flex items-baseline gap-1 mb-1'>
									<span
										id='tier-insight'
										className='font-display text-4xl text-zinc-100 font-medium'
									>
										$33
									</span>
									<span className='text-zinc-600 text-sm'>one-time</span>
								</div>
								<p className='text-xs text-zinc-600 mb-6'>
									Master Number 33 — the Master Teacher
								</p>

								<div className='freq-line mb-6' aria-hidden='true' />

								<p className='text-sm text-zinc-300 mb-5 font-medium'>
									10–14 pages. Answers:{" "}
									<em className='text-brand-gold font-display'>
										&ldquo;What am I?&rdquo;
									</em>
								</p>

								<ul
									className='space-y-3 mb-8'
									aria-label='Frequency Report features'
								>
									{[
										"Executive Founder Profile Snapshot",
										"7 core chapters (400–600 words each)",
										"Decision-making psychology analysis",
										"Wealth & risk frequency profile",
										"Leadership & scaling patterns",
										"2 named blind spots with business cost",
										"Top 3 aligned revenue models",
									].map((f) => (
										<li
											key={f}
											className='flex items-start gap-2.5 text-sm text-zinc-400'
										>
											<Check /> {f}
										</li>
									))}
								</ul>

								<button
									className='w-full py-3.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold text-sm tracking-wide uppercase hover:border-brand-gold/40 hover:text-brand-gold transition-all'
									aria-label='Purchase Frequency Report for $33'
								>
									Get Frequency Report
								</button>
							</article>

							{/* ── Full Blueprint $88 (featured) ────────────────── */}
							<article
								className='card-glow rounded-2xl border border-brand-gold/30 bg-zinc-900/50 p-8 relative shadow-lg shadow-brand-gold/5 md:-mt-4'
								aria-labelledby='tier-blueprint'
							>
								<div className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-gold text-zinc-950 text-[10px] font-bold tracking-widest uppercase rounded-full'>
									Most Popular
								</div>

								<p className='text-xs font-semibold tracking-[0.25em] uppercase text-brand-gold mb-1 mt-2'>
									Full Frequency Blueprint
								</p>
								<div className='flex items-baseline gap-1 mb-1'>
									<span
										id='tier-blueprint'
										className='font-display text-4xl text-zinc-100 font-medium'
									>
										$88
									</span>
									<span className='text-zinc-600 text-sm'>one-time</span>
								</div>
								<p className='text-xs text-zinc-600 mb-6'>
									Double 8 — the Power Builder, doubled
								</p>

								<div className='freq-line mb-6' aria-hidden='true' />

								<p className='text-sm text-zinc-300 mb-5 font-medium'>
									22–28 pages. Answers:{" "}
									<em className='text-brand-gold font-display'>
										&ldquo;What do I do about it?&rdquo;
									</em>
								</p>

								<ul
									className='space-y-3 mb-8'
									aria-label='Full Blueprint features'
								>
									{[
										"Everything in Frequency Report (deeper)",
										"11 chapters (900–1,200 words each)",
										"Full risk matrix (8 business scenarios)",
										"Revenue model alignment table",
										'"Uncomfortable truth" insight boxes',
										"Burnout frequency cycle (5 phases)",
										"Partnership compatibility matrix",
										"90-day strategic action plan",
										"Quarterly frequency forecast",
									].map((f) => (
										<li
											key={f}
											className='flex items-start gap-2.5 text-sm text-zinc-300'
										>
											<Check /> {f}
										</li>
									))}
								</ul>

								<button
									className='w-full py-3.5 rounded-lg bg-brand-gold text-zinc-950 font-semibold text-sm tracking-wide uppercase hover:bg-brand-gold-light transition-all shadow-lg shadow-brand-gold/10'
									aria-label='Purchase Full Frequency Blueprint for $88'
								>
									Get Full Blueprint
								</button>
							</article>

							{/* ── Frequency Circle $11/mo ─────────────────── */}
							<article
								className='card-glow rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8 relative'
								aria-labelledby='tier-circle'
							>
								<div className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-bold tracking-widest uppercase rounded-full border border-zinc-700'>
									Living System
								</div>

								<p className='text-xs font-semibold tracking-[0.25em] uppercase text-zinc-400 mb-1 mt-2'>
									Frequency Circle
								</p>
								<div className='flex items-baseline gap-1 mb-1'>
									<span
										id='tier-circle'
										className='font-display text-4xl text-zinc-100 font-medium'
									>
										$11
									</span>
									<span className='text-zinc-600 text-sm'>/month</span>
								</div>
								<p className='text-xs text-zinc-600 mb-6'>
									Master Number 11 — the Intuitive Visionary
								</p>

								<div className='freq-line mb-6' aria-hidden='true' />

								<p className='text-sm text-zinc-300 mb-5 font-medium'>
									Not a cheaper report.{' '}
									<em className='text-brand-gold font-display'>
										A GPS that recalculates every month.
									</em>
								</p>

								<ul
									className='space-y-3 mb-8'
									aria-label='Frequency Circle features'
								>
									{[
										'Frequency Dashboard — your profile, evolving',
										'Month 1: Core 5-channel profile + quarter forecast',
										'Monthly 2–3 page contextual intelligence briefs',
										'New strategic depth unlocked each month',
										'Quarterly forecast recalculated every cycle',
										'Time-stamped to your Personal Month energy',
										'Cancel anytime — content is tied to membership',
									].map((f) => (
										<li
											key={f}
											className='flex items-start gap-2.5 text-sm text-zinc-400'
										>
											<Check /> {f}
										</li>
									))}
								</ul>

								<button
									className='w-full py-3.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold text-sm tracking-wide uppercase hover:border-brand-gold/40 hover:text-brand-gold transition-all'
									aria-label='Subscribe to Frequency Circle for $11 per month'
								>
									Join the Circle
								</button>
							</article>
						</div>

						<p className='text-center text-zinc-600 text-xs mt-8'>
						Already have the Report? Upgrade to the Blueprint for $55 (pay the difference) — depth on a different axis. Or join the Circle for intelligence that never stops evolving.
					</p>
					</div>
				</section>

				<Divider />

				{/* ── FAQ (rich snippet eligible via JSON-LD) ──────────────── */}
				<section className='py-16 px-6' aria-labelledby='faq-heading'>
					<div className='max-w-2xl mx-auto'>
						<div className='text-center mb-12'>
							<p className='text-xs font-semibold tracking-[0.3em] uppercase text-brand-gold mb-3'>
								Frequently Asked Questions
							</p>
							<h2
								id='faq-heading'
								className='font-display text-3xl font-medium tracking-tight'
							>
								Before you decide
							</h2>
						</div>

						<div>
							<FAQItem
								question='How is Founder Frequency different from a horoscope or personality quiz?'
								answer="Horoscopes give everyone born in the same month the same reading. Personality quizzes rely on self-reported data (which is biased). Founder Frequency synthesizes five independent profiling systems — numerological, astrological, and elemental — into a unique combination that's specific to your exact name and birthdate. Every trait is tied to a concrete business behavior, not a vague personality label."
							/>
							<FAQItem
								question='Why do you need my birth name instead of my current name?'
								answer="Numerological calculations are based on the vibrational frequency of your birth name — the name given to you at birth. If you've changed your name, the birth name represents your foundational frequency (nature), while your current name represents your adapted frequency (nurture). The report analyzes the foundational layer."
							/>
							<FAQItem
								question="What's the difference between the $33 Frequency Report and the $88 Full Blueprint?"
								answer='The Frequency Report ($33) is a strategic snapshot — 7 chapters covering your core decision-making, wealth, risk, and leadership patterns. The Full Blueprint ($88) goes deeper with 11 chapters, adding your burnout cycle, partnership compatibility matrix, a 90-day action plan tailored to your profile, and a quarterly energy forecast. If you want to know what you are, get the Report. If you want to know what to do about it, get the Blueprint.'
							/>
							<FAQItem
								question='How long does it take to receive my founder report?'
								answer="Under 2 minutes. After payment, your unique frequency profile is calculated and your personalized report is generated in real-time by an advanced AI engine. You'll receive a professional PDF via email and can also download it immediately."
							/>
							<FAQItem
								question='Is my personal data stored or shared?'
								answer="Your name and date of birth are used solely to generate your report. We don't store your personal information after delivery and never share it with third parties. Privacy is non-negotiable."
							/>
							<FAQItem
								question='Why are the prices $33, $88, and $11?'
								answer='33, 88, and 11 are all significant numbers in numerology. 33 is the Master Teacher — perfect for a report that teaches you your own patterns. 88 is the Power Builder doubled — the energy of building something substantial. 11 is the Intuitive Visionary — the frequency of ongoing insight. Every detail in this system is intentional.'
							/>
						</div>
					</div>
				</section>

				<Divider />

				{/* ── Final CTA ───────────────────────────────────────────── */}
				<section className='py-24 px-6 relative' aria-labelledby='cta-heading'>
					<div
						className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none'
						aria-hidden='true'
					/>

					<div className='max-w-2xl mx-auto text-center relative z-10'>
						<h2
							id='cta-heading'
							className='font-display text-3xl sm:text-4xl font-medium tracking-tight mb-4'
						>
							Your founder frequency is already running.
							<br />
							<span className='text-gradient-gold italic'>Now decode it.</span>
						</h2>
						<p className='text-zinc-500 text-sm mb-8 max-w-md mx-auto'>
							Every business decision you make, every risk you take, every
							dollar you earn — it all runs on a pattern. The only question is
							whether you can see it.
						</p>
						<button
							onClick={scrollToCalculator}
							className='px-10 py-4 bg-brand-gold text-zinc-950 font-semibold rounded-lg hover:bg-brand-gold-light transition-all duration-300 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25 text-sm tracking-wide uppercase'
							aria-label='Scroll to free founder frequency calculator'
						>
							Start Free Frequency Scan
						</button>
					</div>
				</section>
			</main>

			{/* ── Footer ──────────────────────────────────────────────── */}
			<footer
				className='border-t border-zinc-800/50 py-10 px-6'
				role='contentinfo'
			>
				<div className='max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
					<a
						href='/'
						className='flex items-center gap-2'
						aria-label='Founder Frequency home'
					>
						<div
							className='w-1.5 h-1.5 rounded-full bg-brand-gold/60'
							aria-hidden='true'
						/>
						<span className='font-display text-sm text-zinc-500'>
							Founder<span className='text-brand-gold/60'>Frequency</span>
						</span>
					</a>
					<p className='text-xs text-zinc-700'>
						&copy; {new Date().getFullYear()} Founder Frequency. Strategic
						business intelligence for entrepreneurs.
					</p>
				</div>
			</footer>
		</>
	);
}