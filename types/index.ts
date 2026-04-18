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
  age: string;
  location: string;
  skills: string;
  resources: string;
  constraints: string;
  obsessions: string;
  currentMode: string;
  trajectoryFocus: string;
  workStyle: string;
  riskTolerance: string;
  timeHorizon: string;
  mobility: string;
  inflection: string;
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
