/**
 * POST /api/subscribe
 *
 * Adds a calculator user to the Resend audience.
 * Called after the free archetype result is shown.
 *
 * Body: { email, firstName, archetypeName }
 * Returns: { success: true } | { error: string }
 *
 * Requires:
 *   RESEND_API_KEY       — already used for email delivery
 *   RESEND_AUDIENCE_ID   — from Resend Dashboard → Audiences
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
	try {
		const { email, firstName, archetypeName } = await req.json();

		if (!email || !EMAIL_RE.test(email)) {
			return NextResponse.json(
				{ error: "A valid email address is required." },
				{ status: 400 },
			);
		}

		const audienceId = process.env.RESEND_AUDIENCE_ID;
		if (!audienceId) {
			// Silently succeed in dev if audience isn't configured yet
			console.warn("[subscribe] RESEND_AUDIENCE_ID not set — skipping contact creation");
			return NextResponse.json({ success: true });
		}

		const resend = new Resend(process.env.RESEND_API_KEY);

		await resend.contacts.create({
			audienceId,
			email,
			firstName: firstName ?? undefined,
			// Encode archetype in lastName for segmentation in Resend dashboard
			// e.g. filter contacts where lastName contains "Signal Architect"
			lastName: archetypeName ?? undefined,
			unsubscribed: false,
		});

		return NextResponse.json({ success: true });
	} catch (err: any) {
		// Duplicate contacts return a 409 — treat as success so the UI doesn't error
		if (err?.statusCode === 409 || err?.message?.includes("already exists")) {
			return NextResponse.json({ success: true });
		}
		console.error("[subscribe] error:", err?.message);
		return NextResponse.json(
			{ error: "Could not save your email. Please try again." },
			{ status: 500 },
		);
	}
}
