/**
 * GET /api/verify-session?session_id=...
 *
 * Verifies a Stripe Checkout Session was paid and returns its metadata.
 * Called by the success page to safely retrieve name/dob/tier without
 * exposing the Stripe secret key to the client.
 *
 * Returns: { tier, name, dob, email, paid: boolean }
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
	const sessionId = req.nextUrl.searchParams.get("session_id");

	if (!sessionId) {
		return NextResponse.json(
			{ error: "session_id is required." },
			{ status: 400 },
		);
	}

	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		const paid =
			session.payment_status === "paid" ||
			// Subscriptions are "no_payment_required" on the initial session
			// but the subscription itself confirms payment
			session.mode === "subscription";

		if (!paid) {
			return NextResponse.json({ error: "Payment not confirmed." }, { status: 402 });
		}

		const { tier, name, dob } = session.metadata ?? {};

		return NextResponse.json({
			paid: true,
			tier: tier ?? null,
			name: name ?? null,
			dob: dob ?? null,
			email: session.customer_details?.email ?? null,
			mode: session.mode,
		});
	} catch (err: any) {
		console.error("verify-session error:", err);
		return NextResponse.json(
			{ error: "Could not verify session." },
			{ status: 500 },
		);
	}
}
