"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CurationAnswers,
  Fields,
  NoiseFragment,
  QuestionnaireAnswers,
  Bullet,
  RunPhase,
  WorkflowStage,
} from "@/types";
import { REVOLVER_CHAMBERS } from "@/types";
import {
  fragmentToBullet,
  catchBullet as catchBulletHelper,
  ricochetBullet,
  buildBulletSeed,
} from "@/lib/revolver";
import {
  buildStoryConditioning,
  generateStepPrompt,
  generateCleanupPrompt,
  generateCritiquePrompt,
  extractNormalizedText,
  parseNoiseFragments,
} from "@/lib/prompts";
import { getAgeGroup } from "@/lib/questionnaire";
import { pickSignatureStyle } from "@/lib/styles";
import {
  DAILY_USAGE_STORAGE_PREFIX,
  API_ROUTE,
} from "@/lib/constants";

function getUtcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseHeaderInt(value: string | null): number | null {
  if (value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampDailyRemaining(remaining: number, limit: number): number {
  return Math.max(0, Math.min(remaining, limit));
}

interface DailyUsage {
  limit: number;
  remaining: number;
}

function readDailyUsageSnapshot(): DailyUsage | null {
  if (typeof window === "undefined") return null;
  const key = `${DAILY_USAGE_STORAGE_PREFIX}:${API_ROUTE}:${getUtcDateKey()}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DailyUsage>;
    const limit = typeof parsed?.limit === "number" ? parsed.limit : null;
    const remaining =
      typeof parsed?.remaining === "number" ? parsed.remaining : null;
    if (limit === null || remaining === null) return null;
    return { limit, remaining: clampDailyRemaining(remaining, limit) };
  } catch {
    return null;
  }
}

function writeDailyUsageSnapshot(usage: DailyUsage): void {
  if (typeof window === "undefined") return;
  const key = `${DAILY_USAGE_STORAGE_PREFIX}:${API_ROUTE}:${getUtcDateKey()}`;
  try {
    window.localStorage.setItem(key, JSON.stringify(usage));
  } catch {
  }
}

function resolveDailyUsage(opts: {
  currentUsage: DailyUsage | null;
  headerLimit: number | null;
  headerRemaining: number | null;
  shouldConsumeQuota: boolean;
}): DailyUsage | null {
  const { currentUsage, headerLimit, headerRemaining, shouldConsumeQuota } = opts;
  const nextLimit = headerLimit ?? currentUsage?.limit ?? null;
  if (nextLimit === null) return null;

  if (headerRemaining !== null) {
    return { limit: nextLimit, remaining: clampDailyRemaining(headerRemaining, nextLimit) };
  }

  if (!shouldConsumeQuota) {
    const stableRemaining = currentUsage?.remaining ?? null;
    if (stableRemaining === null) return null;
    return { limit: nextLimit, remaining: clampDailyRemaining(stableRemaining, nextLimit) };
  }

  const baselineRemaining = currentUsage?.remaining ?? headerRemaining ?? nextLimit;
  return {
    limit: nextLimit,
    remaining: clampDailyRemaining((baselineRemaining ?? nextLimit) - 1, nextLimit),
  };
}

export interface UseGenerationParams {
  fields: Fields;
  big5: number[];
  questionnaireAnswers?: QuestionnaireAnswers;
  curationAnswers?: Partial<CurationAnswers>;
  guidance: number;
  denoiseSteps: number;
  provider: string;
  model: string;
  lang: string;
  t: (key: string) => string;
}

export interface UseGenerationReturn {
  isGenerating: boolean;
  runPhase: RunPhase;
  currentStep: number;
  bullets: Bullet[];
  trajectories: string[];
  allStepOutputs: string[][];
  error: string | null;
  dailyRemaining: number | null;
  dailyLimit: number | null;
  workflowStage: WorkflowStage;
  scanNoiseFragments: () => Promise<void>;
  generate: () => Promise<void>;
  catchBullet: (bulletId: number) => void;
  ricochetSingle: (bulletId: number) => void;
  ricochetUncaught: () => void;
  catchAll: () => void;
  reloadScan: () => Promise<void>;
  stopGeneration: () => void;
  previewAnimation: (fakeBullets: Bullet[]) => void;
}

export function useGeneration({
  fields,
  big5,
  questionnaireAnswers,
  curationAnswers,
  guidance,
  denoiseSteps,
  provider,
  model,
  lang,
  t,
}: UseGenerationParams): UseGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [runPhase, setRunPhase] = useState<RunPhase>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [trajectories, setTrajectories] = useState<string[]>([]);
  const [allStepOutputs, setAllStepOutputs] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [dailyUsageDate, setDailyUsageDate] = useState(() => getUtcDateKey());
  const abortRef = useRef(false);
  const generationLockRef = useRef(false);
  const caughtCount = bullets.filter((b) => b.status === "caught").length;
  const activeBulletsCount = bullets.filter(
    (b) => b.status === "flying" || b.status === "ricocheting"
  ).length;

  useEffect(() => {
    const today = getUtcDateKey();
    setDailyUsageDate(today);
    const snapshot = readDailyUsageSnapshot();
    if (snapshot) {
      setDailyRemaining(snapshot.remaining);
      setDailyLimit(snapshot.limit);
    } else {
      setDailyRemaining(null);
      setDailyLimit(null);
    }
  }, []);

  useEffect(() => {
    if (runPhase !== "reviewing" && runPhase !== "ready") return;

    if (
      caughtCount >= REVOLVER_CHAMBERS ||
      (caughtCount > 0 && activeBulletsCount === 0)
    ) {
      if (runPhase !== "ready") {
        setRunPhase("ready");
      }
      return;
    }

    if (runPhase === "ready") {
      setRunPhase("reviewing");
    }
  }, [activeBulletsCount, caughtCount, runPhase]);

  const callModel = async (
    messages: ReturnType<typeof generateStepPrompt>[],
    temperature = 1.0,
    maxTokens = 1000
  ): Promise<string> => {
    const today = getUtcDateKey();
    const currentUsage =
      readDailyUsageSnapshot() ??
      (dailyUsageDate === today &&
      dailyRemaining !== null &&
      dailyLimit !== null
        ? { remaining: dailyRemaining, limit: dailyLimit }
        : null);

    const res = await fetch(API_ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        max_tokens: maxTokens,
        temperature,
        messages,
      }),
    });

    const usage = resolveDailyUsage({
      currentUsage,
      headerRemaining: parseHeaderInt(res.headers.get("X-Daily-Remaining")),
      headerLimit: parseHeaderInt(res.headers.get("X-Daily-Limit")),
      shouldConsumeQuota: ![403, 405, 429].includes(res.status),
    });

    if (usage) {
      setDailyUsageDate(today);
      setDailyRemaining(usage.remaining);
      setDailyLimit(usage.limit);
      writeDailyUsageSnapshot(usage);
    }

    if (!res.ok) {
      const errText = await res.text();
      let message = errText;
      try {
        const parsed = JSON.parse(errText) as { error?: unknown };
        message =
          typeof parsed.error === "string"
            ? parsed.error
            : JSON.stringify(parsed.error ?? parsed);
      } catch {
      }
      throw new Error(`API ${res.status}: ${message.slice(0, 200)}`);
    }

    const data = await res.json() as {
      error?: unknown;
      content?: Array<{ type: string; text: string }>;
    };
    if (data.error)
      throw new Error(
        typeof data.error === "string" ? data.error : JSON.stringify(data.error)
      );
    if (!data.content || !Array.isArray(data.content))
      throw new Error(
        "Unexpected response: " + JSON.stringify(data).slice(0, 200)
      );

    const text = extractNormalizedText(data.content);
    if (!text) throw new Error("API returned no text content.");
    return text;
  };

  const clearDenoisedOutputs = () => {
    setTrajectories([]);
    setAllStepOutputs([]);
  };

  const scanNoiseFragments = async () => {
    if (generationLockRef.current) return;
    generationLockRef.current = true;

    const conditioning = buildStoryConditioning(fields, big5);
    setIsGenerating(true);
    setRunPhase("scanning");
    setBullets([]);
    clearDenoisedOutputs();
    setError(null);
    abortRef.current = false;
    setCurrentStep(0);

    try {
      const msg = generateStepPrompt(
        0,
        denoiseSteps,
        conditioning,
        guidance,
        null,
        lang
      );
      const rawNoise = await callModel([msg], 1.15);

      if (abortRef.current) {
        setRunPhase("idle");
        return;
      }

      const parsedNoise = parseNoiseFragments(rawNoise);
      if (parsedNoise.length === 0) {
        throw new Error("Noise scan returned no usable fragments.");
      }

      const scanned: NoiseFragment[] = parsedNoise.map((text, i) => ({ id: i + 1, text }));
      setBullets(scanned.map(fragmentToBullet));
      setRunPhase("reviewing");
    } catch (e) {
      setError((e as Error).message);
      setRunPhase("idle");
    } finally {
      generationLockRef.current = false;
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const catchBulletAction = (bulletId: number) => {
    if (isGenerating) return;
    setBullets((prev) => {
      const next = catchBulletHelper(prev, bulletId);
      const caught = next.filter((b) => b.status === "caught").length;
      if (caught >= REVOLVER_CHAMBERS) {
        setRunPhase("ready");
      }
      return next;
    });
  };

  const ricochetSingle = (bulletId: number) => {
    setBullets((prev) =>
      prev.map((b) => (b.id === bulletId ? ricochetBullet(b) : b))
    );
  };

  const ricochetUncaught = () => {
    setBullets((prev) => prev.map(ricochetBullet));
  };

  const catchAll = () => {
    if (isGenerating) return;
    setBullets((prev) => {
      let chamber = prev.filter((b) => b.status === "caught").length;
      if (chamber >= REVOLVER_CHAMBERS) return prev;
      const next = prev.map((b) => {
        if (chamber >= REVOLVER_CHAMBERS) return b;
        if (b.status === "flying" || b.status === "ricocheting") {
          const caught = { ...b, status: "caught" as const, chamberIndex: chamber };
          chamber += 1;
          return caught;
        }
        return b;
      });
      if (chamber >= REVOLVER_CHAMBERS) setRunPhase("ready");
      return next;
    });
  };

  const reloadScan = async () => {
    setBullets([]);
    await scanNoiseFragments();
  };

  const previewAnimation = (fakeBullets: Bullet[]) => {
    setBullets(fakeBullets);
    setRunPhase("reviewing");
  };

  const generate = async () => {
    if (generationLockRef.current || bullets.filter((b) => b.status === "caught").length === 0) return;
    generationLockRef.current = true;

    const conditioning = buildStoryConditioning(fields, big5, curationAnswers);
    const mergedNoiseSeed = buildBulletSeed(bullets);
    const orderedBulletTexts = [...bullets]
      .filter((b) => b.status === "caught" && b.chamberIndex !== null)
      .sort((a, b) => (a.chamberIndex ?? 0) - (b.chamberIndex ?? 0))
      .map((b) => b.text);
    const signatureStyle = pickSignatureStyle(
      getAgeGroup(fields.age),
      questionnaireAnswers
    );

    setIsGenerating(true);
    setRunPhase("denoising");
    clearDenoisedOutputs();
    setError(null);
    abortRef.current = false;

    try {
      const stepResults: string[] = [mergedNoiseSeed];
      let critiqueNotes: string | null = null;

      for (let step = 1; step < denoiseSteps; step++) {
        if (abortRef.current) break;
        setCurrentStep(step);
        const msg = generateStepPrompt(
          step,
          denoiseSteps,
          conditioning,
          guidance,
          stepResults[step - 1],
          lang,
          orderedBulletTexts,
          critiqueNotes,
          signatureStyle.author
        );
        // Final step produces the full 4-paragraph story; sharpen produces 2-3
        // paragraphs. Give them enough headroom (esp. for CJK, which tokenizes
        // more densely than English).
        const isFinalStep = step === denoiseSteps - 1;
        const progress = step / Math.max(1, denoiseSteps - 1);
        const isSharpenStep = step !== 0 && !isFinalStep && progress >= 0.45;
        const stepMaxTokens = isFinalStep ? 3000 : isSharpenStep ? 1800 : 1000;
        const result = await callModel([msg], 1.05, stepMaxTokens);
        stepResults.push(result);

        // Critique after the structure step (progress < 0.45).
        const isStructureStep = step !== 0 && !isFinalStep && progress < 0.45;
        if (isStructureStep && !abortRef.current) {
          const critiqueMsg = generateCritiquePrompt(result, conditioning, lang);
          critiqueNotes = await callModel([critiqueMsg], 0.7, 800);
        }
      }

      if (!abortRef.current && stepResults.length > 0) {
        const cleanupPrompt = generateCleanupPrompt(
          stepResults[stepResults.length - 1],
          lang
        );
        const cleanedTrajectory = await callModel([cleanupPrompt], 0.8, 3000);
        stepResults[stepResults.length - 1] = cleanedTrajectory;
        setTrajectories([cleanedTrajectory]);
        setAllStepOutputs([stepResults]);
      }

      setRunPhase(abortRef.current ? "ready" : "complete");
    } catch (e) {
      setError((e as Error).message);
      setRunPhase("ready");
    } finally {
      generationLockRef.current = false;
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const workflowStage: WorkflowStage =
    runPhase === "scanning"
      ? "scan"
      : runPhase === "reviewing" || runPhase === "ready"
      ? "curate"
      : runPhase === "denoising" || trajectories.length > 0
      ? "denoise"
      : "scan";

  return {
    isGenerating,
    runPhase,
    currentStep,
    bullets,
    trajectories,
    allStepOutputs,
    error,
    dailyRemaining,
    dailyLimit,
    workflowStage,
    scanNoiseFragments,
    generate,
    catchBullet: catchBulletAction,
    ricochetSingle,
    ricochetUncaught,
    catchAll,
    reloadScan,
    stopGeneration: () => { abortRef.current = true; },
    previewAnimation,
  };
}
