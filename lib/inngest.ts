/**
 * lib/inngest.ts
 *
 * Inngest client + background functions.
 *
 * generateReportFn — triggered by Stripe webhook on one-time purchase.
 * Runs entirely server-side: Claude → PDF → Resend email.
 *
 * generateBriefFn — triggered by Stripe webhook on Circle monthly renewal.
 * Single Claude call (~2,000 tokens, ~40s) → PDF → Resend email.
 *
 * Blueprint step breakdown (4 parallel Claude calls):
 *   Part 1: Exec Profile + Ch 1-2  (~4,000 tokens, ~65s)
 *   Part 2: Ch 3-4                 (~3,500 tokens, ~55s)
 *   Part 3: Ch 5-7                 (~4,500 tokens, ~75s)  ← longest
 *   Part 4: Ch 8-11 + Closing      (~4,500 tokens, ~75s)
 *   All parts run in parallel — total wall time ~75s.
 *
 * Insight step breakdown (single call):
 *   generate-with-claude           (~8,000 tokens, ~145s)
 */

import { Inngest } from "inngest";
import Anthropic from "@anthropic-ai/sdk";
import {
	assembleInsightPrompt,
	assembleBlueprintPart1Prompt,
	assembleBlueprintPart2Prompt,
	assembleBlueprintPart3Prompt,
	assembleBlueprintPart4Prompt,
	assembleMonthlyBriefPrompt,
} from "./assembler";
import { sendReportEmail, sendBriefEmail } from "./email";

// ── Client ───────────────────────────────────────────────────────────────────

export const inngest = new Inngest({
	id: "founder-frequency",
});

// ── Claude helper ─────────────────────────────────────────────────────────────

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
	const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
	const message = await client.messages.create({
		model: "claude-sonnet-4-6",
		max_tokens: maxTokens,
		temperature: 0.7,
		messages: [{ role: "user", content: prompt }],
	});
	return message.content
		.filter((b) => b.type === "text")
		.map((b) => (b as { type: "text"; text: string }).text)
		.join("\n");
}

// ── Event type ────────────────────────────────────────────────────────────────

export type GenerateReportEvent = {
	name: "report/generate";
	data: {
		name: string;
		dob: string;
		tier: "insight" | "blueprint";
		email: string;
		sessionId: string;
		upgradeCode?: string | null;
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
		const { name, dob, email, upgradeCode } = event.data;
		const tier = event.data.tier as "insight" | "blueprint";

		let reportText: string;

		if (tier === "insight") {
			// Single step — 8,000 tokens (~145s, fits in 300s window)
			reportText = await step.run("generate-with-claude", () =>
				callClaude(assembleInsightPrompt(name, dob), 8000),
			);
		} else {
			// 4 parallel steps — each ~75s max, all within 300s window
			const [part1, part2, part3, part4] = await Promise.all([
				step.run("generate-part-1", () =>
					callClaude(assembleBlueprintPart1Prompt(name, dob), 4000),
				),
				step.run("generate-part-2", () =>
					callClaude(assembleBlueprintPart2Prompt(name, dob), 3500),
				),
				step.run("generate-part-3", () =>
					callClaude(assembleBlueprintPart3Prompt(name, dob), 4500),
				),
				step.run("generate-part-4", () =>
					callClaude(assembleBlueprintPart4Prompt(name, dob), 4500),
				),
			]);

			reportText = [part1, part2, part3, part4].join("\n\n");
		}

		// Final step: generate PDF + send email
		await step.run("send-email", async () => {
			await sendReportEmail({ email, name, tier, report: reportText, upgradeCode: upgradeCode ?? undefined });
		});

		return { success: true, reportLength: reportText.length };
	},
);

// ── Brief event type ──────────────────────────────────────────────────────────

export type GenerateBriefEvent = {
	name: "brief/generate";
	data: {
		name: string;
		dob: string;
		email: string;
		customerId: string;
		invoiceId: string;
	};
};

// ── Monthly brief function (Circle renewal) ───────────────────────────────────

export const generateBriefFn = inngest.createFunction(
	{
		id: "generate-brief",
		retries: 2,
	},
	{ event: "brief/generate" },
	async ({ event, step }) => {
		const { name, dob, email } = event.data;
		const now = new Date();
		const monthName = now.toLocaleString("en-US", { month: "long" });
		const year = now.getFullYear();

		const briefText = await step.run("generate-with-claude", () =>
			callClaude(assembleMonthlyBriefPrompt(name, dob), 2500),
		);

		await step.run("send-email", async () => {
			await sendBriefEmail({ email, name, brief: briefText, monthName, year });
		});

		return { success: true, briefLength: briefText.length };
	},
);
