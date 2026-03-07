/**
 * lib/archetypes.ts
 *
 * Founder Frequency Archetype System — 24 named archetypes.
 *
 * Classification logic:
 *   1. Life Path → one of 6 families (visionary, communicator, strategist,
 *                                      connector, builder, disruptor)
 *   2. Dominant element → fire | earth | air | water
 *      Western zodiac element takes precedence; Chinese element reinforces or
 *      overrides when both agree (double element).
 *   3. Tensions + amplifications add modifier notes to the description —
 *      they don't create new archetypes, they personalise the one you land in.
 *
 * Chinese → Western element mapping:
 *   Fire  → fire   |  Earth → earth  |  Water → water
 *   Metal → earth  |  Wood  → air
 */

import type { Profile } from "./calculator";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ArchetypeFamily =
	| "visionary"
	| "communicator"
	| "strategist"
	| "connector"
	| "builder"
	| "disruptor";

export type ArchetypeElement = "fire" | "earth" | "air" | "water";

export interface Archetype {
	name: string;
	tagline: string;
	description: string;
	family: ArchetypeFamily;
	element: ArchetypeElement;
}

export interface ArchetypeResult extends Archetype {
	isDoubleElement: boolean;
	tensionModifier: string | null;
	amplificationModifier: string | null;
}

// ── Life Path → Family ────────────────────────────────────────────────────────

const LP_FAMILY: Record<number, ArchetypeFamily> = {
	1: "visionary",
	2: "connector",
	3: "communicator",
	4: "builder",
	5: "disruptor",
	6: "connector",
	7: "strategist",
	8: "builder",
	9: "connector",
	11: "visionary",
	22: "builder",
	33: "communicator",
};

// ── Chinese element → Western equivalent ─────────────────────────────────────

const CHINESE_TO_WESTERN: Record<string, ArchetypeElement> = {
	Fire: "fire",
	Earth: "earth",
	Metal: "earth",
	Water: "water",
	Wood: "air",
};

// ── Western sign → element ────────────────────────────────────────────────────

const WESTERN_ELEMENT: Record<string, ArchetypeElement> = {
	Aries: "fire", Leo: "fire", Sagittarius: "fire",
	Taurus: "earth", Virgo: "earth", Capricorn: "earth",
	Gemini: "air", Libra: "air", Aquarius: "air",
	Cancer: "water", Scorpio: "water", Pisces: "water",
};

// ── 24 Archetypes ─────────────────────────────────────────────────────────────

const ARCHETYPES: Record<`${ArchetypeFamily}_${ArchetypeElement}`, Archetype> = {

	// ── VISIONARY (LP 1, 11) ── "I see what's coming" ──────────────────────────
	visionary_fire: {
		name: "The Spark",
		tagline: "You ignite movements before others see the fire.",
		description:
			"You don't wait for permission to move — you move and the world catches up. Your frequency is high-urgency, high-vision, and combustible. You're the founder who launches first and iterates loud. The risk isn't losing — it's burning through fuel before the machine is built.",
		family: "visionary",
		element: "fire",
	},
	visionary_earth: {
		name: "The Pathfinder",
		tagline: "You see the future clearly enough to build a road to it.",
		description:
			"You carry rare vision paired with an unusual patience. You don't just see where things are going — you can map the terrain between here and there. Your decisions feel intuitive but they're grounded in observation. Founders trust you before they know why. The risk is moving so slowly toward the horizon that others get there first.",
		family: "visionary",
		element: "earth",
	},
	visionary_air: {
		name: "The Signal",
		tagline: "You pick up frequencies others can't hear yet.",
		description:
			"You think in transmissions. Ideas arrive fully formed, connections appear before you can explain them, and your best strategy sessions happen alone at 2am. Your edge is pattern recognition at speed. The risk is broadcasting on a channel your audience isn't tuned to yet — clarity of communication is the gap between prophet and founder.",
		family: "visionary",
		element: "air",
	},
	visionary_water: {
		name: "The Oracle",
		tagline: "You know before you know why you know.",
		description:
			"Your intuition isn't a soft skill — it's a data stream. You read rooms, markets, and people at a depth others can't access. The insights you act on are often validated months later. Your founder superpower is knowing when to trust stillness. The risk is second-guessing the signal until it's too late to use it.",
		family: "visionary",
		element: "water",
	},

	// ── COMMUNICATOR (LP 3, 33) ── "I move people with words" ──────────────────
	communicator_fire: {
		name: "The Amplifier",
		tagline: "You make ideas louder. Rooms change when you speak.",
		description:
			"You are the frequency multiplier. Give you a message and you will broadcast it further, faster, and with more heat than anyone expected. You build audiences, movements, and momentum before the product is ready. Your risk is all signal, no structure — energy without a container dissipates. Build the machine behind the mic.",
		family: "communicator",
		element: "fire",
	},
	communicator_earth: {
		name: "The Proof Point",
		tagline: "You build trust through demonstration, not declaration.",
		description:
			"You don't sell — you show. Your communication lands because it's grounded in evidence, repetition, and follow-through. People believe what you say because you've done what you said before. You're the founder whose track record does the marketing. The risk is underinvesting in visibility — being too trusted by too few people.",
		family: "communicator",
		element: "earth",
	},
	communicator_air: {
		name: "The Translator",
		tagline: "You make the complex feel obvious. That's your edge.",
		description:
			"You hold the rare frequency of intellectual depth plus accessibility. You can take a system that took you years to understand and explain it in 60 seconds without dumbing it down. That's not a writing skill — it's a business model. The founders who hire you, follow you, or buy from you do so because you named something they couldn't say themselves.",
		family: "communicator",
		element: "air",
	},
	communicator_water: {
		name: "The Resonator",
		tagline: "You don't just communicate — you connect at a frequency people feel.",
		description:
			"Your words land differently because they come from somewhere real. You write or speak in a way that makes people feel understood before they've said anything back. This is emotional intelligence weaponised as content, sales, and leadership. Your risk is overexposure — giving too much too freely until the signal feels like noise.",
		family: "communicator",
		element: "water",
	},

	// ── STRATEGIST (LP 7) ── "I see the system underneath" ────────────────────
	strategist_fire: {
		name: "The Disruptive Analyst",
		tagline: "You see the flaw in every system — and can't not fix it.",
		description:
			"You have the mind of an analyst and the impatience of a founder. You don't just identify what's broken — you feel personally offended by inefficiency. You move fast for a 7, and that's your edge. You build from conviction, not consensus. The risk is shipping a solution before you've fully modelled the problem — your intuition races ahead of your framework.",
		family: "strategist",
		element: "fire",
	},
	strategist_earth: {
		name: "The Signal Architect",
		tagline: "You build precise, defensible models. Every detail is intentional.",
		description:
			"You construct systems that work exactly as designed. Your competitive moat is depth — nobody else has gone where you've gone on this problem. You don't make decisions without data, and your data is better than everyone else's. The risk is analysis paralysis and perfectionism as a procrastination strategy. You know the launch date you keep moving.",
		family: "strategist",
		element: "earth",
	},
	strategist_air: {
		name: "The Pattern Reader",
		tagline: "You think in frameworks. Your competitive advantage is clarity.",
		description:
			"You see the underlying structure of things most people experience as noise. Markets, conversations, organisations — you extract the pattern and build from it. You're the founder with the whiteboard that changes how a room thinks about a problem. The risk is living in abstraction — your frameworks need to touch the ground to generate revenue.",
		family: "strategist",
		element: "air",
	},
	strategist_water: {
		name: "The Deep Current",
		tagline: "Your strategy emerges from stillness. Others call it instinct — it isn't.",
		description:
			"You operate below the surface. Your best decisions don't look like decisions — they look like inevitability. You read beneath the data to the current underneath, and you're rarely wrong about where a market or person is actually going. The risk is that your depth makes you slow to surface what you know — by the time you name your insight, someone louder has already shipped it.",
		family: "strategist",
		element: "water",
	},

	// ── CONNECTOR (LP 2, 6, 9) ── "I build through people" ────────────────────
	connector_fire: {
		name: "The Catalyst",
		tagline: "You accelerate everyone around you. Rooms reorganize in your presence.",
		description:
			"You don't build companies — you build the people who build companies. Your frequency is relational energy at high heat. Introductions you make turn into deals. Conversations you start become movements. Your business model, whether you see it yet or not, runs on activation. The risk is burning relationships fast in pursuit of momentum. Depth compounds; breadth disperses.",
		family: "connector",
		element: "fire",
	},
	connector_earth: {
		name: "The Anchor",
		tagline: "People build on you. That's not a burden — that's your business model.",
		description:
			"You are the constant in other people's chaos. Founders trust you because you show up the same way every time — steady, grounded, and clear. Your frequency is reliability at scale. Teams don't just follow you; they organise themselves around you. The risk is carrying weight that isn't yours to carry — the anchor that never lifts eventually becomes the thing that sinks.",
		family: "connector",
		element: "earth",
	},
	connector_air: {
		name: "The Network Weaver",
		tagline: "You connect dots across rooms. Your network is your revenue.",
		description:
			"You move through ecosystems like a current — picking up signals, cross-pollinating ideas, and surfacing connections nobody else could have made. You don't just know people; you know how to place people next to each other in ways that create something new. The risk is living in the middle of everyone else's momentum without building your own. What does your network do for you?",
		family: "connector",
		element: "air",
	},
	connector_water: {
		name: "The Quiet Operator",
		tagline: "Your influence runs deep and quiet. People don't see it coming.",
		description:
			"You don't announce moves — you make them. Your power is relational depth over relational breadth. The people in your inner circle would do almost anything for you because you've actually shown up for them. Your business, your deals, and your reputation are all built the same way: one real relationship at a time. The risk is remaining invisible to the market that would pay you best.",
		family: "connector",
		element: "water",
	},

	// ── BUILDER (LP 4, 8, 22) ── "I create structure" ──────────────────────────
	builder_fire: {
		name: "The Forge",
		tagline: "You build fast under pressure. Structure is your weapon, not your cage.",
		description:
			"You don't just create infrastructure — you create it on fire. Your frequency is urgency plus discipline, and you can maintain both simultaneously when most founders can only hold one. You don't need perfect conditions to build; pressure is your material. The risk is burning the structure down before it sets — building at heat requires knowing when to cool.",
		family: "builder",
		element: "fire",
	},
	builder_earth: {
		name: "The Architect",
		tagline: "You build to last. Every move is load-bearing.",
		description:
			"You think in decades. While other founders ship fast and pivot, you're building the thing behind the thing — the infrastructure that will still be running when everyone else has rebuilt from scratch twice. Your business instincts are structural: what's the foundation? What holds weight? What fails first under load? The risk is building so carefully that the market moves before you've finished the blueprint.",
		family: "builder",
		element: "earth",
	},
	builder_air: {
		name: "The Blueprint Maker",
		tagline: "You design systems others execute. Your frameworks are the product.",
		description:
			"You build at the level of design, not just delivery. Your frameworks, processes, and models become the operating system for other people's companies. The thing you make tends to be replicable — you don't build for one client, you build once and deploy everywhere. The risk is over-engineering the system and under-investing in the people who need to run it.",
		family: "builder",
		element: "air",
	},
	builder_water: {
		name: "The Deep Builder",
		tagline: "You build quietly, deeply, and it holds forever.",
		description:
			"Your frequency is patient accumulation. You don't need credit for what you build — you need it to work. You go deeper than the role requires, document what others ignore, and create institutional knowledge that outlasts you. Organisations don't realise how much of their stability you were until you step back. The risk is being undervalued precisely because what you build looks effortless.",
		family: "builder",
		element: "water",
	},

	// ── DISRUPTOR (LP 5) ── "I break the pattern to find the opportunity" ───────
	disruptor_fire: {
		name: "The Wildfire",
		tagline: "You move fast, burn bright, and change everything you touch.",
		description:
			"You are uncontainable by design. Your frequency operates at the edge of sustainable — high velocity, high heat, high impact. You don't iterate; you ignite. Markets, categories, conversations — you enter them and they're different afterwards. The risk is obvious: wildfires don't build, they clear. The question is whether you're making space for something new or just burning.",
		family: "disruptor",
		element: "fire",
	},
	disruptor_earth: {
		name: "The Methodical Rebel",
		tagline: "You disrupt with evidence. Your revolution has a spreadsheet.",
		description:
			"You are the most dangerous kind of disruptor: a patient one. You don't blow things up — you build the alternative so well that the original becomes obsolete. Your frequency is disciplined nonconformity. You question everything but act deliberately. The risk is that your evidence-based approach makes you slower than the market moment requires. Sometimes the spreadsheet is the thing that's holding you back.",
		family: "disruptor",
		element: "earth",
	},
	disruptor_air: {
		name: "The Frequency Shifter",
		tagline: "You change how people think. That's your real product.",
		description:
			"You don't disrupt markets — you disrupt mental models. Your frequency operates at the level of ideas: you introduce a frame that makes the old way of thinking impossible to return to. The best founders, writers, and operators in your orbit leave your conversations thinking differently about everything. The risk is that shifting frequency is hard to monetise directly — you need a business model for your ideas.",
		family: "disruptor",
		element: "air",
	},
	disruptor_water: {
		name: "The Undercurrent",
		tagline: "Your disruption is quiet — until everyone realises the tide has shifted.",
		description:
			"You move unseen. While other disruptors announce their intentions, you're already three moves deep into the new reality. Your frequency is subversive patience — you see where the current is going and you position yourself there before anyone else knows it's moving. The risk is that invisibility can become a habit. At some point, the market needs to know the current has a name.",
		family: "disruptor",
		element: "water",
	},
};

// ── Tension modifiers ─────────────────────────────────────────────────────────

const TENSION_MODIFIERS: Record<string, string> = {
	speed_vs_depth:
		"Your channels carry a speed-vs-depth tension — the part of you that wants to move fast is in direct conflict with the part that needs to understand completely. This is your most productive friction.",
	security_vs_freedom:
		"You carry a security-vs-freedom tension — a pull between building something stable and keeping every door open. Most of your pivots are this tension making a decision for you.",
	solo_vs_collaborative:
		"Your channels show a solo-vs-collaborative tension — you work best alone but need people to scale. Figuring out exactly where that handoff happens is your core leadership challenge.",
	spiritual_vs_material:
		"You carry a spiritual-vs-material tension — a conflict between what you're building for and how you're building it. When this resolves, your revenue model usually clarifies.",
	creative_vs_structural:
		"Your channels hold a creative-vs-structural tension — the generative side and the organised side fight for airtime. Your best work happens when you stop choosing between them.",
};

// ── Amplification modifiers ───────────────────────────────────────────────────

const AMPLIFICATION_MODIFIERS: Record<string, string> = {
	double_fire:
		"You carry double fire — both your Western and Chinese channels are combustible. Everything you do is amplified: your wins, your speed, and your burnout risk.",
	double_water:
		"You carry double water — your intuition is running at twice the signal strength. Trust what you feel in the room more than what the data says.",
	double_earth:
		"You carry double earth — your instincts toward stability, structure, and long-term thinking are reinforced on both channels. You build things that last.",
	double_air:
		"You carry double air — your mental frequency is doubled. Ideas arrive faster than most people can process. Your challenge is execution speed, not idea generation.",
	master_number_presence:
		"You carry a Master Number — a frequency that amplifies both your gifts and your challenges. The ceiling is higher; so is the pressure.",
};

// ── Classification ────────────────────────────────────────────────────────────

export function classifyArchetype(
	profile: Profile,
	tensions: string[],
	amplifications: string[],
): ArchetypeResult {
	// 1. Life Path family
	const lp = profile.life_path.number;
	const family = LP_FAMILY[lp] ?? "builder";

	// 2. Dominant element
	const westernEl = WESTERN_ELEMENT[profile.western_zodiac.sign] ?? "fire";
	const chineseEl = CHINESE_TO_WESTERN[profile.chinese_zodiac.element] ?? westernEl;
	const isDoubleElement = westernEl === chineseEl;
	// Western takes precedence; Chinese reinforces or is noted
	const element: ArchetypeElement = westernEl;

	// 3. Look up archetype
	const key = `${family}_${element}` as `${ArchetypeFamily}_${ArchetypeElement}`;
	const archetype = ARCHETYPES[key];

	// 4. Tension modifier — use the first (most significant) tension
	const tensionModifier =
		tensions.length > 0 ? (TENSION_MODIFIERS[tensions[0]] ?? null) : null;

	// 5. Amplification modifier — prioritise double-element; fall back to master number
	const doubleAmpKey = isDoubleElement ? `double_${element}` : null;
	const ampKey =
		doubleAmpKey && amplifications.includes(doubleAmpKey)
			? doubleAmpKey
			: amplifications[0] ?? null;
	const amplificationModifier = ampKey ? (AMPLIFICATION_MODIFIERS[ampKey] ?? null) : null;

	return {
		...archetype,
		isDoubleElement,
		tensionModifier,
		amplificationModifier,
	};
}
