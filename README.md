# Founder Frequency

**Your founder frequency decoded into strategic business intelligence.**

Next.js app that calculates a 5-channel frequency profile from name + date of birth, then generates personalized business intelligence reports via the Claude API.

## Project Structure

```
founder-frequency/
├── app/
│   ├── layout.tsx                  ← Root layout + metadata
│   ├── page.tsx                    ← Landing page (TODO: calculator widget)
│   └── api/
│       ├── calculate/route.ts      ← Free calculator endpoint
│       └── generate/route.ts       ← Paid report generation (Claude API)
├── lib/
│   ├── index.ts                    ← Barrel exports
│   ├── calculator.ts               ← Layer 1: Numerology + astrology math
│   ├── assembler.ts                ← Layer 3: Tier-aware prompt generator
│   ├── matrix.json                 ← Layer 2: Core business trait data (54KB)
│   └── matrix-extended.json        ← Layer 2: Premium-exclusive data (22KB)
├── __tests__/
│   ├── tiers.test.ts               ← 163 test suite (Vitest)
│   └── parity-check.ts             ← Python ↔ TypeScript validation
├── .env.example                    ← Environment variable template
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## Quick Start

```bash
npm install
cp .env.example .env.local      # Add your ANTHROPIC_API_KEY
npm run dev                      # http://localhost:3000
```

## API Endpoints

### `POST /api/calculate` (free)
Powers the landing page calculator widget. Returns frequency summary + teaser.

```json
// Request
{ "name": "Anthony Baker", "dob": "03/12/1990" }

// Response
{
  "firstName": "Anthony",
  "summary": { "life_path": 7, "expression": 8, "western": "Pisces", ... },
  "teaser": {
    "headline": "Anthony, your founder frequency is 7-8-Pisces",
    "body": "Your frequency profile contains 2 active tensions...",
    "tensionCount": 2,
    "hasMasterNumber": false
  }
}
```

### `POST /api/generate` (paid — requires Stripe verification)
Generates the full report via Claude API.

```json
// Request
{ "name": "Anthony Baker", "dob": "03/12/1990", "tier": "insight" }

// Response
{ "report": "## EXECUTIVE PROFILE SNAPSHOT...", "tier": "insight", "metadata": { ... } }
```

## Product Tiers

| Tier | Price | Claude Model | Output Target |
|------|-------|-------------|---------------|
| Frequency Report | $33 | Sonnet | 3,500-5,000 words |
| Full Frequency Blueprint | $88 | Opus | 8,000-12,000 words |
| Frequency Circle | $11/mo | Both | Monthly briefs + full Blueprint |

## Testing

```bash
npm test                         # Run 163-test suite
npx tsx __tests__/parity-check.ts  # Verify Python ↔ TypeScript parity
```

## Deployment (Vercel)

```bash
npm i -g vercel
vercel                           # Follow prompts
# Set ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## What's Built vs. What's Next

**Built (this repo):**
- ✅ Full calculation engine (5 channels + personal year/month/quarter)
- ✅ Tier-aware prompt assembler (insight + blueprint)
- ✅ Tension & amplification detection
- ✅ Free calculator API endpoint
- ✅ Paid generation API endpoint
- ✅ 163 tests + Python parity validation

**Next steps:**
- [ ] Landing page with calculator widget (React component)
- [ ] Stripe checkout integration ($33 / $88)
- [ ] PDF generation (report → styled PDF download)
- [ ] Email delivery (SendGrid/Resend)
- [ ] Upgrade flow ($33 → $88 differential pricing)
- [ ] Inner Circle membership (Stripe subscriptions + monthly cron)
