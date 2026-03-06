import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const res = NextResponse.next();

	res.headers.set("X-Content-Type-Options", "nosniff");
	res.headers.set("X-Frame-Options", "DENY");
	res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

	return res;
}

export const config = {
	// Apply to all routes except static assets and Next.js internals
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
