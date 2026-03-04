/**
 * POST /api/generate
 *
 * Paid report generation endpoint. Called after Stripe payment confirmation.
 * Assembles the tier-appropriate prompt, calls the Claude API, generates a
 * branded PDF, and emails it to the customer via Resend.
 *
 * Body: { name: string, dob: string, tier: 'insight' | 'blueprint', email?: string }
 * Returns: { report: string, tier: string, emailSent: boolean, metadata: object }
 *
 * Requires: ANTHROPIC_API_KEY
 * Optional: RESEND_API_KEY + RESEND_FROM_EMAIL (for email delivery)
 */

import { NextRequest, NextResponse } from "next/server";
import {
	assembleInsightPrompt,
	assembleBlueprintPrompt,
	getMetadata,
} from "@/lib/assembler";
import { sendReportEmail } from "@/lib/email";

// Allow up to 5 minutes — Claude Blueprint generation takes 60–90 s.
// Requires Vercel Pro (hobby plan caps at 60 s).
export const maxDuration = 300;

// Model selection per tier
const TIER_CONFIG = {
	insight: {
		model: "claude-sonnet-4-6",
		max_tokens: 8000,
		temperature: 0.7,
	},
	blueprint: {
		model: "claude-sonnet-4-6",
		max_tokens: 16000,
		temperature: 0.7,
	},
} as const;

export async function POST(req: NextRequest) {
	try {
		const { name, dob, tier, email } = await req.json();

		// ── Validation ─────────────────────────────────────────────────
		if (!name || !dob || !tier) {
			return NextResponse.json(
				{ error: "Name, date of birth, and tier are required." },
				{ status: 400 },
			);
		}

		if (tier !== "insight" && tier !== "blueprint") {
			return NextResponse.json(
				{ error: 'Tier must be "insight" or "blueprint".' },
				{ status: 400 },
			);
		}

		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Server configuration error: API key not set." },
				{ status: 500 },
			);
		}

		// ── Assemble prompt ────────────────────────────────────────────
		const prompt =
			tier === "insight"
				? assembleInsightPrompt(name, dob)
				: assembleBlueprintPrompt(name, dob);

		const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];

		// ── Call Claude API ────────────────────────────────────────────
		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: config.model,
				max_tokens: config.max_tokens,
				temperature: config.temperature,
				messages: [{ role: "user", content: prompt }],
			}),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("Claude API error:", response.status, errorBody);
			return NextResponse.json(
				{ error: "Report generation failed. Please try again." },
				{ status: 502 },
			);
		}

		const data = await response.json();
		const reportText =
			data.content
				?.filter((block: any) => block.type === "text")
				.map((block: any) => block.text)
				.join("\n") ?? "";

		// ── Generate PDF + send email ──────────────────────────────────
		let emailSent = false;
		if (email && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
			try {
				await sendReportEmail({
					email,
					name,
					tier: tier as "insight" | "blueprint",
					report: reportText,
				});
				emailSent = true;
			} catch (emailErr) {
				// Log but don't fail the whole request — the in-browser report still works
				console.error("Email delivery failed:", emailErr);
			}
		}

		// ── Return report + metadata ───────────────────────────────────
		const metadata = getMetadata(name, dob);

		return NextResponse.json({
			report: reportText,
			tier,
			emailSent,
			metadata: {
				...metadata,
				model: config.model,
				promptTokens: Math.floor(prompt.length / 4),
				reportLength: reportText.length,
			},
		});
	} catch (err: any) {
		console.error("Generate error:", err);
		return NextResponse.json(
			{ error: err.message || "An unexpected error occurred." },
			{ status: 500 },
		);
	}
}
