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
	upgradeCode?: string;
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
	upgradeCode,
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
		html: buildEmailHTML({ firstName, name, tierLabel, date, upgradeCode }),
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
	upgradeCode,
}: {
	firstName: string;
	name: string;
	tierLabel: string;
	date: string;
	upgradeCode?: string;
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

          ${upgradeCode ? `
          <!-- Upgrade offer -->
          <tr>
            <td style="padding:28px 40px;border-top:1px solid #27272a;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#D4A853;">
                Exclusive Upgrade Offer
              </p>
              <p style="margin:0 0 12px;font-size:17px;font-weight:700;color:#f4f4f5;line-height:1.3;">
                Go deeper for $55
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#a1a1aa;line-height:1.65;">
                Your Frequency Report is the surface layer. The <strong style="color:#f4f4f5;">Full Frequency Blueprint</strong>
                goes 12,000 words deep — decision-making psychology, wealth patterns, scaling strategy, and a
                90-day execution framework built around your specific frequency.
              </p>
              <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;">
                Use this code at checkout to upgrade for $55:
              </p>
              <div style="background:#0e0e10;border:1px solid rgba(212,168,83,0.3);border-radius:8px;padding:14px 20px;text-align:center;margin-bottom:20px;">
                <span style="font-size:22px;font-weight:700;color:#D4A853;letter-spacing:6px;font-family:monospace;">
                  ${upgradeCode}
                </span>
              </div>
              <p style="margin:0 0 20px;font-size:11px;color:#52525b;line-height:1.6;">
                This code is exclusively yours — it&rsquo;s linked to your purchase and won&rsquo;t work for anyone else.
                One-time use. No expiry.
              </p>
              <a href="https://myfounderfrequency.com/#pricing"
                style="display:inline-block;padding:12px 28px;background-color:#D4A853;color:#09090b;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
                Upgrade to Blueprint →
              </a>
            </td>
          </tr>
          ` : ''}

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
