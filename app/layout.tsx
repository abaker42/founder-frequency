import type { Metadata, Viewport } from "next";
import "./globals.css";

// ── SEO: Site-wide constants ─────────────────────────────────────────

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || "https://founderfrequency.com";
const SITE_NAME = "Founder Frequency";
const DEFAULT_DESCRIPTION =
	"Decode your founder frequency into strategic business intelligence. " +
	"Five ancient profiling systems — numerology, astrology, and elemental analysis — " +
	"synthesized by AI into a personalized report covering decision-making, wealth psychology, " +
	"risk tolerance, leadership style, and revenue model alignment.";

// ── Viewport (separate export in Next 14+) ───────────────────────────

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#09090b" },
		{ media: "(prefers-color-scheme: light)", color: "#09090b" },
	],
};

// ── Metadata ─────────────────────────────────────────────────────────

export const metadata: Metadata = {
	// Base URL for resolving relative OG images, canonical, etc.
	metadataBase: new URL(SITE_URL),

	// Title template: pages can set just the page name
	title: {
		default: "Founder Frequency — Decode Your Business Operating System",
		template: "%s | Founder Frequency",
	},

	description: DEFAULT_DESCRIPTION,

	// Keywords — long-tail founder/entrepreneur + system terms
	keywords: [
		"founder personality report",
		"entrepreneur business intelligence",
		"numerology business report",
		"founder decision-making psychology",
		"business astrology profile",
		"life path number business",
		"expression number wealth",
		"startup founder personality test",
		"founder risk tolerance",
		"leadership style assessment",
		"revenue model alignment",
		"business blind spots",
		"founder burnout prevention",
		"entrepreneur self-assessment",
		"solopreneur strategy",
		"AI business report",
	],

	authors: [{ name: SITE_NAME, url: SITE_URL }],
	creator: SITE_NAME,
	publisher: SITE_NAME,

	// Canonical + alternate (add locales as you expand)
	alternates: {
		canonical: "/",
		// languages: { 'es': '/es' },  // uncomment when adding locales
	},

	// Crawl directives
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},

	// ── Open Graph ───────────────────────────────────────────────────
	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: "Founder Frequency — Decode Your Business Operating System",
		description:
			"Five profiling systems. One AI engine. A report so specific to your psychology, " +
			"you'll wonder how you built anything without it.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Founder Frequency — Strategic Business Intelligence Report",
				type: "image/png",
			},
		],
	},

	// ── Twitter / X ──────────────────────────────────────────────────
	twitter: {
		card: "summary_large_image",
		title: "Founder Frequency — Decode Your Business Operating System",
		description:
			"Your founder frequency decoded into strategic business intelligence. " +
			"5 channels. One report. Zero guesswork.",
		images: ["/og-image.png"],
		// creator: '@YourHandle',  // add your X handle
		// site: '@FounderFreq',
	},

	// ── Verification (add keys when you register) ────────────────────
	// verification: {
	//   google: 'your-google-site-verification',
	//   yandex: 'your-yandex-verification',
	//   other: { 'msvalidate.01': 'your-bing-verification' },
	// },

	// ── App / Manifest ───────────────────────────────────────────────
	manifest: "/manifest.json",

	// ── Misc ─────────────────────────────────────────────────────────
	category: "business",
	classification: "Business Intelligence",
};

// ── Layout Component ─────────────────────────────────────────────────

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' className='dark scroll-smooth' dir='ltr'>
			<head>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='anonymous'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600;700&display=swap'
					rel='stylesheet'
				/>
				{/* Geo meta tags — US-based business */}
				<meta name='geo.region' content='US' />
				<meta name='geo.placename' content='United States' />
				<meta name='ICBM' content='39.8283, -98.5795' />{" "}
				{/* US geographic center */}
				{/* Content language signal */}
				<meta httpEquiv='content-language' content='en-US' />
			</head>
			<body className='bg-zinc-950 text-zinc-100 font-body antialiased'>
				{children}
			</body>
		</html>
	);
}