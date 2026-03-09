/**
 * lib/pixels.ts
 *
 * Thin wrappers around Meta Pixel (fbq) and TikTok Pixel (ttq).
 * Call these from any client component — they no-op safely if the
 * pixel hasn't loaded yet or the env var isn't set.
 */

// ── Meta Pixel ────────────────────────────────────────────────────────────────

export function metaEvent(
	event: string,
	params?: Record<string, string | number>,
) {
	if (typeof window === "undefined") return;
	const fbq = (window as any).fbq;
	if (!fbq) return;
	fbq("track", event, params ?? {});
}

// ── TikTok Pixel ──────────────────────────────────────────────────────────────

export function tiktokEvent(
	event: string,
	params?: Record<string, string | number>,
) {
	if (typeof window === "undefined") return;
	const ttq = (window as any).ttq;
	if (!ttq) return;
	ttq.track(event, params ?? {});
}

// ── Convenience fire-both helper ─────────────────────────────────────────────

export function trackEvent(
	metaName: string,
	tiktokName: string,
	params?: Record<string, string | number>,
) {
	metaEvent(metaName, params);
	tiktokEvent(tiktokName, params);
}
