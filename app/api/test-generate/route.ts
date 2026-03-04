/**
 * GET /api/test-generate?name=Anthony+Michael+Baker&dob=01/15/1990&tier=blueprint&to=you@email.com
 *
 * DEBUG ONLY — remove before going live.
 * Runs the full generate pipeline (prompt assembly → Claude → PDF → email)
 * and returns step-by-step results so you can see exactly where it fails.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
	assembleInsightPrompt,
	assembleBlueprintPrompt,
} from "@/lib/assembler";
import { sendReportEmail } from "@/lib/email";

const TIER_CONFIG = {
	insight: { model: "claude-sonnet-4-6", max_tokens: 800, temperature: 0.7 },
	blueprint: { model: "claude-sonnet-4-6", max_tokens: 1200, temperature: 0.7 },
} as const;

export async function GET(req: NextRequest) {
	const name = req.nextUrl.searchParams.get("name") ?? "Anthony Michael Baker";
	const dob = req.nextUrl.searchParams.get("dob") ?? "01/15/1990";
	const tier = (req.nextUrl.searchParams.get("tier") ?? "blueprint") as
		| "insight"
		| "blueprint";
	const to = req.nextUrl.searchParams.get("to");

	const steps: Record<string, any> = {
		name,
		dob,
		tier,
		emailTo: to ?? "(skipped — no ?to= provided)",
	};

	// Step 1: Assemble prompt
	try {
		const prompt =
			tier === "insight"
				? assembleInsightPrompt(name, dob)
				: assembleBlueprintPrompt(name, dob);
		steps.promptAssembly = `OK — ${prompt.length} chars`;
		steps.promptPreview = prompt.slice(0, 300) + "...";
	} catch (err: any) {
		steps.promptAssembly = `FAILED: ${err.message}`;
		return NextResponse.json({ steps, failedAt: "promptAssembly" }, { status: 500 });
	}

	// Step 2: Call Claude via SDK (short output for speed)
	let reportText = "";
	try {
		if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");

		const prompt =
			tier === "insight"
				? assembleInsightPrompt(name, dob)
				: assembleBlueprintPrompt(name, dob);

		const config = TIER_CONFIG[tier];
		const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 290_000 });
		const message = await client.messages.create({
			model: config.model,
			max_tokens: config.max_tokens,
			temperature: config.temperature,
			messages: [{ role: "user", content: prompt }],
		});

		reportText = message.content
			.filter((b) => b.type === "text")
			.map((b) => (b as any).text)
			.join("\n");

		steps.claudeCall = `OK — ${reportText.length} chars`;
		steps.reportPreview = reportText.slice(0, 200) + "...";
	} catch (err: any) {
		steps.claudeCall = `FAILED: ${err.message}`;
		return NextResponse.json({ steps, failedAt: "claudeCall" }, { status: 500 });
	}

	// Step 3: PDF + email (only if ?to= was provided)
	if (to) {
		try {
			await sendReportEmail({ email: to, name, tier, report: reportText });
			steps.emailSend = `OK — sent to ${to}`;
		} catch (err: any) {
			steps.emailSend = `FAILED: ${err.message}`;
			return NextResponse.json({ steps, failedAt: "emailSend" }, { status: 500 });
		}
	}

	return NextResponse.json({ ok: true, steps });
}
