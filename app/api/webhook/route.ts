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
		});

		if (name && dob && tier && email) {
			const genTier: "insight" | "blueprint" =
				tier === "blueprint" || tier === "circle" ? "blueprint" : "insight";

			// For Circle subscribers: store name + dob on the Stripe Customer so
			// future invoice.payment_succeeded renewals can retrieve the profile.
			if (tier === "circle" && session.customer) {
				try {
					await stripe.customers.update(session.customer as string, {
						metadata: { name, dob },
					});
				} catch (err: any) {
					console.error("[Stripe] Failed to store customer metadata:", err.message);
				}
			}

			// For Report buyers: generate a customer-restricted $33-off promo code
			// so they can upgrade to Blueprint for $55. The code is bound to their
			// Stripe Customer ID — Stripe rejects it at checkout for anyone else.
			let upgradeCode: string | null = null;
			if (
				genTier === "insight" &&
				session.customer &&
				process.env.STRIPE_UPGRADE_COUPON_ID
			) {
				try {
					const promoCode = await stripe.promotionCodes.create({
						promotion: {
							type: "coupon",
							coupon: process.env.STRIPE_UPGRADE_COUPON_ID!,
						},
						customer: session.customer as string,
						max_redemptions: 1,
					});
					upgradeCode = promoCode.code;
				} catch (err: any) {
					// Non-fatal — report still sends, just without the upgrade offer
					console.error("[Stripe] Failed to create upgrade promo code:", err.message);
				}
			}

			await inngest.send({
				name: "report/generate",
				data: {
					name,
					dob,
					tier: genTier,
					email,
					sessionId: session.id,
					upgradeCode,
				},
			});

			console.log(`[Inngest] report/generate event sent`, { tier: genTier, sessionId: session.id });
		} else {
			console.warn(`[Stripe] Missing metadata — skipping generation`, { sessionId: session.id, tier, hasDob: !!dob, hasEmail: !!email });
		}
	}

	if (event.type === "invoice.payment_succeeded") {
		const invoice = event.data.object as Stripe.Invoice;

		// Only handle subscription renewals — skip the initial payment which is
		// already covered by checkout.session.completed.
		if (invoice.billing_reason !== "subscription_cycle") {
			return NextResponse.json({ received: true });
		}

		const customerId = invoice.customer as string;

		try {
			const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
			const { name, dob } = customer.metadata ?? {};
			const email = customer.email;

			if (name && dob && email) {
				await inngest.send({
					name: "brief/generate",
					data: {
						name,
						dob,
						email,
						customerId,
						invoiceId: invoice.id,
					},
				});
				console.log(`[Inngest] brief/generate event sent`, { customerId, invoiceId: invoice.id });
			} else {
				console.warn(`[Stripe] Circle renewal missing profile data — skipping brief`, { customerId, invoiceId: invoice.id });
			}
		} catch (err: any) {
			console.error("[Stripe] Failed to retrieve customer for brief generation:", err.message);
		}
	}

	return NextResponse.json({ received: true });
}
