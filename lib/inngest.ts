/**
 * lib/inngest.ts
 *
 * Inngest client + background functions.
 *
 * generateReportFn — triggered by Stripe webhook on payment.
 * Runs entirely server-side: Claude → PDF → Resend email.
 * No browser connection required — customer sees instant confirmation.
 *
 * Step breakdown:
 *   generate-with-claude  (~218 s for Blueprint at 12,000 tokens)
 *   send-email            (~5 s)
 *   Total                 ~223 s — fits within Vercel Pro's 300 s maxDuration.
 */

import { Inngest } from "inngest";
import Anthropic from "@anthropic-ai/sdk";
import { assembleInsightPrompt, assembleBlueprintPrompt } from "./assembler";
import { sendReportEmail } from "./email";

// ── Client ───────────────────────────────────────────────────────────────────

export const inngest = new Inngest({
	id: "founder-frequency",
});

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER_CONFIG = {
	insight: {
		model: "claude-sonnet-4-6" as const,
		max_tokens: 8000,   // ~145 s
	},
	blueprint: {
		model: "claude-sonnet-4-6" as const,
		max_tokens: 12000,  // ~218 s — within Vercel Pro 300 s maxDuration
	},
} as const;

// ── Event type ────────────────────────────────────────────────────────────────

export type GenerateReportEvent = {
	name: "report/generate";
	data: {
		name: string;
		dob: string;
		tier: "insight" | "blueprint";
		email: string;
		sessionId: string;
	};
};

// ── Background function ───────────────────────────────────────────────────────

export const generateReportFn = inngest.createFunction(
	{
		id: "generate-report",
		retries: 2,
	},
	{ event: "report/generate" },
	async ({ event, step }) => {
		const { name, dob, email } = event.data;
		const tier = event.data.tier as keyof typeof TIER_CONFIG;

		// Step 1: Generate report text via Claude
		const reportText = await step.run("generate-with-claude", async () => {
			const prompt =
				tier === "insight"
					? assembleInsightPrompt(name, dob)
					: assembleBlueprintPrompt(name, dob);

			const config = TIER_CONFIG[tier];
			const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

			const message = await client.messages.create({
				model: config.model,
				max_tokens: config.max_tokens,
				temperature: 0.7,
				messages: [{ role: "user", content: prompt }],
			});

			return message.content
				.filter((b) => b.type === "text")
				.map((b) => (b as { type: "text"; text: string }).text)
				.join("\n");
		});

		// Step 2: Generate PDF + send email
		await step.run("send-email", async () => {
			await sendReportEmail({ email, name, tier, report: reportText });
		});

		return { success: true, reportLength: reportText.length };
	},
);
