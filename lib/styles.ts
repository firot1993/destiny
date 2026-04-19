import type { AgeGroup, QuestionnaireAnswers } from "@/types";

export interface SignatureStyle {
  author: string;
  ages: AgeGroup[];
  // Lowercase keywords/phrases that appear in questionnaire option values.
  // Each substring match scores +1 affinity.
  affinities: string[];
}

// One global pool. Age bands filter tonal fit; affinities bias the pick toward
// authors whose voice matches the user's questionnaire answers.
const STYLES: SignatureStyle[] = [
  {
    author: "J. D. Salinger",
    ages: ["youth", "twenties"],
    affinities: ["underestimated", "serious than", "appetite", "embarrassed"],
  },
  {
    author: "Sally Rooney",
    ages: ["youth", "twenties"],
    affinities: ["exposure", "talking", "social", "serious than", "appetite"],
  },
  {
    author: "Haruki Murakami",
    ages: ["youth", "twenties", "midcareer"],
    affinities: ["drift", "quiet", "small room", "disappear", "threshold"],
  },
  {
    author: "Raymond Carver",
    ages: ["twenties", "midcareer", "senior"],
    affinities: ["small room", "quiet", "drift", "failure", "delay", "domestic"],
  },
  {
    author: "Alice Munro",
    ages: ["midcareer", "senior"],
    affinities: ["quiet", "detours", "different metric", "small room", "threshold"],
  },
  {
    author: "Kazuo Ishiguro",
    ages: ["midcareer", "senior"],
    affinities: ["quiet", "detours", "forgive", "different metric", "compounding"],
  },
  {
    author: "Anton Chekhov",
    ages: ["twenties", "midcareer", "senior"],
    affinities: ["quiet", "underestimated", "delay", "small room"],
  },
  {
    author: "Jorge Luis Borges",
    ages: ["midcareer", "senior"],
    affinities: ["metric", "leverage", "outlasts", "threshold"],
  },
  {
    author: "Yasunari Kawabata",
    ages: ["midcareer", "senior"],
    affinities: ["quiet", "leaving", "city", "small room", "different metric"],
  },
  {
    author: "Gabriel García Márquez",
    ages: ["midcareer", "senior"],
    affinities: ["name traveling", "rooms", "outlasts", "compounding"],
  },
  {
    author: "Yu Hua (余华)",
    ages: ["twenties", "midcareer", "senior"],
    affinities: ["money", "failure", "delay", "impossible", "exposure"],
  },
  {
    author: "Eileen Chang (张爱玲)",
    ages: ["twenties", "midcareer", "senior"],
    affinities: ["name traveling", "talking", "appetite", "social", "serious than"],
  },
  {
    author: "Han Kang (한강)",
    ages: ["twenties", "midcareer"],
    affinities: ["exposure", "threshold", "forgive", "impossible"],
  },
  {
    author: "Cormac McCarthy",
    ages: ["midcareer", "senior"],
    affinities: ["leaving", "impossible", "money", "leverage", "threshold"],
  },
  {
    author: "William Shakespeare",
    ages: ["twenties", "midcareer", "senior"],
    affinities: ["name traveling", "decision", "impossible", "underestimated"],
  },
];

function scoreAuthor(style: SignatureStyle, haystack: string): number {
  return style.affinities.reduce(
    (sum, kw) => sum + (haystack.includes(kw) ? 1 : 0),
    0
  );
}

export function pickSignatureStyle(
  ageGroup: AgeGroup,
  answers?: QuestionnaireAnswers
): SignatureStyle {
  const eligible = STYLES.filter((s) => s.ages.includes(ageGroup));
  const pool = eligible.length > 0 ? eligible : STYLES;

  if (!answers) return pool[Math.floor(Math.random() * pool.length)];

  // Pull the taste-bearing answers into a single lowercase haystack.
  const tasteKeys = [
    "magneticScene",
    "socialMirror",
    "obsessions",
    "recurringTrap",
    "delayFailureMode",
  ];
  const haystack = tasteKeys
    .flatMap((k) => answers[k] ?? [])
    .join(" ")
    .toLowerCase();

  if (!haystack) return pool[Math.floor(Math.random() * pool.length)];

  const scored = pool.map((s) => ({ style: s, score: scoreAuthor(s, haystack) }));
  const maxScore = Math.max(...scored.map((s) => s.score));

  // If no author matches, fall back to uniform random over eligible.
  if (maxScore === 0) return pool[Math.floor(Math.random() * pool.length)];

  // Pick uniformly from the top-scoring authors (usually 1-3 of them).
  const top = scored.filter((s) => s.score === maxScore).map((s) => s.style);
  return top[Math.floor(Math.random() * top.length)];
}
