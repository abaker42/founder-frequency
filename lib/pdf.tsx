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
	// ── Table ─────────────────────────────────────────────────────────────────
	tableWrapper: {
		marginTop: 14,
		marginBottom: 18,
		borderWidth: 1,
		borderColor: RULE,
	},
	tableHeaderRow: {
		flexDirection: "row",
		backgroundColor: "#f4f4f5",
		borderBottomWidth: 1,
		borderBottomColor: RULE,
	},
	tableHeaderCell: {
		flex: 1,
		paddingVertical: 6,
		paddingHorizontal: 7,
		borderRightWidth: 1,
		borderRightColor: RULE,
	},
	tableHeaderText: {
		fontSize: 8,
		fontFamily: "Helvetica-Bold",
		color: DARK,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: RULE,
	},
	tableRowAlt: {
		backgroundColor: "#fafafa",
	},
	tableCell: {
		flex: 1,
		paddingVertical: 5,
		paddingHorizontal: 7,
		borderRightWidth: 1,
		borderRightColor: RULE,
	},
	tableCellText: {
		fontSize: 9,
		color: MID,
		lineHeight: 1.5,
	},
	// ── Callout box ───────────────────────────────────────────────────────────
	calloutBox: {
		marginTop: 14,
		marginBottom: 14,
		paddingVertical: 11,
		paddingHorizontal: 13,
		borderLeftWidth: 3,
		borderLeftColor: GOLD,
		backgroundColor: "#fffdf5",
	},
	calloutLabel: {
		fontSize: 7,
		fontFamily: "Helvetica-Bold",
		color: GOLD,
		letterSpacing: 2,
		marginBottom: 5,
	},
	calloutText: {
		fontSize: 10,
		fontFamily: "Helvetica-Bold",
		color: DARK,
		lineHeight: 1.65,
	},
	// ── Insight box ───────────────────────────────────────────────────────────
	insightBox: {
		marginTop: 14,
		marginBottom: 14,
		paddingVertical: 11,
		paddingHorizontal: 13,
		borderLeftWidth: 3,
		borderLeftColor: BURGUNDY,
		backgroundColor: "#fff5f7",
	},
	insightLabel: {
		fontSize: 7,
		fontFamily: "Helvetica-Bold",
		color: BURGUNDY,
		letterSpacing: 2,
		marginBottom: 5,
	},
	insightText: {
		fontSize: 10,
		color: DARK,
		lineHeight: 1.65,
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

// ── Block types ───────────────────────────────────────────────────────────────

type Block =
	| { type: "h1"; text: string }
	| { type: "h2"; text: string }
	| { type: "h3"; text: string }
	| { type: "divider" }
	| { type: "paragraph"; text: string }
	| { type: "blank" }
	| { type: "table"; headers: string[]; rows: string[][] }
	| { type: "callout"; text: string }
	| { type: "insight"; text: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripBold(s: string): string {
	return s.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
}

function parseTableLine(line: string): string[] {
	return line
		.split("|")
		.map((c) => c.trim())
		.filter((c) => c.length > 0);
}

function isTableSeparator(line: string): boolean {
	return /^\|[\s|:-]+\|$/.test(line.trim());
}

// ── Block parser ──────────────────────────────────────────────────────────────

function parseBlocks(text: string): Block[] {
	const blocks: Block[] = [];
	const lines = text.split("\n");
	let i = 0;

	while (i < lines.length) {
		const raw = lines[i];
		const trimmed = raw.trim();

		// ── [CALLOUT] block ──────────────────────────────────────────────────
		if (trimmed.includes("[CALLOUT]")) {
			let content = trimmed.replace("[CALLOUT]", "").trim();
			if (content.includes("[/CALLOUT]")) {
				// Single line: [CALLOUT] text [/CALLOUT]
				content = content.replace("[/CALLOUT]", "").trim();
			} else {
				// Multi-line: collect until [/CALLOUT]
				i++;
				while (i < lines.length && !lines[i].includes("[/CALLOUT]")) {
					const part = lines[i].trim();
					if (part) content += (content ? " " : "") + part;
					i++;
				}
				// i now points at the [/CALLOUT] line — skip it
			}
			if (content) blocks.push({ type: "callout", text: stripBold(content) });
			i++;
			continue;
		}

		// ── [INSIGHT] block ──────────────────────────────────────────────────
		if (trimmed.includes("[INSIGHT]")) {
			let content = trimmed.replace("[INSIGHT]", "").trim();
			if (content.includes("[/INSIGHT]")) {
				content = content.replace("[/INSIGHT]", "").trim();
			} else {
				i++;
				while (i < lines.length && !lines[i].includes("[/INSIGHT]")) {
					const part = lines[i].trim();
					if (part) content += (content ? " " : "") + part;
					i++;
				}
			}
			if (content) blocks.push({ type: "insight", text: stripBold(content) });
			i++;
			continue;
		}

		// ── Markdown table ───────────────────────────────────────────────────
		if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
			const tableLines: string[] = [];
			while (i < lines.length) {
				const tl = lines[i].trim();
				if (tl.startsWith("|") && tl.endsWith("|")) {
					tableLines.push(tl);
					i++;
				} else {
					break;
				}
			}
			if (tableLines.length >= 2) {
				const headers = parseTableLine(tableLines[0]);
				// tableLines[1] is the separator — skip it
				const dataLines = tableLines.slice(2).filter((l) => !isTableSeparator(l));
				const rows = dataLines.map((l) => {
					const cells = parseTableLine(l);
					// Pad or trim to match header count
					while (cells.length < headers.length) cells.push("");
					return cells.slice(0, headers.length);
				});
				blocks.push({ type: "table", headers, rows });
			}
			continue;
		}

		// ── Standard line types ──────────────────────────────────────────────
		if (trimmed.startsWith("# ")) {
			blocks.push({ type: "h1", text: stripBold(trimmed.slice(2)) });
		} else if (trimmed.startsWith("## ")) {
			blocks.push({ type: "h2", text: stripBold(trimmed.slice(3)) });
		} else if (trimmed.startsWith("### ")) {
			blocks.push({ type: "h3", text: stripBold(trimmed.slice(4)) });
		} else if (trimmed.startsWith("---") || trimmed.startsWith("___")) {
			blocks.push({ type: "divider" });
		} else if (trimmed === "") {
			blocks.push({ type: "blank" });
		} else {
			blocks.push({ type: "paragraph", text: stripBold(trimmed) });
		}

		i++;
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

						case "table":
							return (
								<View key={i} style={styles.tableWrapper}>
									{/* Header row */}
									<View style={styles.tableHeaderRow}>
										{block.headers.map((h, j) => (
											<View key={j} style={styles.tableHeaderCell}>
												<Text style={styles.tableHeaderText}>{h}</Text>
											</View>
										))}
									</View>
									{/* Data rows */}
									{block.rows.map((row, j) => (
										<View
											key={j}
											style={[
												styles.tableRow,
												j % 2 !== 0 ? styles.tableRowAlt : {},
											]}
										>
											{row.map((cell, k) => (
												<View key={k} style={styles.tableCell}>
													<Text style={styles.tableCellText}>{cell}</Text>
												</View>
											))}
										</View>
									))}
								</View>
							);

						case "callout":
							return (
								<View key={i} style={styles.calloutBox}>
									<Text style={styles.calloutLabel}>FREQUENCY CALLOUT</Text>
									<Text style={styles.calloutText}>{block.text}</Text>
								</View>
							);

						case "insight":
							return (
								<View key={i} style={styles.insightBox}>
									<Text style={styles.insightLabel}>INSIGHT</Text>
									<Text style={styles.insightText}>{block.text}</Text>
								</View>
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
