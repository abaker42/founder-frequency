/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the given tier.
 * Stores name, dob, and tier in session metadata so the success page
 * can retrieve them and generate the report without a database.
 *
 * Body: { tier: 'report' | 'blueprint' | 'circle', name: string, dob: string }
 * Returns: { url: string } — redirect to Stripe-hosted checkout
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS = {
	report: process.env.STRIPE_PRICE_REPORT!,
	blueprint: process.env.STRIPE_PRICE_BLUEPRINT!,
	circle: process.env.STRIPE_PRICE_CIRCLE!,
} as const;

const MODE = {
	report: "payment",
	blueprint: "payment",
	circle: "subscription",
} as const;

type Tier = keyof typeof PRICE_IDS;

export async function POST(req: NextRequest) {
	try {
		const { tier, name, dob } = await req.json();

		if (!tier || !(tier in PRICE_IDS)) {
			return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
		}

		if (!name?.trim() || !dob?.trim()) {
			return NextResponse.json(
				{ error: "Name and date of birth are required." },
				{ status: 400 },
			);
		}

		const t = tier as Tier;
		const siteUrl =
			process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

		const session = await stripe.checkout.sessions.create({
			mode: MODE[t],
			line_items: [{ price: PRICE_IDS[t], quantity: 1 }],
			// Store profile data so success page can generate the report
			metadata: {
				tier,
				name: name.trim(),
				dob: dob.trim(),
			},
			// Always create a Stripe Customer for payment sessions so we can
			// issue customer-restricted upgrade promotion codes after purchase.
			...(MODE[t] === "payment" && { customer_creation: "always" }),
			success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${siteUrl}/#pricing`,
			allow_promotion_codes: true,
		});

		return NextResponse.json({ url: session.url });
	} catch (err: any) {
		console.error("Checkout error:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to create checkout session." },
			{ status: 500 },
		);
	}
}
