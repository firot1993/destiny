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
  mergeSource?: "selected" | "wildcard";
}

export interface MergedNoisePlan {
  fragments: NoiseFragment[];
  droppedFragment: NoiseFragment | null;
  wildcardFragment: NoiseFragment | null;
}

export interface Fields {
  age: string;
  location: string;
  skills: string;
  resources: string;
  constraints: string;
  obsessions: string;
}

export type RunPhase = "idle" | "scanning" | "reviewing" | "ready" | "denoising" | "complete";
export type WorkflowStage = "scan" | "curate" | "denoise";
export type MergeRevealStage = "idle" | "holding" | "glitch" | "revealed";
export type Language = "en" | "zh";
