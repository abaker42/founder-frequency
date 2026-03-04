/**
 * POST /api/generate
 *
 * Paid report generation endpoint. Called after Stripe payment confirmation.
 * Assembles the tier-appropriate prompt, calls the Claude API via the official
 * Anthropic SDK (which handles long-running requests correctly), generates a
 * branded PDF, and emails it to the customer via Resend.
 *
 * Body: { name: string, dob: string, tier: 'insight' | 'blueprint', email?: string }
 * Returns: { report: string, tier: string, emailSent: boolean, metadata: object }
 *
 * Requires: ANTHROPIC_API_KEY
 * Optional: RESEND_API_KEY + RESEND_FROM_EMAIL (for email delivery)
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
	assembleInsightPrompt,
	assembleBlueprintPrompt,
	getMetadata,
} from "@/lib/assembler";
import { sendReportEmail } from "@/lib/email";

// Allow up to 5 minutes on Vercel Pro (hobby plan caps at 60 s).
export const maxDuration = 300;

// Model selection per tier
const TIER_CONFIG = {
	insight: {
		model: "claude-sonnet-4-6" as const,
		max_tokens: 8000,
		temperature: 0.7,
	},
	blueprint: {
		model: "claude-sonnet-4-6" as const,
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

		if (!process.env.ANTHROPIC_API_KEY) {
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

		// ── Call Claude via SDK (handles long timeouts correctly) ──────
		// Raw fetch uses Node's undici with a 30-second headersTimeout, which
		// kills requests before Claude finishes generating large reports.
		// The SDK sets a 600-second timeout and handles retries properly.
		const client = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
			// SDK default is 600 s — no explicit cap so we can measure actual generation time
		});

		const message = await client.messages.create({
			model: config.model,
			max_tokens: config.max_tokens,
			temperature: config.temperature,
			messages: [{ role: "user", content: prompt }],
		});

		const reportText = message.content
			.filter((block) => block.type === "text")
			.map((block) => (block as { type: "text"; text: string }).text)
			.join("\n");

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
				console.error("Email delivery failed:", emailErr);
			}
		}

		// ── Return ─────────────────────────────────────────────────────
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
