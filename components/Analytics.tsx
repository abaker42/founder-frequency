"use client";

/**
 * Analytics.tsx
 *
 * Loads Meta Pixel and TikTok Pixel after the page is interactive.
 * Both pixels fire PageView on initial load.
 * Route-change PageViews are tracked via pathname watching.
 *
 * Env vars required:
 *   NEXT_PUBLIC_META_PIXEL_ID
 *   NEXT_PUBLIC_TIKTOK_PIXEL_ID
 */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export default function Analytics() {
	const pathname = usePathname();

	// Fire PageView on every client-side route change
	useEffect(() => {
		if (META_ID && typeof window !== "undefined" && (window as any).fbq) {
			(window as any).fbq("track", "PageView");
		}
		if (TIKTOK_ID && typeof window !== "undefined" && (window as any).ttq) {
			(window as any).ttq.page();
		}
	}, [pathname]);

	if (!META_ID && !TIKTOK_ID) return null;

	return (
		<>
			{/* ── Meta Pixel ──────────────────────────────────────── */}
			{META_ID && (
				<>
					<Script
						id="meta-pixel"
						strategy="afterInteractive"
						dangerouslySetInnerHTML={{
							__html: `
								!function(f,b,e,v,n,t,s){
									if(f.fbq)return;n=f.fbq=function(){n.callMethod?
									n.callMethod.apply(n,arguments):n.queue.push(arguments)};
									if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
									n.queue=[];t=b.createElement(e);t.async=!0;
									t.src=v;s=b.getElementsByTagName(e)[0];
									s.parentNode.insertBefore(t,s)}(window,document,'script',
									'https://connect.facebook.net/en_US/fbevents.js');
								fbq('init', '${META_ID}');
								fbq('track', 'PageView');
							`,
						}}
					/>
					<noscript>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							height="1"
							width="1"
							style={{ display: "none" }}
							src={`https://www.facebook.com/tr?id=${META_ID}&ev=PageView&noscript=1`}
							alt=""
						/>
					</noscript>
				</>
			)}

			{/* ── TikTok Pixel ────────────────────────────────────── */}
			{TIKTOK_ID && (
				<Script
					id="tiktok-pixel"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							!function(w,d,t){
								w.TiktokAnalyticsObject=t;
								var ttq=w[t]=w[t]||[];
								ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
								ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
								for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
								ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
								ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
								ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
								ttq._o=ttq._o||{};ttq._o[e]=n||{};
								n=document.createElement("script");n.type="text/javascript";n.async=!0;
								n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];
								e.parentNode.insertBefore(n,e)};
								ttq.load('${TIKTOK_ID}');
								ttq.page();
							}(window,document,'ttq');
						`,
					}}
				/>
			)}
		</>
	);
}
