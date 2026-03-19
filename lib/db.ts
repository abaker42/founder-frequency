/**
 * lib/db.ts
 *
 * Neon serverless Postgres client + event logging helper.
 *
 * Schema (run once in Neon console):
 *
 *   CREATE TABLE IF NOT EXISTS events (
 *     id         SERIAL PRIMARY KEY,
 *     type       TEXT NOT NULL,
 *     email      TEXT,
 *     metadata   JSONB,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 * Event types:
 *   calculator_scan  — free calculator used (name, dob, archetype)
 *   email_capture    — email submitted after scan
 *   purchase         — Stripe checkout completed (tier, session/invoice id)
 *   brief_renewal    — Circle monthly renewal billed
 *
 * Requires:
 *   DATABASE_URL — Neon connection string (pooled, from Neon dashboard)
 */

import { neon } from "@neondatabase/serverless";

/**
 * Logs a funnel event to the events table.
 * Never throws — failures are logged to console only so they never
 * break the user-facing request.
 */
export async function logEvent(
	type: string,
	email: string | null,
	metadata: Record<string, unknown> = {},
): Promise<void> {
	const url = process.env.DATABASE_URL;
	if (!url) {
		// Silently skip in dev if DATABASE_URL isn't configured yet
		return;
	}

	try {
		const sql = neon(url);
		await sql`
			INSERT INTO events (type, email, metadata)
			VALUES (${type}, ${email}, ${JSON.stringify(metadata)})
		`;
	} catch (err: any) {
		console.error(`[db] Failed to log event "${type}":`, err?.message);
	}
}
