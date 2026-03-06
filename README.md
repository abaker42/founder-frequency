# Founder Frequency

**Your founder frequency decoded into strategic business intelligence.**

Next.js app that calculates a 5-channel frequency profile from name + date of birth, then generates personalized business intelligence reports via Claude AI — delivered as a branded PDF via email.

---

## Architecture

```
Stripe Checkout → Webhook → Inngest (background) → Claude AI → PDF → Resend email
```

No synchronous report generation. The customer sees an instant confirmation page while the pipeline runs asynchronously. Zero timeout risk.

---

## Project Structure

```
founder-frequency/
├── app/
│   ├── layout.tsx                    ← Root layout, SEO metadata, GEO tags
│   ├── page.tsx                      ← Landing page + calculator widget
│   ├── success/page.tsx              ← Post-payment confirmation page
│   ├── report/page.tsx               ← Report preview page
│   ├── sitemap.ts                    ← Auto-generated /sitemap.xml
│   ├── robots.ts                     ← Crawler rules
│   └── api/
│       ├── calculate/route.ts        ← Free calculator endpoint
│       ├── checkout/route.ts         ← Creates Stripe Checkout session
│       ├── verify-session/route.ts   ← Confirms payment on success page
│       ├── webhook/route.ts          ← Stripe webhook → fires Inngest event
│       └── inngest/route.ts          ← Inngest background job handler
├── lib/
│   ├── calculator.ts                 ← Numerology + astrology math engine
│   ├── assembler.ts                  ← Tier-aware Claude prompt builder
│   ├── inngest.ts                    ← Background job: Claude → PDF → email
│   ├── pdf.tsx                       ← Branded PDF renderer (@react-pdf/renderer)
│   ├── email.ts                      ← Resend email delivery + HTML template
│   ├── matrix.json                   ← Core business trait data (54KB)
│   └── matrix-extended.json          ← Premium-exclusive trait data (22KB)
├── middleware.ts                     ← Security headers (all routes)
├── __tests__/
│   └── tiers.test.ts                 ← Test suite (Vitest)
└── package.json
```

---

## Product Tiers

| Tier | Price | Generation | Output |
|------|-------|------------|--------|
| Frequency Report | $33 | Single Claude call (~145s) | ~4,000 words |
| Full Frequency Blueprint | $88 | 4 parallel Claude calls (~75s each) | ~12,000 words |
| Frequency Circle | $11/mo | Blueprint on signup + monthly brief | Subscription |

**Blueprint parallelization:** The Blueprint prompt is split into 4 parts, each run as a parallel Inngest step — all within Vercel's 300s execution window.

---

## Local Development

### Prerequisites

Three terminals required to simulate the full purchase flow locally:

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — Inngest Dev Server (background job runner)
npx inngest-cli@latest dev

# Terminal 3 — Stripe CLI (forwards webhooks to localhost)
stripe listen --forward-to localhost:3000/api/webhook
```

### Setup

```bash
npm install
cp .env.example .env.local   # Fill in all required keys (see below)
```

---

## Environment Variables

All variables are **server-side only** (no `NEXT_PUBLIC_` prefix except the site URL).

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_live_...` in production) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | From Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_REPORT` | ✅ | Stripe Price ID for the $33 report |
| `STRIPE_PRICE_BLUEPRINT` | ✅ | Stripe Price ID for the $88 blueprint |
| `STRIPE_PRICE_CIRCLE` | ✅ | Stripe Price ID for the $11/mo subscription |
| `INNGEST_EVENT_KEY` | ✅ | From Inngest Dashboard → Settings |
| `INNGEST_SIGNING_KEY` | ✅ | From Inngest Dashboard → Settings |
| `RESEND_API_KEY` | ✅ | From resend.com/api-keys |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender, e.g. `reports@myfounderfrequency.com` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production URL, e.g. `https://myfounderfrequency.com` |

---

## API Endpoints

### `POST /api/calculate` — free
Powers the landing page calculator. Returns frequency summary + teaser copy.

```json
// Request
{ "name": "Jane Smith", "dob": "03/12/1990" }

// Response
{
  "firstName": "Jane",
  "summary": { "life_path": 7, "expression": 8, "western": "Pisces", ... },
  "teaser": {
    "headline": "Jane, your founder frequency is 7-8-Pisces",
    "body": "Your frequency profile contains 2 active tensions...",
    "tensionCount": 2,
    "hasMasterNumber": false
  }
}
```

### `POST /api/checkout` — creates Stripe session
Validates tier/name/DOB, embeds metadata, returns Stripe Checkout URL.

### `GET /api/verify-session?session_id=...` — confirms payment
Called by the success page to display the customer's name and email.

### `POST /api/webhook` — Stripe webhook (signature-verified)
Handles `checkout.session.completed` → sends `report/generate` Inngest event.
Webhook secret is validated via `stripe.webhooks.constructEvent()` before any processing.

### `GET|POST /api/inngest` — Inngest handler
Executes the `generate-report` background function. `maxDuration = 300`.

---

## Background Job Flow (`lib/inngest.ts`)

```
report/generate event received
  ├── tier === "insight"
  │     └── step: generate-with-claude (8,000 tokens, ~145s)
  └── tier === "blueprint"
        ├── step: generate-part-1 (4,000 tokens — Exec Profile + Ch 1-2)
        ├── step: generate-part-2 (3,500 tokens — Ch 3-4)          ← parallel
        ├── step: generate-part-3 (4,500 tokens — Ch 5-7)          ← parallel
        └── step: generate-part-4 (4,500 tokens — Ch 8-11 + Closing) ← parallel
  └── step: send-email
        ├── generatePDFBuffer() → branded PDF via @react-pdf/renderer
        └── resend.emails.send() → PDF attached, HTML template
```

Retries: 2 (configured on the Inngest function).

---

## PDF Rendering (`lib/pdf.tsx`)

Converts Claude's markdown output to a branded A4 PDF. Supported block types:

| Markdown / Tag | PDF Output |
|----------------|------------|
| `# Heading` | Burgundy H1 |
| `## Heading` | Dark H2 |
| `### Heading` | Gold uppercase H3 |
| `---` | Horizontal rule |
| `\| col \| col \|` | Bordered table with alternating rows |
| `[CALLOUT]...[/CALLOUT]` | Gold left-border callout box |
| `[INSIGHT]...[/INSIGHT]` | Burgundy left-border insight box |
| Plain text | Body paragraph |

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

**Before going live checklist:**
- [ ] Set all environment variables in Vercel → Settings → Environment Variables
- [ ] Use `sk_live_...` Stripe key and live price IDs (not test)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to `https://myfounderfrequency.com`
- [ ] Register the Stripe webhook endpoint in Stripe Dashboard:
      `https://myfounderfrequency.com/api/webhook`
      Events: `checkout.session.completed`, `invoice.payment_succeeded`
- [ ] Connect Inngest to Vercel in the Inngest Dashboard

---

## Testing

```bash
npm test                              # Vitest test suite
```
