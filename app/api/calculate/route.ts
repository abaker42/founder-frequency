/**
 * POST /api/calculate
 *
 * Free calculator endpoint — takes name + DOB, returns the 5 frequency
 * channel values plus a teaser snippet. Powers the landing page widget.
 *
 * Body: { name: string, dob: string }
 * Returns: summary + teaser text (no full report)
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateProfile } from "@/lib/calculator";
import { detectTensions, detectAmplifications } from "@/lib/assembler";

export async function POST(req: NextRequest) {
	try {
		const { name, dob } = await req.json();

		if (!name || !dob) {
			return NextResponse.json(
				{ error: "Name and date of birth are required." },
				{ status: 400 },
			);
		}

		const profile = calculateProfile(name, dob);
		const tensions = detectTensions(profile);
		const amplifications = detectAmplifications(profile);
		const firstName = name.trim().split(/\s+/)[0];

		// Build teaser — enough to hook, not enough to satisfy
		const tensionTeaser =
			tensions.length > 0
				? `Your frequency profile contains ${tensions.length} active tension${tensions.length > 1 ? "s" : ""} — conflicting signals that most founders never decode. This is where your biggest advantage is hiding.`
				: `Your frequency channels are largely aligned — a rare configuration that gives you unusual clarity in decision-making.`;

		const masterTeaser =
			profile.life_path.is_master || profile.expression.is_master
				? ` You carry a Master Number frequency — only ~11% of the population does. This amplifies everything.`
				: "";

		return NextResponse.json({
			firstName,
			summary: profile.summary,
			teaser: {
				headline: `${firstName}, your founder frequency is ${profile.life_path.number}-${profile.expression.number}-${profile.western_zodiac.sign}`,
				body: tensionTeaser + masterTeaser,
				tensionCount: tensions.length,
				amplificationCount: amplifications.length,
				hasMasterNumber:
					profile.life_path.is_master ||
					profile.expression.is_master ||
					profile.birthday_number.is_master,
				hasKarmicDebt: profile.birthday_number.karmic_debt !== null,
			},
		});
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message || "Invalid input." },
			{ status: 400 },
		);
	}
}
