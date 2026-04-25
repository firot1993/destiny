import scenarios from "../golden/finalStoryScenarios.json";
import {
  buildStoryConditioning,
  extractNormalizedText,
  generateCleanupPrompt,
  generateStepPrompt,
} from "../../lib/prompts";
import { callProvider } from "../../lib/providers";
import type { CurationAnswers, Fields, LLMRequest } from "../../types";

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

type GoldenScenario = {
  id: string;
  description: string;
  lang: string;
  guidance: number;
  signatureAuthor: string;
  fields: Fields;
  big5: number[];
  curationAnswers: CurationAnswers;
  selectedFragments: string[];
  previousDraft: string;
  steeringNote?: string;
  expectedTraits?: Record<string, unknown>;
};

const GOLDEN_SCENARIOS = scenarios as GoldenScenario[];

const REQUIRED_API_KEY: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  gemini: "GOOGLE_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  xai: "XAI_API_KEY",
};

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

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no"].includes(value.toLowerCase())) return false;
  }
  return fallback;
}

function findScenario(id: string): GoldenScenario | undefined {
  return GOLDEN_SCENARIOS.find((scenario) => scenario.id === id);
}

function envRequirementError(provider: string): string | null {
  const envKey = REQUIRED_API_KEY[provider];
  if (!envKey || process.env[envKey]?.trim()) return null;
  return `Missing ${envKey}. Set it before running npm run eval:live.`;
}

function modelEnvKey(provider: string): string {
  return `PROMPTFOO_${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_MODEL`;
}

function readProviderModel(provider: string, vars: Record<string, unknown>, config: Record<string, unknown>): string {
  return readString(
    vars.model,
    readString(process.env[modelEnvKey(provider)], readString(config.model, ""))
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs: number
): Promise<T> {
  if (timeoutMs <= 0) return promise;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function buildRequest(
  provider: string,
  model: string,
  temperature: number,
  maxTokens: number,
  messages: LLMRequest["messages"]
): LLMRequest {
  return {
    provider,
    model,
    temperature,
    max_tokens: maxTokens,
    messages,
  };
}

export default class LiveFinalStoryProvider {
  private providerId: string;
  private config: Record<string, unknown>;

  constructor(options: ProviderOptions = {}) {
    this.providerId = options.id ?? "destiny-live-final-story";
    this.config = options.config ?? {};
  }

  id(): string {
    return this.providerId;
  }

  async callApi(
    prompt: string,
    context?: PromptfooContext
  ): Promise<ProviderResponse> {
    const vars = context?.vars ?? {};
    const scenarioId = readString(vars.scenarioId, readString(prompt, ""));
    const scenario = findScenario(scenarioId);

    if (!scenario) {
      return {
        error: `Unknown golden scenario "${scenarioId || "(empty)"}". Expected one of: ${GOLDEN_SCENARIOS.map((item) => item.id).join(", ")}.`,
      };
    }

    const provider = readString(vars.provider, readString(this.config.provider, "openrouter"));
    const model = readProviderModel(provider, vars, this.config);
    const envError = envRequirementError(provider);
    if (envError) return { error: envError };

    const runCleanup = readBoolean(vars.runCleanup, readBoolean(this.config.runCleanup, true));
    const temperature = readNumber(vars.temperature, readNumber(this.config.temperature, 1.0));
    const cleanupTemperature = readNumber(
      vars.cleanupTemperature,
      readNumber(this.config.cleanupTemperature, 0.8)
    );
    const maxTokens = readNumber(vars.maxTokens, readNumber(this.config.maxTokens, 3000));
    const cleanupMaxTokens = readNumber(
      vars.cleanupMaxTokens,
      readNumber(this.config.cleanupMaxTokens, 3000)
    );
    const timeoutMs = readNumber(
      vars.timeoutMs,
      readNumber(
        this.config.timeoutMs,
        readNumber(process.env.PROMPTFOO_LIVE_TIMEOUT_MS, 60_000)
      )
    );

    const conditioning = buildStoryConditioning(
      scenario.fields,
      scenario.big5,
      scenario.curationAnswers
    );
    const finalPrompt = generateStepPrompt(
      3,
      4,
      conditioning,
      scenario.guidance,
      scenario.previousDraft,
      scenario.lang,
      scenario.selectedFragments,
      null,
      scenario.signatureAuthor
    );

    try {
      const finalResponse = await withTimeout(
        callProvider(
          buildRequest(provider, model, temperature, maxTokens, [finalPrompt]),
          { enableGeminiSearch: false }
        ),
        `${provider}${model ? `/${model}` : ""} final call`,
        timeoutMs
      );
      const finalOutput = extractNormalizedText(finalResponse.content);

      let output = finalOutput;
      if (runCleanup) {
        const cleanupPrompt = generateCleanupPrompt(
          finalOutput,
          scenario.lang,
          scenario.steeringNote
        );
        const cleanupResponse = await withTimeout(
          callProvider(
            buildRequest(provider, model, cleanupTemperature, cleanupMaxTokens, [
              cleanupPrompt,
            ]),
            { enableGeminiSearch: false }
          ),
          `${provider}${model ? `/${model}` : ""} cleanup call`,
          timeoutMs
        );
        output = extractNormalizedText(cleanupResponse.content);
      }

      return {
        output,
        prompt: finalPrompt.content,
        metadata: {
          scenarioId,
          scenarioDescription: scenario.description,
          provider,
          model,
          runCleanup,
          signatureAuthor: scenario.signatureAuthor,
        },
        tokenUsage: {
          total: finalPrompt.content.length + output.length,
          prompt: finalPrompt.content.length,
          completion: output.length,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          scenarioId,
          provider,
          model,
          runCleanup,
        },
      };
    }
  }
}
