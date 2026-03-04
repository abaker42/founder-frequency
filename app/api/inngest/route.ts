/**
 * GET|POST|PUT /api/inngest
 *
 * Inngest handler endpoint. Inngest calls this to execute background functions.
 * Required for both local dev (via `npx inngest-cli@latest dev`) and production.
 */

import { serve } from "inngest/next";
import { inngest, generateReportFn } from "@/lib/inngest";

// Must be high enough to cover the longest step (Blueprint: ~218 s).
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [generateReportFn],
});
