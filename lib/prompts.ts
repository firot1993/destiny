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
  const facts = [
    conditioning.hardState.ageBand,
    conditioning.hardState.mobility,
    conditioning.hardState.chapter,
    conditioning.hardState.horizon,
  ].filter(Boolean).join(", ");

  const constraints = [
    conditioning.hardState.anchorResource,
    conditioning.hardState.anchorConstraint,
    conditioning.hardState.secondaryConstraint,
  ].filter(Boolean);

  const forces = [
    conditioning.latentForces.coreTension,
    conditioning.latentForces.momentumPattern,
    conditioning.latentForces.riskPattern,
    conditioning.latentForces.identityPressure,
    conditioning.latentForces.likelyTransformation,
    conditioning.latentForces.selectionCharge,
    conditioning.latentForces.rejectedGravity,
  ].filter(Boolean);

  const personality = conditioning.personalitySignature.combinedReading;

  const lines: string[] = [];
  if (facts) lines.push(`PERSON: ${facts}.`);
  if (constraints.length > 0) lines.push(`SITUATION: ${constraints.join("; ")}.`);
  if (forces.length > 0) lines.push(`UNDERCURRENTS: ${forces.join(" · ")}`);
  if (personality) lines.push(`TEMPERAMENT: ${personality}`);
  return lines.join("\n");
}

const BANNED_VOCAB =
  "momentum, trajectory, pattern, chapter, identity, tension, pressure, resilience, alignment, pivot, inflection, compounding";

const SHARED_RULES = `- Use concrete nouns. Brand names, street names, specific objects, exact sums, weekday names. Avoid abstractions.
- Let some sentences be flat, ordinary, or even boring. Not every line needs to carry weight.
- Mix registers. A plain sentence next to a strange one is better than six literary sentences in a row.
- Leave things unexplained. Not every image needs to pay off. Not every choice needs a reason.
- Let contradictions stand. The person can be two things at once.
- Do not name personality dimensions or psychological labels.
- The profile must remain invisible; a reader should not be able to reverse-engineer the questionnaire.
- Avoid these words: ${BANNED_VOCAB}.`;

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

export function generateCritiquePrompt(
  draft: string,
  conditioning: StoryConditioning,
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nRespond in ${LANG_NAMES[lang] || lang}.`
      : "";
  const context = formatConditioning(conditioning);
  return {
    role: "user",
    content: `You are a sharp-eyed story editor. Read this early draft and decide what would make it more alive in the next revision.

${context}

DRAFT:
${draft}

Judge along these axes:
- Does any sentence read like a personality profile, self-help line, or questionnaire paraphrase?
- Is the tone uniformly literary, or does register vary (plain, offhand, even banal sentences mixed with charged ones)?
- Are there unexplained images left to breathe, or is everything tied into meaning?
- Do the motifs appear as concrete actions and objects, or as described themes?
- Is there at least one unexpected detail, contradiction, or thing that resists easy reading?
- Does the story cause itself forward, or is it a list of parallel events?

Output 3-5 short, concrete revision notes. Each note should name a specific problem and a specific fix. No general praise, no restating the draft. If a note can only be phrased abstractly, drop it.

Format:
- <note>
- <note>
- <note>

Respond with only the notes.${langInstruction}`,
  };
}

export function generateStepPrompt(
  step: number,
  totalSteps: number,
  conditioning: StoryConditioning,
  guidance: number,
  prev: string | null,
  lang = "en",
  orderedBullets?: string[],
  critiqueNotes?: string | null,
  signatureAuthor?: string | null,
  steeringNote?: string | null
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
    const hasStructuredBullets = orderedBullets && orderedBullets.length >= 6;
    const bulletBlock = hasStructuredBullets
      ? `\nMOTIFS (in the order they should anchor the story):
- Paragraph 1 anchor: "${orderedBullets[0]}"
- Paragraph 2 anchors: "${orderedBullets[1]}", "${orderedBullets[2]}"
- Paragraph 3 anchors: "${orderedBullets[3]}", "${orderedBullets[4]}"
- Paragraph 4 anchor: "${orderedBullets[5]}"
`
      : "";
    const structureLine = hasStructuredBullets
      ? `Each paragraph grows outward from its anchor motif(s) above. The motifs should appear as concrete images or actions inside the paragraph — not quoted, not explained. The motif is a seed; the paragraph is what it becomes.`
      : `The paragraphs do not need to follow a rigid arc. Think of them as four different vantage points onto the same life.`;
    const signatureBlock = signatureAuthor
      ? `\nSIGNATURE STYLE:
Write in the voice of ${signatureAuthor}. Carry their sentence rhythm, attention, and register. Do not name the author, quote their work, or imitate specific stories.
`
      : "";

    return {
      role: "user",
      content: `You are finalizing a possible trajectory.

${context}
${bulletBlock}${signatureBlock}
PREVIOUS DRAFT:
${prev}

TASK:
Write a longer story about this person's future life: exactly 4 paragraphs, separated by blank lines, roughly 400-600 words total. Each paragraph should be 4-8 sentences. Do NOT label or number the paragraphs — just write them.

${structureLine} Move through time freely — years can pass in a clause, or a single afternoon can fill a paragraph. Open inside a specific scene, not a summary. Something should have shifted by the end, but not in a way that resolves into a lesson.

Rules:
${SHARED_RULES}

Respond with only the final trajectory.${langInstruction}`,
    };
  }

  if (progress < 0.45) {
    return {
      role: "user",
      content: `You are building the first draft of a possible future from selected fragments.

${context}

${step === 1 ? "SELECTED FRAGMENTS" : "PREVIOUS DRAFT"}:
${prev}

TASK:
Write 5-6 sentences of continuous prose drawn from these fragments. Open inside a concrete image or action. Include at least one ordinary, low-stakes sentence — a meal, a receipt, a walk home — alongside the charged ones. If a fragment is strange, let it stay strange; do not rationalize it. You don't need to cover every fragment.

Rules:
${SHARED_RULES}

Respond with only the trajectory draft.${langInstruction}`,
    };
  }

  const critiqueBlock = critiqueNotes
    ? `\nCRITIQUE NOTES (address these in the revision):\n${critiqueNotes}\n`
    : "";
  const steeringBlock = steeringNote
    ? `\nUSER DIRECTION (honor this instruction in the revision):\n${steeringNote}\n`
    : "";

  return {
    role: "user",
    content: `You are sharpening a possible life trajectory.

${context}
${critiqueBlock}${steeringBlock}
PREVIOUS DRAFT:
${prev}

TASK:
Rewrite and expand the draft into 2-3 paragraphs separated by blank lines, roughly 200-350 words total. Each paragraph 3-6 sentences. Preserve existing images and motifs; do not add new themes. Replace any sentence that feels like a summary or explanation with a concrete detail or overheard moment. Break uniform literary tone — let at least one sentence be plainly stated, offhand, or slightly banal. Leave at least one thing unexplained. Do not label paragraphs.${critiqueNotes ? " Prioritize addressing the critique notes above." : ""}${steeringNote ? " Also honor the user direction above." : ""}

Rules:
${SHARED_RULES}

Respond with only the revised trajectory.${langInstruction}`,
  };
}

export function generateCleanupPrompt(
  trajectory: string,
  lang = "en",
  steeringNote?: string | null
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nIMPORTANT: Respond entirely in ${LANG_NAMES[lang] || lang}.`
      : "";
  const steeringBlock = steeringNote
    ? `\nUSER DIRECTION (honor this instruction in the final pass):\n${steeringNote}\n`
    : "";

  return {
    role: "user",
    content: `Read this trajectory and rewrite any sentence that sounds like it came from a personality test, self-help book, or career questionnaire.
${steeringBlock}

TRAJECTORY:
${trajectory}

Rewrite any sentence that:
- Names a personality dimension (e.g. "novelty appetite", "risk tolerance", "openness")
- Describes a behavioral pattern in abstract terms (e.g. "compounding begins when...")
- Reads like a thesis statement about who the person is
- Uses any of these words: ${BANNED_VOCAB}
- Could appear on a motivational poster or LinkedIn bio

Replace each such sentence with a concrete scene, image, consequence, or social fact that carries the same meaning.

Also check the texture: if every sentence carries the same literary weight, break the pattern. Add one plain, offhand, or mundane sentence. Leave at least one image unexplained. Keep chronology and the existing motifs intact — do not add new themes. Preserve the paragraph structure (4 paragraphs separated by blank lines) and do not shorten the piece; the revised version should be at least as long as the original.${steeringNote ? " Also honor the user direction above." : ""}

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

// ---------------------------------------------------------------------------
// Enhancement 1: Adaptive Quality Gate
// ---------------------------------------------------------------------------

export interface QualityGateResult {
  score: number;
  shouldContinue: boolean;
}

export function generateQualityGatePrompt(
  draft: string,
  conditioning: StoryConditioning,
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nRespond in ${LANG_NAMES[lang] || lang}.`
      : "";
  const context = formatConditioning(conditioning);
  return {
    role: "user",
    content: `You are a concise quality evaluator for a possible-futures story draft.

${context}

DRAFT:
${draft}

Score the draft on a scale from 1-10 across these dimensions, then output a single overall score:
- Concreteness: Does the draft use specific nouns, places, objects instead of abstractions?
- Texture: Is there variation in register (plain sentences mixed with charged ones)?
- Questionnaire invisibility: Would a reader be unable to reverse-engineer the questionnaire?
- Narrative causality: Does the story cause itself forward rather than listing parallel events?
- Emotional charge: Does it feel alive, unfinished, and real?

Output ONLY a single line in this exact format:
SCORE: <number 1-10>

Do not add explanation, praise, or any other text.${langInstruction}`,
  };
}

export function parseQualityGateScore(rawText: string): QualityGateResult {
  const match = rawText.match(/SCORE:\s*(\d+)/i);
  const score = match ? Math.min(10, Math.max(1, parseInt(match[1], 10))) : 5;
  return { score, shouldContinue: score < 7 };
}

// ---------------------------------------------------------------------------
// Enhancement 3: Multi-Round Critique — Revision Verification
// ---------------------------------------------------------------------------

export function generateRevisionVerificationPrompt(
  revisedDraft: string,
  originalCritiqueNotes: string,
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nRespond in ${LANG_NAMES[lang] || lang}.`
      : "";
  return {
    role: "user",
    content: `You are a revision verifier. Check whether the revised draft addressed the critique notes from the previous round.

ORIGINAL CRITIQUE NOTES:
${originalCritiqueNotes}

REVISED DRAFT:
${revisedDraft}

For each critique note, determine if it was addressed. If any notes were NOT addressed, output targeted fix instructions.

If ALL notes were addressed, respond with exactly:
REVISION_OK

If some notes were NOT addressed, respond with:
UNRESOLVED:
- <specific fix instruction for unresolved note 1>
- <specific fix instruction for unresolved note 2>

Keep fix instructions short and concrete. Do not re-critique new issues — only check the original notes.${langInstruction}`,
  };
}

export function parseRevisionVerification(rawText: string): {
  allResolved: boolean;
  unresolvedNotes: string | null;
} {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("REVISION_OK")) {
    return { allResolved: true, unresolvedNotes: null };
  }
  const unresolvedMatch = trimmed.match(/UNRESOLVED:\s*([\s\S]+)/i);
  return {
    allResolved: false,
    unresolvedNotes: unresolvedMatch ? unresolvedMatch[1].trim() : trimmed,
  };
}

// ---------------------------------------------------------------------------
// Enhancement 6: Scan Diversity Check
// ---------------------------------------------------------------------------

export function generateDiversityCheckPrompt(
  fragments: string[],
  lang = "en"
): Message {
  const langInstruction =
    lang !== "en"
      ? `\n\nRespond in ${LANG_NAMES[lang] || lang}.`
      : "";
  const numbered = fragments.map((f, i) => `${i + 1}:: ${f}`).join("\n");
  return {
    role: "user",
    content: `You are checking a set of story fragments for thematic diversity.

FRAGMENTS:
${numbered}

Check for near-duplicate or thematically overlapping fragments. Two fragments overlap if they express essentially the same future scenario, emotion, or image with only minor wording differences.

If ALL fragments are sufficiently distinct, respond with exactly:
DIVERSE_OK

If some fragments are too similar, list the indices that should be REPLACED (keep the stronger one from each pair), in this format:
REPLACE: 3, 7, 9

Only flag true near-duplicates. Fragments that share a broad theme (e.g., both mention work) but express different scenes or tensions are NOT duplicates.${langInstruction}`,
  };
}

export function parseDiversityCheck(rawText: string): {
  isDiverse: boolean;
  replaceIndices: number[];
} {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("DIVERSE_OK")) {
    return { isDiverse: true, replaceIndices: [] };
  }
  const replaceMatch = trimmed.match(/REPLACE:\s*([\d,\s]+)/i);
  if (!replaceMatch) return { isDiverse: true, replaceIndices: [] };
  const indices = replaceMatch[1]
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1);
  return { isDiverse: indices.length === 0, replaceIndices: indices };
}
