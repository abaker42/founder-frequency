/**
 * Founder Frequency — Layer 3: Tier-Aware Prompt Assembler
 *
 * Generates prompt variants for two product tiers:
 *   - INSIGHT ($33)   → Sonnet engine, 3,500-5,000 words
 *   - BLUEPRINT ($88)  → Opus engine, 8,000-12,000 words
 */

import {
	calculateProfile,
	calculateExtendedProfile,
	calculatePersonalYear,
	reduceToSingle,
} from "./calculator";
import type { Profile } from "./calculator";
import MATRIX from "./matrix.json";
import MATRIX_EXT from "./matrix-extended.json";

// ── Types ────────────────────────────────────────────────────────────

export type Tier = "insight" | "blueprint";

export interface AssembledPrompts {
	insight?: string;
	blueprint?: string;
}

export interface ProfileMetadata {
	summary: Record<string, string | number>;
	tensions: string[];
	amplifications: string[];
	personal_year: { number: number; calculation: string };
	quarterly_forecast: any;
}

interface ProfileData {
	profile: Profile;
	fullName: string;
	firstName: string;
	dobDisplay: string;
	lpNum: number;
	lpArchetype: string;
	bdDisplay: string;
	bdTalent: string;
	bdCompound: number;
	bdReduced: number;
	exprNum: number;
	exprArchetype: string;
	suNum: number;
	pnNum: number;
	wSign: string;
	wCusp: string | null;
	wDisplay: string;
	wElem: string;
	wMod: string;
	cAnimal: string;
	cElem: string;
	cPol: string;
	cDisplay: string;
	karmic: string | null;
	hasKarmic: boolean;
	masterPositions: string[];
	hasMasters: boolean;
	tensions: string[];
	amplifications: string[];
	lpMatrix: string;
	bdMatrix: string;
	exprMatrix: string;
	westernMatrix: string;
	chineseMatrix: string;
	karmicMatrix: string;
	tensionDescriptions: string[];
	ampDescriptions: string[];
	priorityText: string;
}

// ── Tension & Amplification Detection ────────────────────────────────

type TensionCheck = {
	name: string;
	zodiacA: Set<string>;
	animalsA: Set<string>;
	lpA: Set<number>;
	zodiacB: Set<string>;
	animalsB: Set<string>;
	lpB: Set<number>;
};

const TENSION_CHECKS: TensionCheck[] = [
	{
		name: "speed_vs_depth",
		zodiacA: new Set(["Aries", "Sagittarius", "Gemini"]),
		animalsA: new Set(["Horse", "Tiger", "Monkey"]),
		lpA: new Set([1, 3, 5]),
		zodiacB: new Set(["Virgo", "Scorpio", "Capricorn"]),
		animalsB: new Set(["Snake", "Ox", "Rooster"]),
		lpB: new Set([4, 7, 22]),
	},
	{
		name: "security_vs_freedom",
		zodiacA: new Set(["Taurus", "Cancer", "Capricorn"]),
		animalsA: new Set(["Ox", "Rabbit", "Dog"]),
		lpA: new Set([2, 4, 6]),
		zodiacB: new Set(["Gemini", "Sagittarius", "Aquarius"]),
		animalsB: new Set(["Horse", "Monkey", "Tiger"]),
		lpB: new Set([1, 3, 5]),
	},
	{
		name: "solo_vs_collaborative",
		zodiacA: new Set(["Aries", "Leo", "Scorpio"]),
		animalsA: new Set(["Tiger", "Horse", "Dragon"]),
		lpA: new Set([1, 7, 8]),
		zodiacB: new Set(["Libra", "Pisces", "Gemini"]),
		animalsB: new Set(["Rabbit", "Goat", "Pig"]),
		lpB: new Set([2, 6, 9]),
	},
	{
		name: "spiritual_vs_material",
		zodiacA: new Set(["Pisces", "Sagittarius", "Aquarius"]),
		animalsA: new Set(["Snake", "Rabbit"]),
		lpA: new Set([7, 9, 11]),
		zodiacB: new Set(["Taurus", "Capricorn", "Leo"]),
		animalsB: new Set(["Dragon", "Ox", "Rat"]),
		lpB: new Set([4, 8, 22]),
	},
	{
		name: "creative_vs_structural",
		zodiacA: new Set(["Leo", "Pisces", "Gemini"]),
		animalsA: new Set(["Horse", "Monkey", "Goat"]),
		lpA: new Set([3, 5, 9]),
		zodiacB: new Set(["Virgo", "Capricorn", "Taurus"]),
		animalsB: new Set(["Ox", "Rooster", "Dog"]),
		lpB: new Set([4, 8, 22]),
	},
];

export function detectTensions(profile: Profile): string[] {
	const tensions: string[] = [];
	const lp = profile.life_path.number;
	const western = profile.western_zodiac.sign;
	const animal = profile.chinese_zodiac.animal;

	for (const check of TENSION_CHECKS) {
		const sideA =
			check.zodiacA.has(western) ||
			check.animalsA.has(animal) ||
			check.lpA.has(lp);
		const sideB =
			check.zodiacB.has(western) ||
			check.animalsB.has(animal) ||
			check.lpB.has(lp);
		if (sideA && sideB) tensions.push(check.name);
	}
	return tensions;
}

export function detectAmplifications(profile: Profile): string[] {
	const amps: string[] = [];
	const wElem = profile.western_zodiac.element;
	const cElem = profile.chinese_zodiac.element;
	const lp = profile.life_path.number;

	const fireCount = [
		wElem === "Fire",
		cElem === "Fire",
		[1, 3, 5].includes(lp),
	].filter(Boolean).length;
	const waterCount = [
		wElem === "Water",
		cElem === "Water",
		[2, 7, 9].includes(lp),
	].filter(Boolean).length;
	const earthCount = [
		wElem === "Earth",
		cElem === "Earth",
		[4, 8].includes(lp),
	].filter(Boolean).length;

	if (fireCount >= 2) amps.push("double_fire");
	if (waterCount >= 2) amps.push("double_water");
	if (earthCount >= 2) amps.push("double_earth");

	if (
		profile.life_path.is_master ||
		profile.birthday_number.is_master ||
		profile.expression.is_master
	) {
		amps.push("master_number_presence");
	}

	return amps;
}

// ── Matrix Lookup Helpers ────────────────────────────────────────────

const matrix = MATRIX as any;
const matrixExt = MATRIX_EXT as any;

function getLpEntry(num: number): string {
	return JSON.stringify(matrix.life_path?.[String(num)] ?? {}, null, 2);
}

function getBirthdayEntry(compound: number, reduced: number): string {
	const base = matrix.birthday_number?.[String(reduced)] ?? {};
	const compoundNote = matrix.birthday_compound?.[String(compound)] ?? "";
	const parts: string[] = [];
	if (base.talent)
		parts.push(
			`Talent: ${base.talent}`,
			`Business Gift: ${base.business_gift ?? "N/A"}`,
		);
	if (compoundNote) parts.push(`Compound ${compound} Note: ${compoundNote}`);
	return parts.length ? parts.join("\n") : `Birthday ${compound}: No entry.`;
}

function getExprEntry(num: number): string {
	return JSON.stringify(matrix.life_path?.[String(num)] ?? {}, null, 2);
}

function getWesternEntry(sign: string): string {
	return JSON.stringify(matrix.western_zodiac?.[sign] ?? {}, null, 2);
}

function getChineseEntry(animal: string, element: string): string {
	const a = matrix.chinese_zodiac?.animals?.[animal] ?? {};
	const e = matrix.chinese_zodiac?.elements?.[element] ?? {};
	const parts: string[] = [];
	if (Object.keys(a).length)
		parts.push(`ANIMAL (${animal}):\n${JSON.stringify(a, null, 2)}`);
	if (Object.keys(e).length)
		parts.push(`ELEMENT (${element}):\n${JSON.stringify(e, null, 2)}`);
	return parts.join("\n\n");
}

function getKarmicEntry(k: string | null): string {
	if (!k) return "";
	return matrix.karmic_debt_business_impact?.[k] ?? "";
}

function formatDate(m: number, d: number, y: number): string {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	return `${months[m - 1]} ${d}, ${y}`;
}

// ── Blueprint-Exclusive Data ─────────────────────────────────────────

function getPartnershipData(lpNum: number): string {
	const entry = matrixExt.partnership_compatibility?.[String(lpNum)] ?? {};
	return Object.keys(entry).length
		? JSON.stringify(entry, null, 2)
		: "No partnership data for this Life Path.";
}

function getActionPlan(
	lpNum: number,
	exprNum: number,
	western: string,
	animal: string,
): string {
	const plans = matrixExt.action_plan_archetypes ?? {};
	const scores: Record<string, number> = {};

	for (const [key, plan] of Object.entries(plans)) {
		if (
			key.startsWith("_") ||
			typeof plan !== "object" ||
			!(plan as any).applies_to
		)
			continue;
		const applies: string = (plan as any).applies_to;
		let score = 0;
		if (applies.includes(`LP${lpNum}`)) score += 3;
		if (applies.includes(`Expr${exprNum}`)) score += 2;
		if (applies.includes(western)) score += 1;
		if (applies.includes(animal)) score += 1;
		if (applies.includes(`LP${lpNum} + Expr${exprNum}`)) score += 5;
		if (applies.includes(`LP${lpNum} + ${western}`)) score += 4;
		scores[key] = score;
	}

	const entries = Object.entries(scores);
	if (!entries.length) return "No matching action plan archetype.";

	const best = entries.sort((a, b) => b[1] - a[1])[0][0];
	const plan = plans[best];
	return `ARCHETYPE: ${best}\nApplies to: ${(plan as any).applies_to}\n${JSON.stringify(plan, null, 2)}`;
}

function getPersonalYearData(pyNum: number): string {
	const entry = matrixExt.personal_year_business?.[String(pyNum)] ?? {};
	return JSON.stringify(entry, null, 2);
}

function getQuarterlyData(profile: Profile): string {
	const qf = profile.quarterly_forecast;
	if (!qf) return "No quarterly forecast available.";

	const py = qf.personal_year;
	const theme = matrixExt.personal_year_business?.[String(py)]?.theme ?? "N/A";
	const lines: string[] = [`PERSONAL YEAR: ${py} — ${theme}`];

	for (const q of qf.quarters) {
		lines.push(
			`\nQ${q.quarter} (Months ${q.months[0]}-${q.months[q.months.length - 1]}), Dominant Energy: ${q.dominant_energy}`,
		);
		for (let i = 0; i < q.months.length; i++) {
			const mText =
				matrixExt.personal_month_business?.[String(q.energies[i])] ?? "";
			lines.push(`  Month ${q.months[i]} (PM${q.energies[i]}): ${mText}`);
		}
	}

	return lines.join("\n");
}

// ── Profile Data Extraction ──────────────────────────────────────────

function extractProfileData(
	fullName: string,
	dob: string,
	extended: boolean,
): ProfileData {
	const profile = extended
		? calculateExtendedProfile(fullName, dob)
		: calculateProfile(fullName, dob);
	const firstName = fullName.trim().split(/\s+/)[0];
	const parsed = profile.input.parsed;

	const lpNum = profile.life_path.number;
	const exprNum = profile.expression.number;
	const bdCompound = profile.birthday_number.compound;
	const bdReduced = profile.birthday_number.reduced;
	const karmic = profile.birthday_number.karmic_debt;

	const masterPositions: string[] = [];
	if (profile.life_path.is_master) masterPositions.push(`Life Path ${lpNum}`);
	if (profile.birthday_number.is_master)
		masterPositions.push(`Birthday ${bdCompound}`);
	if (profile.expression.is_master)
		masterPositions.push(`Expression ${exprNum}`);

	const tensions = detectTensions(profile);
	const amplifications = detectAmplifications(profile);

	const priority = matrix.combination_rules?.priority_hierarchy ?? {};
	const tensionPatterns = matrix.combination_rules?.tension_patterns ?? {};
	const ampPatterns = matrix.combination_rules?.amplification_patterns ?? {};

	return {
		profile,
		fullName,
		firstName:
			firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
		dobDisplay: formatDate(parsed.month, parsed.day, parsed.year),
		lpNum,
		lpArchetype: matrix.life_path?.[String(lpNum)]?.archetype ?? `LP ${lpNum}`,
		bdDisplay: profile.birthday_number.display,
		bdTalent: matrix.birthday_number?.[String(bdReduced)]?.talent ?? "",
		bdCompound,
		bdReduced,
		exprNum,
		exprArchetype:
			matrix.life_path?.[String(exprNum)]?.archetype ?? `Expr ${exprNum}`,
		suNum: profile.soul_urge.number,
		pnNum: profile.personality.number,
		wSign: profile.western_zodiac.sign,
		wCusp: profile.western_zodiac.cusp,
		wDisplay: profile.western_zodiac.display,
		wElem: profile.western_zodiac.element,
		wMod: profile.western_zodiac.modality,
		cAnimal: profile.chinese_zodiac.animal,
		cElem: profile.chinese_zodiac.element,
		cPol: profile.chinese_zodiac.polarity,
		cDisplay: profile.chinese_zodiac.display,
		karmic,
		hasKarmic: karmic !== null,
		masterPositions,
		hasMasters: masterPositions.length > 0,
		tensions,
		amplifications,
		lpMatrix: getLpEntry(lpNum),
		bdMatrix: getBirthdayEntry(bdCompound, bdReduced),
		exprMatrix: getExprEntry(exprNum),
		westernMatrix: getWesternEntry(profile.western_zodiac.sign),
		chineseMatrix: getChineseEntry(
			profile.chinese_zodiac.animal,
			profile.chinese_zodiac.element,
		),
		karmicMatrix: karmic ? getKarmicEntry(karmic) : "",
		tensionDescriptions: tensions
			.map((t) => (tensionPatterns[t] ? `- ${t}: ${tensionPatterns[t]}` : ""))
			.filter(Boolean),
		ampDescriptions: amplifications
			.map((a) => (ampPatterns[a] ? `- ${a}: ${ampPatterns[a]}` : ""))
			.filter(Boolean),
		priorityText: Object.entries(priority)
			.map(([ch, signals]) => `  ${ch}: ${(signals as string[]).join(" > ")}`)
			.join("\n"),
	};
}

// ── System Prompt (shared) ───────────────────────────────────────────

const SYSTEM_PROMPT_CORE = `You are the Founder Frequency Report Engine. You generate deeply personal, applied-business intelligence reports that decode an entrepreneur's operating frequency — the invisible patterns that drive their decisions, risk tolerance, leadership style, and wealth-building approach.

Your analytical framework synthesizes five frequency channels: numerological life path, birthday talent imprint, expression frequency, western zodiac energy, and Chinese zodiac archetype. Together, these channels form a unique founder frequency that shapes every business decision.

Your tone is direct, confident, and personal — like a brilliant strategic advisor who can see patterns the founder can't see in themselves. You write in second person ("you"), address the subject by first name throughout, and always tie abstract traits to concrete business behaviors the subject will recognize in themselves.

You NEVER:
- Use generic horoscope language ("you are a natural leader" without business-specific context)
- Hedge with "this may or may not apply" disclaimers
- List traits without explaining their business implications
- Repeat the same insight in different chapters
- Use bullet points in narrative sections (tables and matrices are acceptable)

You ALWAYS:
- Reference the subject by first name at least 2x per chapter
- Tie every trait to a specific business scenario, decision type, or revenue pattern
- Name the specific number or sign driving each insight (e.g., "Your 7 frequency makes you...")
- Describe TENSIONS between conflicting frequency channels as the most valuable insights
- End each chapter with a concrete, actionable directive

FORMATTING:
- Callout boxes: wrap in [CALLOUT] ... [/CALLOUT] tags — one per chapter, actionable and specific
- Tables: use markdown table format
- Section headings: use **Bold Text** for sub-section headings within chapters
- Chapter headers: use ## CHAPTER N: Title format`;

// ── Insight Prompt ($33 / Sonnet) ────────────────────────────────────

export function assembleInsightPrompt(fullName: string, dob: string): string {
	const d = extractProfileData(fullName, dob, false);
	const topTension = d.tensionDescriptions[0] || "None detected.";

	return `<s>
${SYSTEM_PROMPT_CORE}

TIER-SPECIFIC RULES (FREQUENCY REPORT):
- This is a CONCISE frequency snapshot. Prioritize the single most important insight per chapter.
- Each chapter: 400-600 words. Total report: 3,500-5,000 words.
- Do NOT include Insight Boxes (those are Premium-exclusive). Only include Callout Boxes.
- Include ONE table only: a simplified 4-row risk matrix in Chapter 3.
- Use ${d.firstName}'s name 15+ times total.
- Every chapter references at least 2 of the 5 frequency channels.
- End the report with an upgrade CTA teasing deeper frequency analysis available.
- Do NOT mention the Blueprint by name — simply hint that deeper analysis of burnout frequency, partnerships, and action planning exists.
</s>

<subject_profile>
NAME: ${d.fullName}
FIRST NAME: ${d.firstName}
DATE OF BIRTH: ${d.dobDisplay}

FREQUENCY CHANNELS:
- Life Path Frequency: ${d.lpNum} — ${d.lpArchetype}
- Birthday Imprint: ${d.bdDisplay} — ${d.bdTalent}
- Expression Frequency: ${d.exprNum} — ${d.exprArchetype}
- Soul Urge: ${d.suNum} | Personality: ${d.pnNum} (secondary)
- Western Zodiac: ${d.wDisplay} | ${d.wElem}, ${d.wMod}
- Chinese Zodiac: ${d.cDisplay}
${d.hasKarmic ? `- KARMIC DEBT: ${d.karmic} — ${d.karmicMatrix}` : ""}
${d.hasMasters ? `- MASTER NUMBERS: ${d.masterPositions.join(", ")}` : ""}
</subject_profile>

<frequency_data>
=== LIFE PATH ${d.lpNum} ===
${d.lpMatrix}

=== BIRTHDAY ${d.bdDisplay} ===
${d.bdMatrix}

=== EXPRESSION ${d.exprNum} ===
${d.exprMatrix}

=== WESTERN: ${d.wSign} ===
${d.westernMatrix}

=== CHINESE: ${d.cAnimal} + ${d.cElem} ===
${d.chineseMatrix}

=== PRIMARY FREQUENCY TENSION ===
${topTension}
</frequency_data>

<report_structure>
Generate the Founder Frequency Report for ${d.firstName}:

## EXECUTIVE PROFILE SNAPSHOT (~300 words)
- Who they are as a founder — 3 paragraphs, unified frequency profile
- [CALLOUT] Your Core Frequency — 2 sentences [/CALLOUT]

## CHAPTER 1: Decision-Making Frequency (~500 words)
- Primary decision loop (Life Path + Western Zodiac blend)
- One key tension described as a frequency conflict
- [CALLOUT] Your Decision Frequency in Practice [/CALLOUT]

## CHAPTER 2: Wealth Frequency (~500 words)
- Core money frequency (Expression number focus)
- Earning style overview
- [CALLOUT] Your Wealth Frequency [/CALLOUT]

## CHAPTER 3: Risk Tolerance Profile (~600 words)
- Dual-channel overview (analytical vs. emotional frequency)
- Include a simplified table: 4 scenarios | Tolerance | Driver
- [CALLOUT] Your Risk Frequency [/CALLOUT]

## CHAPTER 4: Leadership Frequency (~400 words)
- Primary leadership archetype + one pressure-mode shift
- [CALLOUT] Your Leadership Frequency [/CALLOUT]

## CHAPTER 5: Scaling Snapshot (~400 words)
- Natural scaling pattern named
- Where growth typically stalls for this frequency
- [CALLOUT] Your Scaling Rule [/CALLOUT]

## CHAPTER 6: Blind Spots (~400 words)
- TWO blind spots (the most expensive + the stress response)
- Each tied to specific frequency channels
- [CALLOUT] The Uncomfortable Truth [/CALLOUT]

## CHAPTER 7: Revenue Model Fit (~400 words)
- Top 3 aligned models (1-sentence each)
- One "proceed with caution" model
- [CALLOUT] Your Revenue Frequency Filter — 2 questions [/CALLOUT]

## CLOSING (~150 words)
- Personal, encouraging, honest
- Hint that deeper frequency analysis exists (burnout pattern, partnership compatibility, 90-day plan)
- Do NOT name the product — let curiosity drive the upgrade
</report_structure>`;
}

// ── Blueprint Prompt ($88 / Opus) ────────────────────────────────────

export function assembleBlueprintPrompt(fullName: string, dob: string): string {
	const d = extractProfileData(fullName, dob, true);

	const partnership = getPartnershipData(d.lpNum);
	const actionPlan = getActionPlan(d.lpNum, d.exprNum, d.wSign, d.cAnimal);
	const pyData = getPersonalYearData(d.profile.personal_year!.number);
	const quarterly = getQuarterlyData(d.profile);
	const currentYear = new Date().getFullYear();

	return `<s>
${SYSTEM_PROMPT_CORE}

TIER-SPECIFIC RULES (FULL FREQUENCY BLUEPRINT):
- This is a COMPREHENSIVE frequency blueprint. Go deep on every chapter.
- Each main chapter: 900-1200 words. Premium sections: 500-700 words. Total: 8,000-12,000 words.
- Include [INSIGHT] boxes on every chapter — each containing a genuine "uncomfortable truth."
- Include tables in Risk Tolerance (8-scenario matrix), Scaling (5-7 tendencies), and Revenue Models (alignment table).
- Include the Partnership Compatibility Matrix as a table in Chapter 9.
- Use ${d.firstName}'s name 25+ times total.
- Every chapter references at least 3 of the 5 frequency channels.
- All detected frequency tensions must be described as dynamics throughout the report.
- The 90-Day Action Plan must reference their specific frequency markers.
- The Quarterly Forecast must tie frequency themes to concrete business actions.
- Do NOT include any upsell CTA — this is the top tier.
</s>

<subject_profile>
NAME: ${d.fullName}
FIRST NAME: ${d.firstName}
DATE OF BIRTH: ${d.dobDisplay}

FREQUENCY CHANNELS:
- Life Path Frequency: ${d.lpNum} — ${d.lpArchetype}
- Birthday Imprint: ${d.bdDisplay} — ${d.bdTalent}
- Expression Frequency: ${d.exprNum} — ${d.exprArchetype}
- Soul Urge: ${d.suNum} | Personality: ${d.pnNum}
- Western Zodiac: ${d.wDisplay} | ${d.wElem}, ${d.wMod}
- Chinese Zodiac: ${d.cDisplay}
${d.hasKarmic ? `- KARMIC DEBT: ${d.karmic} — ${d.karmicMatrix}` : ""}
${d.hasMasters ? `- MASTER NUMBERS: ${d.masterPositions.join(", ")}` : ""}
- Personal Year (${currentYear}): ${d.profile.personal_year!.number}
- Personal Month: ${d.profile.personal_month!.number}
</subject_profile>

<frequency_data>
=== LIFE PATH ${d.lpNum} ===
${d.lpMatrix}

=== BIRTHDAY ${d.bdDisplay} ===
${d.bdMatrix}

=== EXPRESSION ${d.exprNum} ===
${d.exprMatrix}

=== WESTERN: ${d.wSign} ===
${d.westernMatrix}

=== CHINESE: ${d.cAnimal} + ${d.cElem} ===
${d.chineseMatrix}

=== COMBINATION RULES ===
PRIORITY HIERARCHY:
${d.priorityText}

ACTIVE FREQUENCY TENSIONS:
${d.tensionDescriptions.length ? d.tensionDescriptions.join("\n") : "None — signals largely aligned."}

FREQUENCY AMPLIFICATIONS:
${d.ampDescriptions.length ? d.ampDescriptions.join("\n") : "None detected."}
</frequency_data>

<premium_data>
=== PARTNERSHIP COMPATIBILITY (Life Path ${d.lpNum}) ===
${partnership}

=== 90-DAY ACTION PLAN ARCHETYPE ===
${actionPlan}

=== PERSONAL YEAR FORECAST ===
${pyData}

=== QUARTERLY FREQUENCY FORECAST (${currentYear}) ===
${quarterly}
</premium_data>

<report_structure>
Generate the complete Founder Frequency Blueprint for ${d.firstName}:

## EXECUTIVE PROFILE SYNTHESIS (~500 words)
- Full unified frequency profile — all 5 channels woven together
- What makes this specific frequency combination rare or noteworthy
- Central tension in their founder frequency
- [CALLOUT] Your Core Frequency [/CALLOUT]

## CHAPTER 1: Decision-Making Frequency (~1,000 words)
- 3-4 sub-sections: primary loop, override pattern, speed modifier, talent layer
- All active frequency tensions described as dynamics
- [CALLOUT] Your Decision Frequency in Practice [/CALLOUT]
- [INSIGHT] The decision pattern they can't see [/INSIGHT]

## CHAPTER 2: Wealth Frequency (~1,000 words)
- 3-4 sub-sections: money frequency, earning style, communication multiplier, wealth type
- [CALLOUT] Your Wealth Frequency [/CALLOUT]
- [INSIGHT] The financial belief costing them money [/INSIGHT]

## CHAPTER 3: Risk Tolerance Profile (~1,200 words)
- 3-4 sub-sections: dual frequency channels, collision points, triggers, speculative vs. strategic
- FULL Risk Matrix Table: 6-8 scenarios | Tolerance | Driver
- [CALLOUT] Your Risk Frequency — The Real Answer [/CALLOUT]
- [INSIGHT] The risk behavior they rationalize [/INSIGHT]

## CHAPTER 4: Leadership Frequency (~1,000 words)
- 3-4 sub-sections: default mode, command mode, delegation patterns, team culture
- [CALLOUT] Your Leadership Frequency [/CALLOUT]
- [INSIGHT] The leadership weakness they call a strength [/INSIGHT]

## CHAPTER 5: Scaling Frequency (~1,000 words)
- 3-4 sub-sections: scaling pattern, growth stage strength, plateau causes, partner needs
- Scaling Tendencies Table: 5-7 patterns | Impact
- [CALLOUT] Your Scaling Rule [/CALLOUT]
- [INSIGHT] The scaling behavior that feels productive but stalls growth [/INSIGHT]

## CHAPTER 6: Emotional Blind Spots (~1,000 words)
- 4 named blind spots: most expensive, relationship, stress response, self-perception
- Each tied to specific frequency channels
- [CALLOUT] The Uncomfortable Truth — the meta-blind-spot [/CALLOUT]
- [INSIGHT] What they need externally to compensate [/INSIGHT]

## CHAPTER 7: Revenue Model Alignment (~1,000 words)
- Tier 1 Highest (2-3 models, detailed), Tier 2 Strong (2-3), Tier 3 Caution (2-3)
- Revenue Model Alignment Table: model | tier | driver
- [CALLOUT] Your Revenue Frequency Filter — 3 questions [/CALLOUT]
- [INSIGHT] The model they're attracted to but shouldn't lead with [/INSIGHT]

## CHAPTER 8: Your Burnout Frequency (~700 words) [PREMIUM]
- 5-phase cycle: Trigger → Escalation → Break → Recovery → Re-entry
- Specific to their frequency combination, not generic
- [CALLOUT] Burnout Prevention Protocol — 3 actions [/CALLOUT]

## CHAPTER 9: Partnership Compatibility Matrix (~700 words) [PREMIUM]
- Use the partnership data provided to describe ideal frequency matches for: Co-founder, Operations #2, Creative collaborator, Investor, Mentor
- Include a summary table: Role | Ideal Type | Why | Red Flag Type
- [CALLOUT] Your Ideal #2 [/CALLOUT]

## CHAPTER 10: 90-Day Strategic Action Plan (~600 words) [PREMIUM]
- Use the action plan archetype data provided
- Phase 1 (Days 1-30): Foundation — specific focus + avoid
- Phase 2 (Days 31-60): Build — specific focus + avoid
- Phase 3 (Days 61-90): Launch — specific focus + avoid
- Include the 3 permission slips
- [CALLOUT] Your Non-Negotiable for the Next 90 Days [/CALLOUT]

## CHAPTER 11: Quarterly Frequency Forecast (~500 words) [PREMIUM]
- Use the quarterly data provided
- Map each quarter to a frequency theme + specific business action
- Name the Power Quarter — when to make biggest moves
- [CALLOUT] Your Power Quarter [/CALLOUT]

## CLOSING: Final Word (~300 words)
- Deep, personal, direct
- Central challenge and central capacity
- No upsell CTA — this is the top tier
</report_structure>`;
}

// ── Master Assembler ─────────────────────────────────────────────────

export function assemble(
	fullName: string,
	dob: string,
	tier: "insight" | "blueprint" | "both" = "both",
): AssembledPrompts {
	const result: AssembledPrompts = {};
	if (tier === "insight" || tier === "both")
		result.insight = assembleInsightPrompt(fullName, dob);
	if (tier === "blueprint" || tier === "both")
		result.blueprint = assembleBlueprintPrompt(fullName, dob);
	return result;
}

export function getMetadata(fullName: string, dob: string): ProfileMetadata {
	const profile = calculateExtendedProfile(fullName, dob);
	return {
		summary: profile.summary,
		tensions: detectTensions(profile),
		amplifications: detectAmplifications(profile),
		personal_year: profile.personal_year!,
		quarterly_forecast: profile.quarterly_forecast,
	};
}
