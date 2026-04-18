export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  provider: string;
  model: string;
  max_tokens: number;
  temperature: number;
  messages: Message[];
}

export interface AnthropicResponse {
  content: Array<{ type: "text"; text: string }>;
}

export interface DailyQuota {
  limit: number;
  remaining: number;
}

export interface NoiseFragment {
  id: number;
  text: string;
}

export type BulletStatus =
  | "flying"
  | "ricocheting"
  | "caught"
  | "spent";

export interface Bullet {
  id: number;
  text: string;
  status: BulletStatus;
  passCount: number;
  chamberIndex: number | null;
}

export const REVOLVER_CHAMBERS = 6;
export const MAX_BULLET_PASSES = 3;

export type AgeGroup = "youth" | "twenties" | "midcareer" | "senior";

export interface Fields {
  // Chapter I — Now
  age: string;
  mobility: string;
  currentMode: string;
  // Chapter II — Unstable
  trajectoryFocus: string;
  hiddenEdge: string;
  recurringTrap: string;
  costWillingness: string;
  // Chapter III — Pull
  magneticScene: string;
  socialMirror: string;
  obsessions: string;
  // Chapter IV — Motion
  delayFailureMode: string;
  inflection: string;
  // Legacy aliases (populated by buildFieldsFromAnswers so prompts.ts inference
  // still fires against the old keyword arms while the new fields carry the
  // real signal):
  location: string; // = mobility
  skills: string; // derived (may be "")
  resources: string; // = hiddenEdge
  constraints: string; // = recurringTrap
  workStyle: string; // = magneticScene
  riskTolerance: string; // = costWillingness
  timeHorizon: string; // = socialMirror
}

export interface CurationAnswers {
  whyThese: string;
  rejectedFuture: string;
}

export interface StoryConditioning {
  hardState: {
    ageBand: string;
    mobility: string;
    chapter: string;
    horizon: string;
    anchorResource?: string;
    anchorConstraint?: string;
    secondaryConstraint?: string;
  };
  latentForces: {
    coreTension: string;
    momentumPattern: string;
    exposurePattern: string;
    riskPattern: string;
    identityPressure: string;
    likelyTransformation: string;
    selectionCharge?: string;
    rejectedGravity?: string;
  };
  personalitySignature: {
    noveltyAppetite: string;
    consistencyPressure: string;
    socialPropulsion: string;
    conflictTolerance: string;
    anticipatorySensitivity: string;
    combinedReading: string;
  };
}

export type RunPhase = "idle" | "scanning" | "reviewing" | "ready" | "denoising" | "complete";
export type WorkflowStage = "scan" | "curate" | "denoise";
export type Language = "en" | "zh";
export type QuestionnaireAnswers = Record<string, string[]>;
