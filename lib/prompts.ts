import type {
  CurationAnswers,
  Fields,
  Message,
  StoryConditioning,
} from "@/types";
import { NOISE_SCAN_COUNT } from "@/lib/constants";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese (简体中文)",
  ja: "Japanese",
  ko: "Korean",
};

function splitSelections(value = ""): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function containsAny(text: string, needles: string[]): boolean {
  const lower = text.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

function describeResource(resource: string): string {
  if (!resource) return "";
  if (
    containsAny(resource, [
      "savings",
      "steady income",
      "free time",
      "time",
      "runway",
      "patience",
      "outlast",
      "obscurity",
      "unseen",
    ])
  ) {
    return "there is enough runway for compounding to matter";
  }
  if (
    containsAny(resource, [
      "network",
      "team",
      "crew",
      "family",
      "mentor",
      "audience",
      "adult backing",
      "coaches",
      "guides",
      "move with me",
    ])
  ) {
    return "other people can accelerate the next chapter";
  }
  if (
    containsAny(resource, [
      "expertise",
      "portfolio",
      "craft",
      "taste",
      "open-source",
      "credential",
      "grades",
      "signal",
      "opportunity",
      "opening",
      "deal flow",
      "rare",
    ])
  ) {
    return "there is already real proof to build from";
  }
  if (
    containsAny(resource, [
      "embarrassment",
      "recover fast",
      "foolish",
    ])
  ) {
    return "the person can absorb exposure faster than most";
  }
  return "one real advantage already exists";
}

function describeConstraint(constraint: string): string {
  if (!constraint) return "";
  if (
    containsAny(constraint, [
      "lack of experience",
      "proof",
      "credibility",
      "taken seriously",
      "avoiding real exposure",
      "seen doing",
      "hidden",
    ])
  ) {
    return "proof still trails behind ability";
  }
  if (
    containsAny(constraint, [
      "too many options",
      "too many doors",
      "doors open",
      "direction",
      "choice",
      "optionality",
      "commitment",
      "fork",
      "decorating",
      "cage",
    ])
  ) {
    return "too many live paths are thinning momentum";
  }
  if (
    containsAny(constraint, [
      "scattering",
      "scatter",
      "starting strong",
      "freedom requires",
      "craving freedom",
    ])
  ) {
    return "the person keeps dissolving momentum at the exact moment it arrives";
  }
  if (
    containsAny(constraint, [
      "waiting for certainty",
      "waiting",
      "hesitate",
    ])
  ) {
    return "waiting has become the default move";
  }
  if (
    containsAny(constraint, [
      "budget",
      "runway",
      "income",
      "money",
      "financial",
      "bank account",
    ])
  ) {
    return "money pressure shortens the decision horizon";
  }
  if (
    containsAny(constraint, [
      "family",
      "visa",
      "location",
      "geography",
      "rooted",
    ])
  ) {
    return "freedom is filtered through obligations and geography";
  }
  if (
    containsAny(constraint, [
      "burnout",
      "energy",
      "fatigue",
      "fog",
      "sleep",
    ])
  ) {
    return "capacity is becoming part of the plot";
  }
  if (
    containsAny(constraint, [
      "algorithm",
      "platform",
      "system",
      "replace me",
      "obsolete",
    ])
  ) {
    return "external systems can erase momentum without warning";
  }
  return "the current chapter comes with a repeating trap";
}

function inferCoreTension(fields: Fields, constraints: string[]): string {
  const source = [
    fields.trajectoryFocus,
    fields.currentMode,
    fields.costWillingness,
    fields.magneticScene,
    fields.socialMirror,
    ...constraints,
    fields.resources,
  ]
    .join(" ")
    .toLowerCase();

  if (
    containsAny(source, [
      "leverage",
      "proof",
      "reputation",
      "invisible",
      "serious",
      "credibility",
      "noticed",
      "legibility",
      "underestimated",
      "seen",
    ])
  ) {
    return "capability is arriving faster than public proof, so the next move depends on visible evidence.";
  }
  if (
    containsAny(source, [
      "too many",
      "direction",
      "optionality",
      "fork",
      "choices",
      "paths",
      "focus",
      "decorating",
      "postpone",
    ])
  ) {
    return "too many identities can still survive, and that freedom is starting to cost momentum.";
  }
  if (
    containsAny(source, [
      "burnout",
      "energy",
      "crack",
      "wall",
      "sleep",
      "empty",
      "volatility",
    ])
  ) {
    return "ambition is outrunning recovery, so progress risks becoming self-erasing.";
  }
  if (
    containsAny(source, [
      "safe path",
      "prestige",
      "trapped",
      "ceiling",
      "golden handcuffs",
      "too small",
      "shrinks",
      "enlarging",
      "authored by someone else",
      "stopped enlarging",
    ])
  ) {
    return "the current track offers safety at the price of becoming smaller inside it.";
  }
  if (
    containsAny(source, [
      "capital",
      "runway",
      "budget",
      "income",
      "financial",
      "money",
      "bank account",
    ])
  ) {
    return "time pressure makes every decision feel more final than it is.";
  }
  return "the person is already outgrowing the current chapter, but the proof of that lag is socially inconvenient.";
}

function inferMomentumPattern(workStyle = ""): string {
  const value = workStyle.toLowerCase();

  if (
    containsAny(value, [
      "quietly",
      "craft",
      "depth",
      "niche skill",
      "small room",
      "one thing gets better",
      "underestimated",
    ])
  ) {
    return "momentum begins in private until the work becomes harder to dismiss than the person behind it.";
  }
  if (
    containsAny(value, [
      "rooms i'm not in",
      "name traveling",
      "rooms i",
    ])
  ) {
    return "reputation travels ahead of the person and starts pulling them into rooms before they're ready.";
  }
  if (
    containsAny(value, [
      "old life impossible",
      "one decision",
      "leaving a city",
      "stopped enlarging",
    ])
  ) {
    return "momentum arrives through a single load-bearing decision that makes the old life structurally unavailable.";
  }
  if (
    containsAny(value, [
      "made once and built right",
      "money arriving from something",
    ])
  ) {
    return "compounding arrives as output from something built once and correctly, not from continuous effort.";
  }
  if (
    containsAny(value, [
      "team",
      "relationship",
      "mentor",
      "trusted",
      "partner",
    ])
  ) {
    return "trust compounds first, and then opportunity starts moving faster.";
  }
  if (containsAny(value, ["system", "leverage", "sleep"])) {
    return "repetition wants to harden into a machine that keeps paying out after the effort ends.";
  }
  if (
    containsAny(value, [
      "visibility",
      "community",
      "audience",
      "public",
      "crowd",
    ])
  ) {
    return "attention changes the size of the room before certainty fully arrives.";
  }
  if (
    containsAny(value, [
      "rooms",
      "deals",
      "stakeholders",
      "gatekeepers",
      "handshakes",
    ])
  ) {
    return "the next jump depends on reading institutions, power, and timing rather than brute force.";
  }
  return "the path gathers force through a pattern that looks ordinary until it compounds.";
}

function inferExposurePattern(
  workStyle = "",
  whyThese = ""
): string {
  const style = workStyle.toLowerCase();
  const charge = whyThese.toLowerCase();

  if (containsAny(style, ["quietly", "craft", "depth"])) {
    return "credibility grows artifact-first, with visibility following later than comfort would prefer.";
  }
  if (containsAny(style, ["visibility", "community", "audience", "public"])) {
    return "social reality changes in public, so the person has to become legible before they feel fully ready.";
  }
  if (containsAny(style, ["system", "leverage"])) {
    return "the surface story should show systems, outputs, and compounding signs rather than self-description.";
  }
  if (containsAny(charge, ["dangerous", "embarrassing"])) {
    return "the chosen fragments carry a charge the person would not openly market, which is why they matter.";
  }
  return "the visible story should stay sparse and scene-led while the real pressures remain hidden under it.";
}

function inferRiskPattern(riskTolerance = ""): string {
  const value = riskTolerance.toLowerCase();

  if (containsAny(value, ["protect downside", "safe path", "safe"])) {
    return "the person guards against irreversible mistakes, then moves once the asymmetry feels undeniable.";
  }
  if (containsAny(value, ["calculated asymmetric", "asymmetric"])) {
    return "they wait for lopsided bets, which means patience is part of the strategy rather than hesitation.";
  }
  if (containsAny(value, ["volatility", "speed", "swing hard"])) {
    return "speed is attractive because clarity seems to arrive through motion rather than reflection.";
  }
  if (containsAny(value, ["all-in", "bet early on myself"])) {
    return "they can tolerate long ambiguity, but once conviction crystallizes the commitment becomes total.";
  }
  // New costWillingness-texture arms:
  if (
    containsAny(value, [
      "visibility before i feel ready",
      "visibility before",
      "seen before",
    ])
  ) {
    return "they are ready to pay the price of being seen before they feel finished, so exposure itself becomes an input.";
  }
  if (
    containsAny(value, [
      "years of obscurity",
      "obscurity while",
      "invisibility",
    ])
  ) {
    return "they are willing to spend years unseen, so the timeline is set by the work's maturation, not by social impatience.";
  }
  if (
    containsAny(value, [
      "burning the version",
      "burning a version",
      "old version",
    ])
  ) {
    return "they are willing to disappoint the people who loved the old version, which means identity change is already underway.";
  }
  if (
    containsAny(value, [
      "financial tightness",
      "tighter financially",
      "authorship",
    ])
  ) {
    return "they accept financial narrowness as the price of authorship, so compensation is trailing autonomy.";
  }
  if (
    containsAny(value, [
      "conflict with people",
      "expect the old me",
      "disappointing people",
    ])
  ) {
    return "they accept relational friction as the cost of changing shape, so the old social equilibrium is no longer load-bearing.";
  }
  if (
    containsAny(value, [
      "looking naive",
      "converging",
      "naive in public",
    ])
  ) {
    return "they are willing to look premature while the convergence is still invisible, which protects the work from public pressure.";
  }
  return "uncertainty is filtered through fear of becoming trapped in the wrong life shape.";
}

function inferIdentityPressure(
  constraints: string[],
  rejectedFuture: string,
  obsessions: string[],
  socialMirror = ""
): string {
  const source = [...constraints, rejectedFuture, ...obsessions, socialMirror]
    .join(" ")
    .toLowerCase();

  if (
    containsAny(source, [
      "too safe",
      "ordinary",
      "borrowed",
      "different metric",
      "serious than i looked",
    ])
  ) {
    return "identity strain comes from refusing a future that looks stable but feels authored by someone else.";
  }
  if (
    containsAny(source, [
      "quiet period was not stagnation",
      "quiet stretch",
      "quiet period",
      "compounding",
      "detours were actually alignment",
      "detours",
    ])
  ) {
    return "the person is compounding silently and needs the story to eventually make the quiet period legible as the actual work.";
  }
  if (
    containsAny(source, [
      "built something while they were talking",
    ])
  ) {
    return "the person is tired of narrating and wants the output itself to do the talking.";
  }
  if (containsAny(source, ["too performative", "audience", "algorithm"])) {
    return "the person wants recognition without becoming a product optimized for approval.";
  }
  if (containsAny(source, ["too lonely", "family", "alone", "support"])) {
    return "independence is appealing, but isolation would curdle the win into something thinner than desired.";
  }
  if (containsAny(source, ["too chaotic", "burnout", "energy", "freedom"])) {
    return "freedom is attractive, but only if it does not dissolve the self that earned it.";
  }
  return "the future has to feel self-authored, not merely available.";
}

function inferLikelyTransformation(
  inflection = "",
  whyThese = "",
  horizon = "",
  delayFailureMode = ""
): string {
  const source = `${inflection} ${whyThese} ${delayFailureMode}`.toLowerCase();

  if (
    containsAny(source, [
      "public moment",
      "noticed",
      "desk",
      "ignore",
      "viral",
      "stage",
      "seen",
    ])
  ) {
    return "a moment of visibility forces a larger identity to appear before it feels comfortable.";
  }
  if (
    containsAny(source, [
      "fund",
      "back",
      "partner",
      "relationship",
      "door",
      "stranger bets",
      "someone picks",
    ])
  ) {
    return "another person changes the scale of what becomes possible, and politeness stops being a good excuse.";
  }
  if (
    containsAny(source, [
      "money pressure",
      "runway",
      "deadline",
      "scale",
      "shock",
      "closes every door",
    ])
  ) {
    return "external pressure strips away hedging and makes commitment visible.";
  }
  if (
    containsAny(source, [
      "body forces",
      "pace correction",
      "scattering",
      "finish",
    ])
  ) {
    return "the body or a finished artifact imposes a pace the conscious self would never have chosen, and the next version arrives inside that correction.";
  }
  if (
    containsAny(source, [
      "commitment arrives",
      "constraint i chose",
      "structure i resented",
      "leaving becomes harder",
    ])
  ) {
    return "a chosen constraint becomes the structure that carries the next version, reversing the old relationship to freedom.";
  }
  if (containsAny(source, ["start", "planning", "go"])) {
    return "the change begins when planning turns into a visible act that cannot be quietly taken back.";
  }
  return `the likely change arrives inside the ${horizon || "next chapter"} and reorganizes both behavior and social reality.`;
}

function inferSelectionCharge(
  whyThese = "",
  rejectedFuture = ""
): string | undefined {
  const why = whyThese.toLowerCase();
  const rejected = rejectedFuture.toLowerCase();

  if (containsAny(why, ["dangerous", "embarrassing"])) {
    return "the chosen fragments carry forbidden desire, which raises the emotional stakes of the story.";
  }
  if (containsAny(why, ["best life", "real"])) {
    return "the chosen fragments feel like recognition rather than aspiration, so the story should trust their pull.";
  }
  if (containsAny(why, ["stick", "don't know why"])) {
    return "the attraction is partly pre-verbal, which means the story should preserve mystery instead of over-explaining.";
  }
  if (containsAny(rejected, ["safe", "ordinary", "borrowed"])) {
    return "the story gains shape by refusing comfort that would flatten the person into a smaller version of themselves.";
  }
  return undefined;
}

function inferRejectedGravity(rejectedFuture = ""): string | undefined {
  const rejected = rejectedFuture.toLowerCase();
  if (!rejected) return undefined;
  if (containsAny(rejected, ["safe"])) {
    return "a too-safe future is unacceptable because it calcifies too early.";
  }
  if (containsAny(rejected, ["performative"])) {
    return "surface success without interior conviction would count as drift, not victory.";
  }
  if (containsAny(rejected, ["lonely"])) {
    return "winning at the price of human belonging would feel hollow.";
  }
  if (containsAny(rejected, ["chaotic"])) {
    return "disorder without compounding payoff is a cost, not a romance.";
  }
  if (containsAny(rejected, ["ordinary", "borrowed"])) {
    return "a future borrowed from other people's scripts is part of what the person is pushing against.";
  }
  return undefined;
}

function describeNoveltyAppetite(score: number): string {
  if (score >= 8) return "moves toward novelty before full permission exists";
  if (score >= 6) return "leans toward new territory when it feels alive enough";
  if (score >= 4) return "balances experimentation with familiarity";
  return "prefers known ground until the upside becomes concrete";
}

function describeConsistencyPressure(score: number): string {
  if (score >= 8) return "can turn repetition into advantage once a path feels worth serving";
  if (score >= 6) return "likes structure, but not enough to become mechanical";
  if (score >= 4) return "works in pulses rather than perfect systems";
  return "resists rigid structure and relies on improvisation under pressure";
}

function describeSocialPropulsion(score: number): string {
  if (score >= 8) return "gains momentum when rooms, networks, and other people's energy are involved";
  if (score >= 6) return "can use people and context as accelerants when needed";
  if (score >= 4) return "moves between solitude and contact without fully trusting either";
  return "builds force in private before letting the world see it";
}

function describeConflictTolerance(score: number): string {
  if (score <= 3) return "can absorb friction if that is the price of the future they want";
  if (score <= 5) return "does not chase conflict, but will accept it when a path matters";
  if (score <= 7) return "prefers coordination, even when it slows the move";
  return "protects harmony easily, which can delay sharper commitments";
}

function describeAnticipatorySensitivity(score: number): string {
  if (score >= 8) return "anticipates fallout early, creating bursts of intensity followed by self-doubt";
  if (score >= 6) return "feels the stakes vividly, which can sharpen and unsettle decisions";
  if (score >= 4) return "registers pressure without letting it dominate the whole arc";
  return "absorbs uncertainty with unusual steadiness";
}

function describeCombinedReading(big5: number[]): string {
  const [openness, conscientiousness, extraversion, agreeableness, neuroticism] =
    big5;

  if (openness >= 8 && neuroticism >= 7 && conscientiousness >= 6) {
    return "moves toward the unfamiliar quickly, then wrestles it into shape through disciplined bursts that are costly but nonlinear.";
  }
  if (conscientiousness >= 8 && extraversion <= 4) {
    return "builds slowly, privately, and convincingly, often becoming undeniable before becoming widely seen.";
  }
  if (extraversion >= 7 && openness >= 7) {
    return "finds acceleration through people and possibility, which can open doors before identity fully stabilizes.";
  }
  if (neuroticism >= 7) {
    return "feels the future intensely enough that doubt and drive keep taking turns at the wheel.";
  }
  return "balances experimentation, pressure, and effort in a way that makes change arrive through repeated small choices rather than one grand declaration.";
}

function formatSection(title: string, entries: Array<[string, string | undefined]>): string {
  return `${title}:\n${entries
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `- ${label}: ${value}`)
    .join("\n")}`;
}

function guidanceDescription(guidance: number): string {
  if (guidance >= 7) return "dramatic pivots, unexpected breakthroughs, biography-worthy";
  if (guidance >= 4) return "ambitious but grounded, notable achievements";
  return "meaningful, well-lived, not flashy";
}

function guidanceTone(guidance: number): string {
  if (guidance >= 7) return "high-energy, vivid, sharp, but never slogan-like";
  if (guidance >= 4) return "grounded, tense, quietly magnetic";
  return "small, intimate, understated, lightly uncanny";
}

function formatConditioning(conditioning: StoryConditioning): string {
  const hardState = formatSection("BOUNDARY CONDITIONS", [
    ["Age band", conditioning.hardState.ageBand],
    ["Mobility", conditioning.hardState.mobility],
    ["Current chapter", conditioning.hardState.chapter],
    ["Time horizon", conditioning.hardState.horizon],
    ["Anchor resource", conditioning.hardState.anchorResource],
    ["Primary constraint", conditioning.hardState.anchorConstraint],
    ["Secondary constraint", conditioning.hardState.secondaryConstraint],
  ]);
  const latentForces = formatSection("LATENT FORCES", [
    ["Core tension", conditioning.latentForces.coreTension],
    ["Momentum pattern", conditioning.latentForces.momentumPattern],
    ["Exposure pattern", conditioning.latentForces.exposurePattern],
    ["Risk pattern", conditioning.latentForces.riskPattern],
    ["Identity pressure", conditioning.latentForces.identityPressure],
    ["Likely transformation", conditioning.latentForces.likelyTransformation],
    ["Selection charge", conditioning.latentForces.selectionCharge],
    ["Rejected gravity", conditioning.latentForces.rejectedGravity],
  ]);
  const personalitySignature = formatSection("PERSONALITY SIGNATURE", [
    ["Novelty appetite", conditioning.personalitySignature.noveltyAppetite],
    ["Consistency pressure", conditioning.personalitySignature.consistencyPressure],
    ["Social propulsion", conditioning.personalitySignature.socialPropulsion],
    ["Conflict tolerance", conditioning.personalitySignature.conflictTolerance],
    [
      "Anticipatory sensitivity",
      conditioning.personalitySignature.anticipatorySensitivity,
    ],
    ["Combined reading", conditioning.personalitySignature.combinedReading],
  ]);

  return `${hardState}\n\n${latentForces}\n\n${personalitySignature}`;
}

export function buildStoryConditioning(
  fields: Fields,
  big5: number[],
  curationAnswers?: Partial<CurationAnswers>
): StoryConditioning {
  const resources = splitSelections(fields.resources);
  const constraints = splitSelections(fields.constraints);
  const obsessions = splitSelections(fields.obsessions);
  const whyThese = curationAnswers?.whyThese ?? "";
  const rejectedFuture = curationAnswers?.rejectedFuture ?? "";

  return {
    hardState: {
      ageBand: fields.age,
      mobility: fields.mobility,
      chapter: fields.currentMode,
      horizon: fields.timeHorizon,
      anchorResource: resources[0] ? describeResource(resources[0]) : undefined,
      anchorConstraint: constraints[0]
        ? describeConstraint(constraints[0])
        : undefined,
      secondaryConstraint: constraints[1]
        ? describeConstraint(constraints[1])
        : undefined,
    },
    latentForces: {
      coreTension: inferCoreTension(fields, constraints),
      momentumPattern: inferMomentumPattern(fields.workStyle),
      exposurePattern: inferExposurePattern(fields.workStyle, whyThese),
      riskPattern: inferRiskPattern(fields.riskTolerance),
      identityPressure: inferIdentityPressure(
        constraints,
        rejectedFuture,
        obsessions,
        fields.socialMirror
      ),
      likelyTransformation: inferLikelyTransformation(
        fields.inflection,
        whyThese,
        fields.timeHorizon,
        fields.delayFailureMode
      ),
      selectionCharge: inferSelectionCharge(whyThese, rejectedFuture),
      rejectedGravity: inferRejectedGravity(rejectedFuture),
    },
    personalitySignature: {
      noveltyAppetite: describeNoveltyAppetite(big5[0] ?? 5),
      consistencyPressure: describeConsistencyPressure(big5[1] ?? 5),
      socialPropulsion: describeSocialPropulsion(big5[2] ?? 5),
      conflictTolerance: describeConflictTolerance(big5[3] ?? 5),
      anticipatorySensitivity: describeAnticipatorySensitivity(big5[4] ?? 5),
      combinedReading: describeCombinedReading(big5),
    },
  };
}

export function generateStepPrompt(
  step: number,
  totalSteps: number,
  conditioning: StoryConditioning,
  guidance: number,
  prev: string | null,
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nIMPORTANT: Respond entirely in ${LANG_NAMES[lang] || lang}.`
      : "";
  const progress = step / Math.max(1, totalSteps - 1);
  const context = formatConditioning(conditioning);
  const worldState =
    "Only infer broad contemporary pressures and opportunities. Do not mention named events, headlines, or specific public figures.";

  if (step === 0) {
    return {
      role: "user",
      content: `You are scanning the earliest unresolved signals of a person's future trajectory.

${context}

WORLD STATE:
${worldState}

GUIDANCE SCALE: ${guidance}/10 (${guidanceDescription(guidance)})

TASK:
Generate exactly ${NOISE_SCAN_COUNT} raw future fragments.

These are not predictions, not advice, not summaries, and not slogans.
They are unresolved fragments from possible futures: scenes, tensions, environments, losses, habits, freedoms, systems, and recognitions that might later become a life.

Each fragment must:
- be 4-12 words
- stand alone
- feel emotionally charged but unfinished
- suggest a future shape without explaining it
- avoid personality trait labels and questionnaire language
- avoid complete moral conclusions or polished "quote-like" phrasing

Distribution requirements:
- at least 2 fragments should hint at work / money / systems
- at least 2 should hint at relationships / social position / visibility
- at least 2 should hint at place / movement / environment
- at least 2 should hint at inner cost / freedom / loss / desire
- the remaining 2 can be strange, symbolic, or contradictory

Tone:
${guidanceTone(guidance)}

Format exactly:
1::...
2::...
...
${NOISE_SCAN_COUNT}::...

Respond with only the ${NOISE_SCAN_COUNT} fragments.${langInstruction}`,
    };
  }

  if (step === totalSteps - 1) {
    return {
      role: "user",
      content: `You are finalizing a possible trajectory.

${context}

PREVIOUS DRAFT:
${prev}

TASK:
Write a vivid, coherent future trajectory in 8-12 sentences.

Requirements:
- The selected motifs should remain recognizable.
- The person should change through pressure, not through explanation.
- Show outer consequences and inner reorganization.
- Include approximate time markers only where they help inevitability.
- Treat the selected fragments as the only valid surface motifs of the story.
- Use the profile only as hidden causality.
- Do not restate the profile as prose.
- Do not repeat questionnaire phrases unless they already appear in the selected fragments or previous draft.
- The ending should feel surprising in shape, but inevitable in retrospect.

Respond with only the final trajectory.${langInstruction}`,
    };
  }

  if (progress < 0.45) {
    return {
      role: "user",
      content: `You are shaping possible causality from selected future fragments.

${context}

${step === 1 ? "SELECTED FRAGMENTS" : "PREVIOUS DRAFT"}:
${prev}

TASK:
Write 5-6 sentences that explain how these fragments could begin becoming true.

Rules:
- Treat the selected fragments as the only valid surface motifs of the story.
- Use the profile only as hidden causality.
- Do not restate the profile as prose.
- Do not repeat questionnaire phrases unless they appear in the selected fragments.
- Do not summarize the person.
- Let contradiction remain.
- Include at least one concrete shift in behavior, environment, or commitment.

Respond with only the trajectory draft.${langInstruction}`,
    };
  }

  return {
    role: "user",
    content: `You are sharpening a possible life trajectory.

${context}

PREVIOUS DRAFT:
${prev}

TASK:
Make the trajectory more specific through decisions, sacrifices, and changes in social reality.

Rules:
- Preserve the surface motifs already present.
- Add 2-3 turning points, but do not over-explain them.
- Show what becomes easier, and what becomes more expensive.
- Treat the selected fragments as the only valid surface motifs of the story.
- Use the profile only as hidden causality.
- Do not restate the profile as prose.
- Avoid direct reuse of questionnaire phrases.
- Make the story feel discovered, not assembled from profile data.

Write 6-8 sentences. Respond with only the revised trajectory.${langInstruction}`,
  };
}

export function generateCleanupPrompt(
  trajectory: string,
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nIMPORTANT: Respond entirely in ${LANG_NAMES[lang] || lang}.`
      : "";

  return {
    role: "user",
    content: `Revise this trajectory so it no longer sounds like a paraphrase of a questionnaire.

TRAJECTORY:
${trajectory}

Rules:
- Remove direct profile wording.
- Replace abstract self-description with scenes, behaviors, consequences, and social facts.
- Keep the meaning and structure.
- Do not make the prose more generic.

Respond with only the revised trajectory.${langInstruction}`,
  };
}

export function getStepLabel(
  step: number,
  totalSteps: number,
  t: (key: string) => string
): string {
  const progress = step / Math.max(1, totalSteps - 1);
  if (step === 0) return t("step_noise");
  if (step === totalSteps - 1) return t("step_denoise");
  if (progress < 0.45) return t("step_structure");
  if (progress < 0.8) return t("step_sharpen");
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
