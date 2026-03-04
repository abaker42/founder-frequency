/**
 * POST /api/webhook
 *
 * Stripe webhook handler. Verifies the request signature and processes events.
 *
 * Events handled:
 *   checkout.session.completed  — one-time purchase OR subscription start
 *   invoice.payment_succeeded   — monthly Circle renewal
 *
 * Webhook endpoint to register in Stripe Dashboard:
 *   https://founderfrequency.com/api/webhook
 *
 * Events to enable in Dashboard:
 *   checkout.session.completed
 *   invoice.payment_succeeded
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { inngest } from "@/lib/inngest";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Next.js App Router: read raw body before Stripe can verify the signature
export async function POST(req: NextRequest) {
	const body = await req.text();
	const sig = req.headers.get("stripe-signature");

	if (!sig) {
		return NextResponse.json(
			{ error: "Missing stripe-signature header." },
			{ status: 400 },
		);
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);
	} catch (err: any) {
		console.error("Webhook signature verification failed:", err.message);
		return NextResponse.json(
			{ error: `Webhook error: ${err.message}` },
			{ status: 400 },
		);
	}

	// ── Event handlers ───────────────────────────────────────────────────────

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const { tier, name, dob } = session.metadata ?? {};
		const email = session.customer_details?.email ?? null;

		console.log(`[Stripe] checkout.session.completed`, {
			sessionId: session.id,
			mode: session.mode,
			tier,
			name,
			email,
		});

		// Trigger background report generation via Inngest.
		// Inngest runs the Claude → PDF → email pipeline asynchronously —
		// no browser connection needed, no 300 s timeout risk from the webhook itself.
		if (name && dob && tier && email) {
			const genTier: "insight" | "blueprint" =
				tier === "blueprint" || tier === "circle" ? "blueprint" : "insight";

			await inngest.send({
				name: "report/generate",
				data: {
					name,
					dob,
					tier: genTier,
					email,
					sessionId: session.id,
				},
			});

			console.log(`[Inngest] report/generate event sent`, { tier: genTier, name, email });
		} else {
			console.warn(`[Stripe] Missing metadata — skipping generation`, { name, dob, tier, email });
		}
	}

	if (event.type === "invoice.payment_succeeded") {
		const invoice = event.data.object as Stripe.Invoice;
		// Recurring Circle payment — generate monthly brief
		// TODO: Look up subscriber profile from DB, generate brief, send via email
		console.log(`[Stripe] Circle renewal payment`, {
			customerId: invoice.customer,
			invoiceId: invoice.id,
			amount: invoice.amount_paid,
		});
	}

	return NextResponse.json({ received: true });
}
