/**
 * Founder Frequency — Layer 1: Calculation Engine
 *
 * Takes a full name + date of birth, returns all five frequency channel values:
 *   1. Life Path Number (with Master Number detection)
 *   2. Birthday Number (with Karmic Debt detection)
 *   3. Expression Number (with Master Number detection)
 *   4. Western Zodiac Sign + Element + Modality
 *   5. Chinese Zodiac Animal + Element + Yin/Yang
 *
 * Plus: Soul Urge, Personality, Personal Year/Month/Quarter
 */

// ── Types ────────────────────────────────────────────────────────────

export interface LifePath {
	number: number;
	reduced: number;
	is_master: boolean;
	calculation: string;
	components: { month: number; day: number; year: number; sum: number };
}

export interface BirthdayNumber {
	compound: number;
	reduced: number;
	is_master: boolean;
	karmic_debt: string | null;
	display: string;
	calculation: string;
}

export interface ExpressionNumber {
	number: number;
	reduced: number;
	is_master: boolean;
	parts: {
		name_part: string;
		letter_values: Record<string, number>;
		raw_sum: number;
		reduced: number;
		is_master: boolean;
	}[];
	calculation: string;
	total_before_reduction: number;
}

export interface SoulUrge {
	number: number;
	reduced: number;
	is_master: boolean;
	vowels_used: string[];
}

export interface PersonalityNumber {
	number: number;
	reduced: number;
	is_master: boolean;
}

export interface WesternZodiac {
	sign: string;
	element: string;
	modality: string;
	cusp: string | null;
	display: string;
}

export interface ChineseZodiac {
	animal: string;
	element: string;
	polarity: string;
	effective_year: number;
	display: string;
}

export interface PersonalYear {
	number: number;
	year: number;
	calculation: string;
}

export interface PersonalMonth {
	number: number;
	month: number;
	calculation: string;
}

export interface QuarterForecast {
	quarter: number;
	months: number[];
	energies: number[];
	dominant_energy: number;
}

export interface QuarterlyForecast {
	personal_year: number;
	year: number;
	quarters: QuarterForecast[];
}

export interface Profile {
	input: {
		name: string;
		dob: string;
		parsed: { month: number; day: number; year: number };
	};
	life_path: LifePath;
	birthday_number: BirthdayNumber;
	expression: ExpressionNumber;
	soul_urge: SoulUrge;
	personality: PersonalityNumber;
	western_zodiac: WesternZodiac;
	chinese_zodiac: ChineseZodiac;
	summary: Record<string, string | number>;
	// Extended (optional)
	personal_year?: PersonalYear;
	personal_month?: PersonalMonth;
	quarterly_forecast?: QuarterlyForecast;
}

// ── Constants ────────────────────────────────────────────────────────

const LETTER_VALUES: Record<string, number> = {
	A: 1,
	B: 2,
	C: 3,
	D: 4,
	E: 5,
	F: 6,
	G: 7,
	H: 8,
	I: 9,
	J: 1,
	K: 2,
	L: 3,
	M: 4,
	N: 5,
	O: 6,
	P: 7,
	Q: 8,
	R: 9,
	S: 1,
	T: 2,
	U: 3,
	V: 4,
	W: 5,
	X: 6,
	Y: 7,
	Z: 8,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);
const MASTER_NUMBERS = new Set([11, 22, 33]);
const KARMIC_DEBT_NUMBERS = new Set([13, 14, 16, 19]);

// Chinese Zodiac Lunar New Year dates (1924–2044)
const LUNAR_NEW_YEAR: Record<number, [number, number, number]> = {
	1924: [1924, 2, 5],
	1925: [1925, 1, 25],
	1926: [1926, 2, 13],
	1927: [1927, 2, 2],
	1928: [1928, 1, 23],
	1929: [1929, 2, 10],
	1930: [1930, 1, 30],
	1931: [1931, 2, 17],
	1932: [1932, 2, 6],
	1933: [1933, 1, 26],
	1934: [1934, 2, 14],
	1935: [1935, 2, 4],
	1936: [1936, 1, 24],
	1937: [1937, 2, 11],
	1938: [1938, 1, 31],
	1939: [1939, 2, 19],
	1940: [1940, 2, 8],
	1941: [1941, 1, 27],
	1942: [1942, 2, 15],
	1943: [1943, 2, 5],
	1944: [1944, 1, 25],
	1945: [1945, 2, 13],
	1946: [1946, 2, 2],
	1947: [1947, 1, 22],
	1948: [1948, 2, 10],
	1949: [1949, 1, 29],
	1950: [1950, 2, 17],
	1951: [1951, 2, 6],
	1952: [1952, 1, 27],
	1953: [1953, 2, 14],
	1954: [1954, 2, 3],
	1955: [1955, 1, 24],
	1956: [1956, 2, 12],
	1957: [1957, 1, 31],
	1958: [1958, 2, 18],
	1959: [1959, 2, 8],
	1960: [1960, 1, 28],
	1961: [1961, 2, 15],
	1962: [1962, 2, 5],
	1963: [1963, 1, 25],
	1964: [1964, 2, 13],
	1965: [1965, 2, 2],
	1966: [1966, 1, 21],
	1967: [1967, 2, 9],
	1968: [1968, 1, 30],
	1969: [1969, 2, 17],
	1970: [1970, 2, 6],
	1971: [1971, 1, 27],
	1972: [1972, 2, 15],
	1973: [1973, 2, 3],
	1974: [1974, 1, 23],
	1975: [1975, 2, 11],
	1976: [1976, 1, 31],
	1977: [1977, 2, 18],
	1978: [1978, 2, 7],
	1979: [1979, 1, 28],
	1980: [1980, 2, 16],
	1981: [1981, 2, 5],
	1982: [1982, 1, 25],
	1983: [1983, 2, 13],
	1984: [1984, 2, 2],
	1985: [1985, 2, 20],
	1986: [1986, 2, 9],
	1987: [1987, 1, 29],
	1988: [1988, 2, 17],
	1989: [1989, 2, 6],
	1990: [1990, 1, 27],
	1991: [1991, 2, 15],
	1992: [1992, 2, 4],
	1993: [1993, 1, 23],
	1994: [1994, 2, 10],
	1995: [1995, 1, 31],
	1996: [1996, 2, 19],
	1997: [1997, 2, 7],
	1998: [1998, 1, 28],
	1999: [1999, 2, 16],
	2000: [2000, 2, 5],
	2001: [2001, 1, 24],
	2002: [2002, 2, 12],
	2003: [2003, 2, 1],
	2004: [2004, 1, 22],
	2005: [2005, 2, 9],
	2006: [2006, 1, 29],
	2007: [2007, 2, 18],
	2008: [2008, 2, 7],
	2009: [2009, 1, 26],
	2010: [2010, 2, 14],
	2011: [2011, 2, 3],
	2012: [2012, 1, 23],
	2013: [2013, 2, 10],
	2014: [2014, 1, 31],
	2015: [2015, 2, 19],
	2016: [2016, 2, 8],
	2017: [2017, 1, 28],
	2018: [2018, 2, 16],
	2019: [2019, 2, 5],
	2020: [2020, 1, 25],
	2021: [2021, 2, 12],
	2022: [2022, 2, 1],
	2023: [2023, 1, 22],
	2024: [2024, 2, 10],
	2025: [2025, 1, 29],
	2026: [2026, 2, 17],
	2027: [2027, 2, 6],
	2028: [2028, 1, 26],
	2029: [2029, 2, 13],
	2030: [2030, 2, 3],
	2031: [2031, 1, 23],
	2032: [2032, 2, 11],
	2033: [2033, 1, 31],
	2034: [2034, 2, 19],
	2035: [2035, 2, 8],
	2036: [2036, 1, 28],
	2037: [2037, 2, 15],
	2038: [2038, 2, 4],
	2039: [2039, 1, 24],
	2040: [2040, 2, 12],
	2041: [2041, 2, 1],
	2042: [2042, 1, 22],
	2043: [2043, 2, 10],
	2044: [2044, 1, 30],
};

const CHINESE_ANIMALS = [
	"Rat",
	"Ox",
	"Tiger",
	"Rabbit",
	"Dragon",
	"Snake",
	"Horse",
	"Goat",
	"Monkey",
	"Rooster",
	"Dog",
	"Pig",
];
const CHINESE_ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];
const CHINESE_YIN_YANG = ["Yang", "Yin"];

const SIGN_RANGES: [number, number, string, string, string][] = [
	[1, 20, "Aquarius", "Air", "Fixed"],
	[2, 19, "Pisces", "Water", "Mutable"],
	[3, 21, "Aries", "Fire", "Cardinal"],
	[4, 20, "Taurus", "Earth", "Fixed"],
	[5, 21, "Gemini", "Air", "Mutable"],
	[6, 21, "Cancer", "Water", "Cardinal"],
	[7, 23, "Leo", "Fire", "Fixed"],
	[8, 23, "Virgo", "Earth", "Mutable"],
	[9, 23, "Libra", "Air", "Cardinal"],
	[10, 23, "Scorpio", "Water", "Fixed"],
	[11, 22, "Sagittarius", "Fire", "Mutable"],
	[12, 22, "Capricorn", "Earth", "Cardinal"],
];

// ── Core Reduction ───────────────────────────────────────────────────

export function reduceToSingle(n: number, preserveMasters = true): number {
	while (n > 9) {
		if (preserveMasters && MASTER_NUMBERS.has(n)) return n;
		n = String(n)
			.split("")
			.reduce((sum, d) => sum + Number(d), 0);
	}
	return n;
}

function detectKarmicDebt(unreduced: number, reduced: number): string | null {
	if (KARMIC_DEBT_NUMBERS.has(unreduced)) return `${unreduced}/${reduced}`;
	return null;
}

// ── Life Path ────────────────────────────────────────────────────────

export function calculateLifePath(
	month: number,
	day: number,
	year: number,
): LifePath {
	const m = reduceToSingle(month);
	const d = reduceToSingle(day);
	const y = reduceToSingle(
		String(year)
			.split("")
			.reduce((s, c) => s + Number(c), 0),
	);

	const total = m + d + y;
	const masterAtSum = MASTER_NUMBERS.has(total);
	const final = reduceToSingle(total);
	const isMaster = MASTER_NUMBERS.has(final) || masterAtSum;

	return {
		number: masterAtSum ? total : final,
		reduced: final,
		is_master: isMaster,
		calculation: `${month}→${m} | ${day}→${d} | ${year}→${y} | ${m}+${d}+${y} = ${total} → ${masterAtSum ? total : final}`,
		components: { month: m, day: d, year: y, sum: total },
	};
}

// ── Birthday Number ──────────────────────────────────────────────────

export function calculateBirthdayNumber(day: number): BirthdayNumber {
	const reduced = reduceToSingle(day, true);
	const karmic = detectKarmicDebt(day, reduced);

	return {
		compound: day,
		reduced,
		is_master: MASTER_NUMBERS.has(day) || MASTER_NUMBERS.has(reduced),
		karmic_debt: karmic,
		display: day > 9 ? `${day}/${reduced}` : String(day),
		calculation: `Day ${day} → ${reduced}${karmic ? ` (Karmic Debt ${karmic})` : ""}`,
	};
}

// ── Expression Number ────────────────────────────────────────────────

export function calculateExpressionNumber(fullName: string): ExpressionNumber {
	const nameUpper = fullName.toUpperCase().trim();
	const parts = nameUpper.split(/\s+/);

	const partDetails: ExpressionNumber["parts"] = [];
	const partValues: number[] = [];

	for (const part of parts) {
		const letters = part.split("").filter((c) => /[A-Z]/.test(c));
		const letterValues: Record<string, number> = {};
		let rawSum = 0;

		for (const c of letters) {
			const val = LETTER_VALUES[c] || 0;
			letterValues[c] = val;
			rawSum += val;
		}

		const reduced = reduceToSingle(rawSum);
		const isMaster = MASTER_NUMBERS.has(reduced) || MASTER_NUMBERS.has(rawSum);

		partDetails.push({
			name_part: part,
			letter_values: letterValues,
			raw_sum: rawSum,
			reduced: MASTER_NUMBERS.has(reduced) ? rawSum : reduced,
			is_master: isMaster,
		});

		partValues.push(MASTER_NUMBERS.has(rawSum) ? rawSum : reduced);
	}

	const total = partValues.reduce((s, v) => s + v, 0);
	const final = reduceToSingle(total);
	const masterAtTotal = MASTER_NUMBERS.has(total);

	return {
		number: masterAtTotal ? total : final,
		reduced: final,
		is_master: masterAtTotal || MASTER_NUMBERS.has(final),
		parts: partDetails,
		calculation:
			partDetails
				.map((p) => `${p.name_part}(${p.raw_sum}→${p.reduced})`)
				.join(" + ") + ` = ${total} → ${masterAtTotal ? total : final}`,
		total_before_reduction: total,
	};
}

// ── Soul Urge ────────────────────────────────────────────────────────

export function calculateSoulUrge(fullName: string): SoulUrge {
	const nameUpper = fullName.toUpperCase().trim();
	const vowelsUsed: string[] = [];
	let raw = 0;

	for (const c of nameUpper) {
		if (VOWELS.has(c)) {
			vowelsUsed.push(c);
			raw += LETTER_VALUES[c] || 0;
		}
	}

	const final = reduceToSingle(raw);
	return {
		number: MASTER_NUMBERS.has(raw) ? raw : final,
		reduced: final,
		is_master: MASTER_NUMBERS.has(raw) || MASTER_NUMBERS.has(final),
		vowels_used: vowelsUsed,
	};
}

// ── Personality Number ───────────────────────────────────────────────

export function calculatePersonalityNumber(
	fullName: string,
): PersonalityNumber {
	const nameUpper = fullName.toUpperCase().trim();
	let raw = 0;

	for (const c of nameUpper) {
		if (/[A-Z]/.test(c) && !VOWELS.has(c)) {
			raw += LETTER_VALUES[c] || 0;
		}
	}

	const final = reduceToSingle(raw);
	return {
		number: MASTER_NUMBERS.has(raw) ? raw : final,
		reduced: final,
		is_master: MASTER_NUMBERS.has(raw) || MASTER_NUMBERS.has(final),
	};
}

// ── Western Zodiac ───────────────────────────────────────────────────

export function calculateWesternZodiac(
	month: number,
	day: number,
): WesternZodiac {
	let sign = "Capricorn",
		element = "Earth",
		modality = "Cardinal";

	for (const [sm, sd, s, e, m] of SIGN_RANGES) {
		if (month > sm || (month === sm && day >= sd)) {
			sign = s;
			element = e;
			modality = m;
		}
	}

	// Cusp detection (within 2 days of boundary)
	let cusp: string | null = null;
	for (const [sm, sd, s] of SIGN_RANGES) {
		const diffDays = (month - sm) * 30 + (day - sd);
		if (Math.abs(diffDays) <= 2 && s !== sign) {
			cusp = s;
			break;
		}
	}

	return {
		sign,
		element,
		modality,
		cusp,
		display: cusp ? `${sign} (cusp of ${cusp})` : sign,
	};
}

// ── Chinese Zodiac ───────────────────────────────────────────────────

export function calculateChineseZodiac(
	year: number,
	month: number,
	day: number,
): ChineseZodiac {
	let effectiveYear = year;

	// Check if birth is before Lunar New Year
	if (LUNAR_NEW_YEAR[year]) {
		const [, lnyM, lnyD] = LUNAR_NEW_YEAR[year];
		if (month < lnyM || (month === lnyM && day < lnyD)) {
			effectiveYear = year - 1;
		}
	} else {
		// Fallback for years outside the table
		if (month === 1 || (month === 2 && day < 4)) {
			effectiveYear = year - 1;
		}
	}

	const animalIndex = (((effectiveYear - 4) % 12) + 12) % 12;
	const animal = CHINESE_ANIMALS[animalIndex];

	const elementIndex = Math.floor(((((effectiveYear - 4) % 10) + 10) % 10) / 2);
	const element = CHINESE_ELEMENTS[elementIndex];

	const polarity = CHINESE_YIN_YANG[effectiveYear % 2];

	return {
		animal,
		element,
		polarity,
		effective_year: effectiveYear,
		display: `${element} ${animal} (${polarity})`,
	};
}

// ── Date Parsing ─────────────────────────────────────────────────────

export function parseDate(dob: string): {
	month: number;
	day: number;
	year: number;
} {
	const cleaned = dob.trim();

	// Try MM/DD/YYYY or MM-DD-YYYY
	const usMatch = cleaned.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
	if (usMatch) {
		return {
			month: Number(usMatch[1]),
			day: Number(usMatch[2]),
			year: Number(usMatch[3]),
		};
	}

	// Try YYYY-MM-DD
	const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (isoMatch) {
		return {
			month: Number(isoMatch[2]),
			day: Number(isoMatch[3]),
			year: Number(isoMatch[1]),
		};
	}

	throw new Error(`Cannot parse date: ${dob}. Use MM/DD/YYYY format.`);
}

// ── Personal Year / Month / Quarter ──────────────────────────────────

export function calculatePersonalYear(
	birthMonth: number,
	birthDay: number,
	targetYear: number,
): PersonalYear {
	const m = reduceToSingle(birthMonth, false);
	const d = reduceToSingle(birthDay, false);
	const y = reduceToSingle(
		String(targetYear)
			.split("")
			.reduce((s, c) => s + Number(c), 0),
		false,
	);
	const total = m + d + y;
	const final = reduceToSingle(total, false);

	return {
		number: final,
		year: targetYear,
		calculation: `${birthMonth}→${m} + ${birthDay}→${d} + ${targetYear}→${y} = ${total} → ${final}`,
	};
}

export function calculatePersonalMonth(
	personalYear: number,
	calendarMonth: number,
): PersonalMonth {
	const total = personalYear + calendarMonth;
	const final = reduceToSingle(total, false);
	return {
		number: final,
		month: calendarMonth,
		calculation: `PY${personalYear} + M${calendarMonth} = ${total} → ${final}`,
	};
}

export function calculateQuarterlyForecast(
	birthMonth: number,
	birthDay: number,
	targetYear: number,
): QuarterlyForecast {
	const py = calculatePersonalYear(birthMonth, birthDay, targetYear).number;
	const quarters: QuarterForecast[] = [];

	for (let q = 1; q <= 4; q++) {
		const months = [(q - 1) * 3 + 1, (q - 1) * 3 + 2, (q - 1) * 3 + 3];
		const energies = months.map((m) => calculatePersonalMonth(py, m).number);

		// Find most frequent energy (dominant)
		const counts: Record<number, number> = {};
		for (const e of energies) counts[e] = (counts[e] || 0) + 1;
		const dominant = Number(
			Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0],
		);

		quarters.push({ quarter: q, months, energies, dominant_energy: dominant });
	}

	return { personal_year: py, year: targetYear, quarters };
}

// ── Master Functions ─────────────────────────────────────────────────

export function calculateProfile(fullName: string, dob: string): Profile {
	const { month, day, year } = parseDate(dob);

	const lifePath = calculateLifePath(month, day, year);
	const birthdayNumber = calculateBirthdayNumber(day);
	const expression = calculateExpressionNumber(fullName);
	const soulUrge = calculateSoulUrge(fullName);
	const personality = calculatePersonalityNumber(fullName);
	const westernZodiac = calculateWesternZodiac(month, day);
	const chineseZodiac = calculateChineseZodiac(year, month, day);

	return {
		input: { name: fullName, dob, parsed: { month, day, year } },
		life_path: lifePath,
		birthday_number: birthdayNumber,
		expression,
		soul_urge: soulUrge,
		personality,
		western_zodiac: westernZodiac,
		chinese_zodiac: chineseZodiac,
		summary: {
			life_path: lifePath.number,
			birthday: birthdayNumber.display,
			expression: expression.number,
			soul_urge: soulUrge.number,
			personality: personality.number,
			western: westernZodiac.display,
			chinese: chineseZodiac.display,
		},
	};
}

export function calculateExtendedProfile(
	fullName: string,
	dob: string,
	forecastYear?: number,
): Profile {
	const profile = calculateProfile(fullName, dob);
	const { month, day } = profile.input.parsed;
	const targetYear = forecastYear ?? new Date().getFullYear();

	profile.personal_year = calculatePersonalYear(month, day, targetYear);
	profile.quarterly_forecast = calculateQuarterlyForecast(
		month,
		day,
		targetYear,
	);
	profile.personal_month = calculatePersonalMonth(
		profile.personal_year.number,
		new Date().getMonth() + 1,
	);

	return profile;
}
