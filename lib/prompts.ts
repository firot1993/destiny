import type { Fields, Message, NoiseFragment, MergedNoisePlan } from "@/types";
import { BIG5_KEYS, NOISE_SCAN_COUNT } from "@/lib/constants";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese (简体中文)",
  ja: "Japanese",
  ko: "Korean",
};

export function buildStateString(fields: Fields, big5: number[]): string {
  const parts: string[] = [];
  if (fields.age) parts.push(`Age: ${fields.age}`);
  if (fields.location) parts.push(`Location: ${fields.location}`);
  if (fields.mobility) parts.push(`Mobility: ${fields.mobility}`);
  if (fields.currentMode) parts.push(`Current chapter: ${fields.currentMode}`);
  if (fields.trajectoryFocus) parts.push(`Current route tension: ${fields.trajectoryFocus}`);
  if (fields.skills) parts.push(`Skills: ${fields.skills}`);
  if (fields.resources) parts.push(`Resources & advantages: ${fields.resources}`);
  if (fields.constraints) parts.push(`Constraints: ${fields.constraints}`);
  if (fields.obsessions) parts.push(`Obsessions & drives: ${fields.obsessions}`);
  if (fields.workStyle) parts.push(`Preferred way of winning: ${fields.workStyle}`);
  if (fields.riskTolerance) parts.push(`Risk posture: ${fields.riskTolerance}`);
  if (fields.timeHorizon) parts.push(`Time horizon: ${fields.timeHorizon}`);
  if (fields.inflection) parts.push(`Near-term inflection point: ${fields.inflection}`);
  const traits = BIG5_KEYS.map((key, i) => {
    const val = big5[i];
    const level = val <= 3 ? "low" : val <= 5 ? "moderate" : val <= 7 ? "moderately high" : "high";
    return `${key}: ${level} (${val}/10)`;
  });
  parts.push(`\nPersonality (Big Five):\n${traits.join("\n")}`);
  return parts.join("\n");
}

export function generateStepPrompt(
  step: number,
  totalSteps: number,
  state: string,
  guidance: number,
  prev: string | null,
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nIMPORTANT: Respond entirely in ${LANG_NAMES[lang] || lang}.`
      : "";
  const progress = step / (totalSteps - 1);
  const guidanceDesc =
    guidance >= 7
      ? "dramatic pivots, unexpected breakthroughs, biography-worthy"
      : guidance >= 4
      ? "ambitious but grounded, notable achievements"
      : "meaningful, well-lived, not flashy";
  const personality =
    "The person's Big Five personality traits should deeply shape the trajectory. High openness = unconventional pivots. High conscientiousness = systematic empire-building. High extraversion = network-driven success. Low agreeableness = disruptive moves. High neuroticism = intense creative or emotional breakthroughs.";
  const worldState =
    "No explicit world-state input is provided. Only infer broad contemporary pressures and opportunities, never named events or headlines.";

  if (step === 0) {
    return {
      role: "user",
      content: `You are scanning the earliest unresolved signals of a person's future trajectory.

CURRENT STATE:
${state}

PERSONALITY SIGNALS:
${personality}

WORLD STATE:
${worldState}

GUIDANCE SCALE: ${guidance}/10

TASK:
Generate exactly 10 raw future fragments.

These are not predictions, not advice, not summaries, not slogans.
They are unresolved fragments from possible futures — partial scenes, tensions, impulses, environments, losses, freedoms, habits, or systems that might later become a life.

Each fragment must:
- be 4-12 words
- stand alone
- feel emotionally charged but still unfinished
- suggest a future shape without explaining it
- be interpretable in more than one way
- avoid complete moral conclusions or polished "quote-like" phrasing
- avoid personality trait labels
- avoid direct advice, destiny claims, or biography summary language

Distribution requirements:
- at least 2 fragments should hint at work / money / systems
- at least 2 should hint at relationships / social position / visibility
- at least 2 should hint at place / movement / environment
- at least 2 should hint at inner cost / freedom / loss / desire
- the remaining 2 can be strange, symbolic, or contradictory

Tone:
${guidance >= 7 ? "high-energy, vivid, sharp, but never slogan-like" : guidance >= 4 ? "grounded, tense, quietly magnetic" : "small, intimate, understated, lightly uncanny"}

Important:
Do NOT make them all sound equally poetic.
Some should be plain, some strange, some sharp, some quiet.
Do NOT make them read like a coherent set of themes.
They should feel like fragments from different corners of the same latent space.

Format exactly:
1::...
2::...
...
10::...

Respond with only the 10 fragments.${langInstruction}`,
    };
  }

  if (step === totalSteps - 1) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model, final step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: FULLY DENOISED — FINAL TRAJECTORY
Vivid, coherent, compelling. Each moment connects with inevitability. Include:
- Key turning points with approximate years
- Internal shifts, not just external events
- How their personality drove each pivot
- What makes this ${guidanceDesc}
- Where this person stands at the peak

Flowing narrative, 8-12 sentences. Deeply personal — not generic.

Respond with ONLY the final trajectory, nothing else.${langInstruction}`,
    };
  }

  if (progress < 0.4) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: ADDING STRUCTURE (${Math.round(progress * 100)}% denoised)
Add structure. Let causality emerge. Still rough but recognizable patterns. Add approximate timeframes. Personality traits shape HOW things happen. 5-6 sentences.

Respond with ONLY the refined trajectory, nothing else.${langInstruction}`,
    };
  }

  if (progress < 0.7) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: SHARPENING (${Math.round(progress * 100)}% denoised)
Add specificity — concrete decisions, turning points, key moments. Show cause and effect. At guidance ${guidance}/10: ${guidanceDesc}. 6-8 sentences with clear timeframes.

Respond with ONLY the sharpened trajectory, nothing else.${langInstruction}`,
    };
  }

  return {
    role: "user",
    content: `You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: FINE DETAIL (${Math.round(progress * 100)}% denoised)
Refine — emotional depth, internal transformations, precise moments. Make each transition feel inevitable. Personality colors every decision. 7-10 sentences.

Respond with ONLY the refined trajectory, nothing else.${langInstruction}`,
  };
}

export function getStepLabel(
  step: number,
  totalSteps: number,
  t: (key: string) => string
): string {
  const progress = step / (totalSteps - 1);
  if (step === 0) return t("step_noise");
  if (step === totalSteps - 1) return t("step_denoise");
  if (progress < 0.4) return t("step_structure");
  if (progress < 0.7) return t("step_sharpen");
  return t("step_refine");
}

export function extractNormalizedText(
  contentBlocks: Array<{ type: string; text: string | Array<{ text: string }> }>
): string {
  if (!Array.isArray(contentBlocks)) return "";
  return contentBlocks
    .flatMap((block) => {
      if (block?.type !== "text") return [];
      if (typeof block.text === "string") return [block.text];
      if (Array.isArray(block.text)) {
        return (block.text as Array<{ text?: string }>)
          .map((part) => (typeof part?.text === "string" ? part.text : ""))
          .filter(Boolean);
      }
      return [];
    })
    .join("\n")
    .trim();
}

export function parseNoiseFragments(rawText: string): string[] {
  return rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const numbered = line.match(/^\s*\d+\s*::\s*(.+)$/);
      if (numbered) return numbered[1].trim();
      const fallback = line.match(/^\s*\d+[\.\):-]\s*(.+)$/);
      return fallback ? fallback[1].trim() : line;
    })
    .filter(Boolean)
    .slice(0, NOISE_SCAN_COUNT);
}

export function shuffleFragments<T>(fragments: T[]): T[] {
  const shuffled = [...fragments];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function buildMergedNoisePlan(
  selectedFragments: NoiseFragment[],
  allFragments: NoiseFragment[] = selectedFragments,
  enableWildcard = true
): MergedNoisePlan {
  if (selectedFragments.length === 0) {
    return { fragments: [], droppedFragment: null, wildcardFragment: null };
  }
  const selectedIds = new Set(selectedFragments.map((f) => f.id));
  const unselectedFragments = allFragments.filter((f) => !selectedIds.has(f.id));
  const shuffledSelected = shuffleFragments(selectedFragments);
  const shouldSwapWildcard = enableWildcard && unselectedFragments.length > 0 && shuffledSelected.length > 0;
  const droppedFragment = shouldSwapWildcard
    ? shuffledSelected[shuffledSelected.length - 1]
    : null;
  const remixedSelection = shouldSwapWildcard
    ? shuffledSelected.slice(0, -1)
    : shuffledSelected;
  const wildcardFragment = shouldSwapWildcard
    ? unselectedFragments[Math.floor(Math.random() * unselectedFragments.length)]
    : null;
  const mergedFragments = wildcardFragment
    ? shuffleFragments([
        ...remixedSelection.map((f) => ({ ...f, mergeSource: "selected" as const })),
        { ...wildcardFragment, mergeSource: "wildcard" as const },
      ])
    : remixedSelection.map((f) => ({ ...f, mergeSource: "selected" as const }));

  return { fragments: mergedFragments, droppedFragment, wildcardFragment };
}

export function buildMergedNoiseSeed(fragments: NoiseFragment[]): string {
  return fragments.map((f, i) => `${i + 1}::${f.text}`).join("\n");
}
