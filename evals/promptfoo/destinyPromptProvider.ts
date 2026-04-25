import {
  buildStoryConditioning,
  generateCleanupPrompt,
  generateCritiquePrompt,
  generateDiversityCheckPrompt,
  generateQualityGatePrompt,
  generateRevisionVerificationPrompt,
  generateStepPrompt,
} from "../../lib/prompts";
import type { CurationAnswers, Fields, Message } from "../../types";

type PromptfooContext = {
  vars?: Record<string, unknown>;
};

type ProviderResponse = {
  output?: string;
  prompt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  tokenUsage?: {
    total: number;
    prompt: number;
    completion: number;
  };
};

type ProviderOptions = {
  id?: string;
  config?: Record<string, unknown>;
};

const SCENARIOS = [
  "scan",
  "structure",
  "critique",
  "sharpen",
  "final",
  "cleanup",
  "qualityGate",
  "revisionVerification",
  "diversityCheck",
] as const;

type Scenario = (typeof SCENARIOS)[number];

const SAMPLE_FIELDS: Fields = {
  age: "20-29",
  mobility: "Can relocate for the right upside",
  currentMode: "Early-career builder",
  trajectoryFocus: "Turning skill into real leverage",
  hiddenEdge: "Runway that buys patience, Taste that arrives before status",
  recurringTrap: "Waiting for certainty that never arrives",
  costWillingness: "Visibility before I feel ready",
  magneticScene: "A small room where one thing gets better every week",
  socialMirror: "That the quiet period was not stagnation",
  obsessions: "Leverage that keeps paying after the effort ends",
  delayFailureMode: "Waiting for certainty that never arrives",
  inflection: "A stranger bets on me before the proof is in",
  location: "Can relocate for the right upside",
  skills: "",
  resources: "Runway that buys patience, Taste that arrives before status",
  constraints: "Waiting for certainty that never arrives",
  workStyle: "A small room where one thing gets better every week",
  riskTolerance: "Visibility before I feel ready",
  timeHorizon: "That the quiet period was not stagnation",
};

const SAMPLE_CURATION: CurationAnswers = {
  whyThese: "They feel dangerous but true",
  rejectedFuture: "too safe",
};

const SAMPLE_BIG5 = [9, 7, 3, 4, 8];

const SAMPLE_BULLETS = [
  "a desk moved beside the window",
  "rent paid from a small strange system",
  "a room that stops asking for proof",
  "the first no said without apology",
  "a train ticket bought before dawn",
  "someone else saying the quiet part",
];

const SAMPLE_DRAFT = `By November, the desk had moved beside the only window. The work was still small enough to fit in two browser tabs and one notebook, but people had started forwarding it without explanation. Rent came from a small strange system that paid on Tuesdays. Nobody called it brave.`;

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((item): item is string => typeof item === "string");
  return strings.length > 0 ? strings : fallback;
}

function isScenario(value: string): value is Scenario {
  return SCENARIOS.includes(value as Scenario);
}

function buildMessage(
  scenario: Scenario,
  vars: Record<string, unknown>
): { stage: string; message: Message } {
  const lang = readString(vars.lang, "en");
  const guidance = readNumber(vars.guidance, 7);
  const conditioning = buildStoryConditioning(SAMPLE_FIELDS, SAMPLE_BIG5, SAMPLE_CURATION);
  const selectedFragments = readStringArray(vars.bullets, SAMPLE_BULLETS);
  const previousDraft = readString(vars.draft, SAMPLE_DRAFT);
  const critiqueNotes = readString(
    vars.critiqueNotes,
    "- Replace the abstract summary with an object or action.\n- Let one image remain unexplained."
  );
  const steeringNote = readString(
    vars.steeringNote,
    "Make the future feel more costly and concrete."
  );
  const signatureAuthor = readString(vars.signatureAuthor, "Rachel Cusk");

  switch (scenario) {
    case "scan":
      return {
        stage: "scan",
        message: generateStepPrompt(0, 4, conditioning, guidance, null, lang),
      };
    case "structure":
      return {
        stage: "structure",
        message: generateStepPrompt(
          1,
          4,
          conditioning,
          guidance,
          selectedFragments.map((fragment, index) => `${index + 1}:: ${fragment}`).join("\n"),
          lang
        ),
      };
    case "critique":
      return {
        stage: "critique",
        message: generateCritiquePrompt(previousDraft, conditioning, lang),
      };
    case "sharpen":
      return {
        stage: "sharpen",
        message: generateStepPrompt(
          2,
          4,
          conditioning,
          guidance,
          previousDraft,
          lang,
          undefined,
          critiqueNotes,
          null,
          steeringNote
        ),
      };
    case "final":
      return {
        stage: "final",
        message: generateStepPrompt(
          3,
          4,
          conditioning,
          guidance,
          previousDraft,
          lang,
          selectedFragments,
          null,
          signatureAuthor
        ),
      };
    case "cleanup":
      return {
        stage: "cleanup",
        message: generateCleanupPrompt(previousDraft, lang, steeringNote),
      };
    case "qualityGate":
      return {
        stage: "qualityGate",
        message: generateQualityGatePrompt(previousDraft, conditioning, lang),
      };
    case "revisionVerification":
      return {
        stage: "revisionVerification",
        message: generateRevisionVerificationPrompt(previousDraft, critiqueNotes, lang),
      };
    case "diversityCheck":
      return {
        stage: "diversityCheck",
        message: generateDiversityCheckPrompt(selectedFragments, lang),
      };
  }
}

export default class DestinyPromptProvider {
  private providerId: string;

  constructor(options: ProviderOptions = {}) {
    this.providerId = options.id ?? "destiny-prompt-builder";
  }

  id(): string {
    return this.providerId;
  }

  async callApi(
    _prompt: string,
    context?: PromptfooContext
  ): Promise<ProviderResponse> {
    const vars = context?.vars ?? {};
    const scenario = readString(vars.scenario, "");

    if (!isScenario(scenario)) {
      return {
        error: `Unknown promptfoo scenario "${scenario || "(empty)"}". Expected one of: ${SCENARIOS.join(", ")}.`,
      };
    }

    const { stage, message } = buildMessage(scenario, vars);

    return {
      output: message.content,
      prompt: message.content,
      metadata: {
        scenario,
        stage,
        lang: readString(vars.lang, "en"),
        role: message.role,
      },
      tokenUsage: {
        total: message.content.length,
        prompt: message.content.length,
        completion: 0,
      },
    };
  }
}
