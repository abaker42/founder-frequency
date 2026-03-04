/**
 * lib/email.ts
 *
 * Sends the Founder Frequency report to a customer via Resend,
 * with a branded PDF attached.
 *
 * Requires:
 *   RESEND_API_KEY      — from resend.com/api-keys
 *   RESEND_FROM_EMAIL   — verified sender, e.g. reports@myfounderfrequency.com
 */

import { Resend } from "resend";
import { generatePDFBuffer } from "./pdf";

const TIER_LABELS: Record<string, string> = {
	insight: "Frequency Report",
	blueprint: "Full Frequency Blueprint",
};

export interface SendReportEmailOptions {
	email: string;
	name: string;
	tier: "insight" | "blueprint";
	report: string;
}

/**
 * Generates the PDF and sends the report email via Resend.
 * Throws on failure — callers should catch and handle gracefully.
 */
export async function sendReportEmail({
	email,
	name,
	tier,
	report,
}: SendReportEmailOptions): Promise<void> {
	const resend = new Resend(process.env.RESEND_API_KEY);
	const tierLabel = TIER_LABELS[tier] ?? "Frequency Report";
	const firstName = name.split(" ")[0];
	const date = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Generate branded PDF
	const pdfBuffer = await generatePDFBuffer({ name, tier, report, generatedDate: date });

	await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL!,
		to: email,
		subject: `${firstName}, your ${tierLabel} is ready`,
		html: buildEmailHTML({ firstName, name, tierLabel, date }),
		attachments: [
			{
				filename: `founder-frequency-${firstName.toLowerCase()}.pdf`,
				content: pdfBuffer,
			},
		],
	});
}

// ── Email HTML template ───────────────────────────────────────────────────────

function buildEmailHTML({
	firstName,
	name,
	tierLabel,
	date,
}: {
	firstName: string;
	name: string;
	tierLabel: string;
	date: string;
}) {
	const year = new Date().getFullYear();
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${firstName}'s ${tierLabel} — Founder Frequency</title>
</head>
<body style="margin:0;padding:0;background-color:#0e0e10;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0e0e10;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;width:100%;background-color:#18181b;border-radius:12px;overflow:hidden;border:1px solid #27272a;">

          <!-- Masthead -->
          <tr>
            <td style="padding:28px 40px 24px;border-bottom:1px solid #27272a;">
              <span style="font-size:15px;font-weight:600;color:#f4f4f5;letter-spacing:-0.2px;">
                Founder<span style="color:#D4A853;">Frequency</span>
              </span>
            </td>
          </tr>

          <!-- Gold rule -->
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,#D4A853 0%,#7C1D3E 100%);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#D4A853;">
                ${tierLabel}
              </p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#f4f4f5;line-height:1.25;letter-spacing:-0.5px;">
                ${firstName}, your report is ready.
              </h1>

              <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.65;">
                Your <strong style="color:#f4f4f5;">${tierLabel}</strong> for
                <strong style="color:#f4f4f5;">${name}</strong>
                has been assembled and is attached to this email as a PDF.
              </p>

              <p style="margin:0 0 32px;font-size:15px;color:#a1a1aa;line-height:1.65;">
                Save it somewhere safe — your frequency profile is yours to return to whenever you
                need clarity on direction, decision-making, or next moves.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid #27272a;margin-bottom:28px;"></div>

              <p style="margin:0 0 6px;font-size:12px;color:#52525b;">Generated ${date}</p>
              <p style="margin:0;font-size:12px;color:#52525b;">
                Questions? Reply to this email or visit
                <a href="https://myfounderfrequency.com" style="color:#D4A853;text-decoration:none;">
                  myfounderfrequency.com
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#111113;border-top:1px solid #27272a;padding:18px 40px;">
              <p style="margin:0;font-size:11px;color:#52525b;text-align:center;">
                &copy; ${year} Founder Frequency &nbsp;&middot;&nbsp;
                <a href="https://myfounderfrequency.com" style="color:#71717a;text-decoration:none;">
                  myfounderfrequency.com
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
