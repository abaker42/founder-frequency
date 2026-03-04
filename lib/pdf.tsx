/**
 * lib/pdf.tsx
 *
 * Branded PDF document for Founder Frequency reports.
 * Uses @react-pdf/renderer (server-side only).
 *
 * Brand palette:
 *   Gold     #D4A853
 *   Burgundy #7C1D3E
 *   Dark     #1a1a1a
 */

import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	renderToBuffer,
} from "@react-pdf/renderer";

// ── Brand tokens ─────────────────────────────────────────────────────────────

const GOLD = "#D4A853";
const BURGUNDY = "#7C1D3E";
const DARK = "#1a1a1a";
const MID = "#3f3f46";
const MUTED = "#71717a";
const RULE = "#e4e4e7";

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	page: {
		backgroundColor: "#ffffff",
		paddingTop: 56,
		paddingBottom: 80,
		paddingHorizontal: 60,
		fontFamily: "Helvetica",
	},
	// Header
	header: {
		marginBottom: 36,
		paddingBottom: 24,
		borderBottomWidth: 2,
		borderBottomColor: GOLD,
	},
	brandLabel: {
		fontSize: 8,
		color: GOLD,
		letterSpacing: 3,
		marginBottom: 10,
	},
	reportTitle: {
		fontSize: 22,
		fontFamily: "Helvetica-Bold",
		color: BURGUNDY,
		marginBottom: 6,
	},
	subjectName: {
		fontSize: 13,
		color: DARK,
		marginBottom: 4,
	},
	metaLine: {
		fontSize: 8,
		color: MUTED,
		letterSpacing: 1,
		marginTop: 6,
	},
	// Body typography
	h1: {
		fontSize: 17,
		fontFamily: "Helvetica-Bold",
		color: BURGUNDY,
		marginTop: 30,
		marginBottom: 8,
	},
	h2: {
		fontSize: 13,
		fontFamily: "Helvetica-Bold",
		color: DARK,
		marginTop: 22,
		marginBottom: 6,
	},
	h3: {
		fontSize: 8,
		fontFamily: "Helvetica-Bold",
		color: GOLD,
		letterSpacing: 2,
		marginTop: 16,
		marginBottom: 4,
	},
	divider: {
		borderTopWidth: 1,
		borderTopColor: RULE,
		marginTop: 22,
		marginBottom: 22,
	},
	paragraph: {
		fontSize: 10,
		color: MID,
		lineHeight: 1.75,
		marginBottom: 7,
	},
	blank: {
		height: 4,
	},
	// Footer (fixed — appears on every page)
	footer: {
		position: "absolute",
		bottom: 28,
		left: 60,
		right: 60,
		flexDirection: "row",
		justifyContent: "space-between",
		borderTopWidth: 1,
		borderTopColor: RULE,
		paddingTop: 10,
	},
	footerLeft: {
		fontSize: 8,
		color: MUTED,
	},
	footerRight: {
		fontSize: 8,
		color: GOLD,
	},
});

// ── Block parser ─────────────────────────────────────────────────────────────

type Block =
	| { type: "h1"; text: string }
	| { type: "h2"; text: string }
	| { type: "h3"; text: string }
	| { type: "divider" }
	| { type: "paragraph"; text: string }
	| { type: "blank" };

function parseBlocks(text: string): Block[] {
	const blocks: Block[] = [];
	for (const line of text.split("\n")) {
		if (line.startsWith("# ")) {
			blocks.push({ type: "h1", text: line.slice(2).trim() });
		} else if (line.startsWith("## ")) {
			blocks.push({ type: "h2", text: line.slice(3).trim() });
		} else if (line.startsWith("### ")) {
			blocks.push({ type: "h3", text: line.slice(4).trim() });
		} else if (line.startsWith("---") || line.startsWith("___")) {
			blocks.push({ type: "divider" });
		} else if (line.trim() === "") {
			blocks.push({ type: "blank" });
		} else {
			// Strip **bold** markers — PDF Text doesn't support inline bold mixing easily
			const cleaned = line.replace(/\*\*([^*]+)\*\*/g, "$1");
			blocks.push({ type: "paragraph", text: cleaned });
		}
	}
	return blocks;
}

// ── PDF Component ─────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
	insight: "Frequency Report",
	blueprint: "Full Frequency Blueprint",
};

export interface PDFProps {
	name: string;
	tier: "insight" | "blueprint";
	report: string;
	generatedDate?: string;
}

export function FounderFrequencyPDF({
	name,
	tier,
	report,
	generatedDate,
}: PDFProps) {
	const blocks = parseBlocks(report);
	const tierLabel = TIER_LABELS[tier] ?? "Frequency Report";
	const firstName = name.split(" ")[0];
	const date =
		generatedDate ??
		new Date().toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

	return (
		<Document
			title={`${tierLabel} — ${name}`}
			author="Founder Frequency"
			subject={tierLabel}
			keywords="founder frequency numerology business"
		>
			<Page size="A4" style={styles.page}>
				{/* ── Header ────────────────────────────────────────── */}
				<View style={styles.header}>
					<Text style={styles.brandLabel}>FOUNDER FREQUENCY</Text>
					<Text style={styles.reportTitle}>{tierLabel}</Text>
					<Text style={styles.subjectName}>{name}</Text>
					<Text style={styles.metaLine}>
						{tierLabel.toUpperCase()} · GENERATED {date.toUpperCase()}
					</Text>
				</View>

				{/* ── Body ──────────────────────────────────────────── */}
				{blocks.map((block, i) => {
					switch (block.type) {
						case "h1":
							return (
								<Text key={i} style={styles.h1}>
									{block.text}
								</Text>
							);
						case "h2":
							return (
								<Text key={i} style={styles.h2}>
									{block.text}
								</Text>
							);
						case "h3":
							return (
								<Text key={i} style={styles.h3}>
									{block.text}
								</Text>
							);
						case "divider":
							return <View key={i} style={styles.divider} />;
						case "blank":
							return <View key={i} style={styles.blank} />;
						case "paragraph":
							return (
								<Text key={i} style={styles.paragraph}>
									{block.text}
								</Text>
							);
						default:
							return null;
					}
				})}

				{/* ── Footer (fixed, every page) ────────────────────── */}
				<View style={styles.footer} fixed>
					<Text style={styles.footerLeft}>
						{firstName}&apos;s personal profile · Confidential
					</Text>
					<Text style={styles.footerRight}>myfounderfrequency.com</Text>
				</View>
			</Page>
		</Document>
	);
}

// ── Server helper ─────────────────────────────────────────────────────────────

/**
 * Generate a PDF Buffer from a report. Call from server-side code only.
 */
export async function generatePDFBuffer(props: PDFProps): Promise<Buffer> {
	return renderToBuffer(<FounderFrequencyPDF {...props} />) as Promise<Buffer>;
}
