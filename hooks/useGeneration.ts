"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Fields,
  NoiseFragment,
  MergedNoisePlan,
  RunPhase,
  WorkflowStage,
  MergeRevealStage,
} from "@/types";
import {
  buildStateString,
  generateStepPrompt,
  extractNormalizedText,
  parseNoiseFragments,
  buildMergedNoisePlan,
  buildMergedNoiseSeed,
} from "@/lib/prompts";
import {
  MAX_KEPT_NOISE,
  MAX_REMOVED_NOISE,
  DAILY_USAGE_STORAGE_PREFIX,
  API_ROUTE,
} from "@/lib/constants";

// ─── Daily quota helpers ──────────────────────────────────

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
    // ignore storage failures
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

// ─── Hook params / return ────────────────────────────────

export interface UseGenerationParams {
  fields: Fields;
  big5: number[];
  guidance: number;
  denoiseSteps: number;
  provider: string;
  model: string;
  lang: string;
  t: (key: string) => string;
}

export interface UseGenerationReturn {
  // State
  isGenerating: boolean;
  runPhase: RunPhase;
  currentStep: number;
  noiseFragments: NoiseFragment[];
  currentNoiseIndex: number;
  keptNoiseFragments: NoiseFragment[];
  mergedNoisePlan: MergedNoisePlan | null;
  mergeRevealStage: MergeRevealStage;
  trajectories: string[];
  allStepOutputs: string[][];
  error: string | null;
  dailyRemaining: number | null;
  dailyLimit: number | null;
  // Derived
  currentNoiseFragment: NoiseFragment | null;
  removedNoiseCount: number;
  keepSlotsLeft: number;
  workflowStage: WorkflowStage;
  canRemoveCurrentNoise: boolean;
  canKeepCurrentNoise: boolean;
  isMergeRevealPending: boolean;
  // Actions
  scanNoiseFragments: () => Promise<void>;
  denoiseSelectedNoise: () => Promise<void>;
  decideCurrentNoise: (decision: "keep" | "remove") => void;
  stopGeneration: () => void;
}

// ─── Hook implementation ─────────────────────────────────

export function useGeneration({
  fields,
  big5,
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
  const [noiseFragments, setNoiseFragments] = useState<NoiseFragment[]>([]);
  const [currentNoiseIndex, setCurrentNoiseIndex] = useState(0);
  const [keptNoiseFragments, setKeptNoiseFragments] = useState<NoiseFragment[]>([]);
  const [mergedNoisePlan, setMergedNoisePlan] = useState<MergedNoisePlan | null>(null);
  const [mergeRevealStage, setMergeRevealStage] = useState<MergeRevealStage>("idle");
  const [trajectories, setTrajectories] = useState<string[]>([]);
  const [allStepOutputs, setAllStepOutputs] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [dailyUsageDate, setDailyUsageDate] = useState(() => getUtcDateKey());
  const abortRef = useRef(false);
  const generationLockRef = useRef(false);

  // Load stored daily quota on mount
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

  // Merge reveal animation timing
  useEffect(() => {
    if (!mergedNoisePlan) {
      setMergeRevealStage("idle");
      return;
    }
    if (runPhase !== "ready") {
      if (
        runPhase === "idle" ||
        runPhase === "reviewing" ||
        runPhase === "scanning"
      ) {
        setMergeRevealStage("idle");
      }
      return;
    }
    setMergeRevealStage("holding");
    const glitchTimer = window.setTimeout(
      () => setMergeRevealStage("glitch"),
      2400
    );
    const revealTimer = window.setTimeout(
      () => setMergeRevealStage("revealed"),
      3200
    );
    return () => {
      window.clearTimeout(glitchTimer);
      window.clearTimeout(revealTimer);
    };
  }, [runPhase, mergedNoisePlan]);

  // ─── callModel ───────────────────────────────────────────

  const callModel = async (
    messages: ReturnType<typeof generateStepPrompt>[],
    temperature = 1.0
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
        max_tokens: 1000,
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
        // leave non-JSON as-is
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

  // ─── Helpers ─────────────────────────────────────────────

  const clearDenoisedOutputs = () => {
    setTrajectories([]);
    setAllStepOutputs([]);
  };

  const lockNoiseSelection = (
    selectedFragments: NoiseFragment[],
    nextNoiseIndex: number
  ) => {
    setKeptNoiseFragments(selectedFragments);
    setMergedNoisePlan(
      buildMergedNoisePlan(selectedFragments, noiseFragments)
    );
    setCurrentNoiseIndex(nextNoiseIndex);
    setRunPhase("ready");
  };

  // ─── Actions ─────────────────────────────────────────────

  const decideCurrentNoise = (decision: "keep" | "remove") => {
    if (isGenerating) return;
    const currentNoiseFragment =
      runPhase === "reviewing" ? noiseFragments[currentNoiseIndex] ?? null : null;
    if (!currentNoiseFragment) return;

    setError(null);
    clearDenoisedOutputs();

    const nextKeptNoise =
      decision === "keep"
        ? [...keptNoiseFragments, currentNoiseFragment]
        : keptNoiseFragments;
    const nextNoiseIndex = currentNoiseIndex + 1;
    const removedAfterDecision = nextNoiseIndex - nextKeptNoise.length;

    if (nextKeptNoise.length >= MAX_KEPT_NOISE) {
      lockNoiseSelection(nextKeptNoise, nextNoiseIndex);
      return;
    }
    if (removedAfterDecision >= MAX_REMOVED_NOISE) {
      const remainingNoise = noiseFragments.slice(nextNoiseIndex);
      lockNoiseSelection(
        [...nextKeptNoise, ...remainingNoise],
        noiseFragments.length
      );
      return;
    }
    setKeptNoiseFragments(nextKeptNoise);
    setMergedNoisePlan(null);
    setCurrentNoiseIndex(nextNoiseIndex);
    if (nextNoiseIndex >= noiseFragments.length) {
      lockNoiseSelection(nextKeptNoise, nextNoiseIndex);
      return;
    }
    setRunPhase("reviewing");
  };

  const scanNoiseFragments = async () => {
    if (generationLockRef.current) return;
    generationLockRef.current = true;

    const stateStr = buildStateString(fields, big5);
    setIsGenerating(true);
    setRunPhase("scanning");
    setNoiseFragments([]);
    setKeptNoiseFragments([]);
    setMergedNoisePlan(null);
    setMergeRevealStage("idle");
    setCurrentNoiseIndex(0);
    clearDenoisedOutputs();
    setError(null);
    abortRef.current = false;
    setCurrentStep(0);

    try {
      const msg = generateStepPrompt(0, denoiseSteps, stateStr, guidance, null, lang);
      const rawNoise = await callModel([msg], 1.15);

      if (abortRef.current) {
        setRunPhase("idle");
        return;
      }

      const parsedNoise = parseNoiseFragments(rawNoise);
      if (parsedNoise.length === 0) {
        throw new Error("Noise scan returned no usable fragments.");
      }

      setNoiseFragments(parsedNoise.map((text, i) => ({ id: i + 1, text })));
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

  const denoiseSelectedNoise = async () => {
    if (generationLockRef.current || keptNoiseFragments.length === 0) return;
    generationLockRef.current = true;

    const stateStr = buildStateString(fields, big5);
    const activeMergedNoisePlan =
      mergedNoisePlan ?? buildMergedNoisePlan(keptNoiseFragments, noiseFragments);
    const mergedNoiseSeed = buildMergedNoiseSeed(activeMergedNoisePlan.fragments);

    setIsGenerating(true);
    setRunPhase("denoising");
    clearDenoisedOutputs();
    setError(null);
    abortRef.current = false;

    try {
      const stepResults: string[] = [mergedNoiseSeed];

      for (let step = 1; step < denoiseSteps; step++) {
        if (abortRef.current) break;
        setCurrentStep(step);
        const msg = generateStepPrompt(
          step,
          denoiseSteps,
          stateStr,
          guidance,
          stepResults[step - 1],
          lang
        );
        const result = await callModel([msg], 1.05);
        stepResults.push(result);
      }

      if (!abortRef.current && stepResults.length > 0) {
        setTrajectories([stepResults[stepResults.length - 1]]);
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

  // ─── Derived state ───────────────────────────────────────

  const currentNoiseFragment =
    runPhase === "reviewing" ? noiseFragments[currentNoiseIndex] ?? null : null;
  const removedNoiseCount = Math.max(0, currentNoiseIndex - keptNoiseFragments.length);
  const keepSlotsLeft = Math.max(0, MAX_KEPT_NOISE - keptNoiseFragments.length);
  const workflowStage: WorkflowStage =
    runPhase === "scanning"
      ? "scan"
      : runPhase === "reviewing" || runPhase === "ready"
      ? "curate"
      : runPhase === "denoising" || trajectories.length > 0
      ? "denoise"
      : "scan";
  const canRemoveCurrentNoise = Boolean(currentNoiseFragment);
  const canKeepCurrentNoise = Boolean(currentNoiseFragment) && keepSlotsLeft > 0;
  const isMergeRevealPending =
    runPhase === "ready" &&
    mergedNoisePlan !== null &&
    mergeRevealStage !== "revealed";

  return {
    isGenerating,
    runPhase,
    currentStep,
    noiseFragments,
    currentNoiseIndex,
    keptNoiseFragments,
    mergedNoisePlan,
    mergeRevealStage,
    trajectories,
    allStepOutputs,
    error,
    dailyRemaining,
    dailyLimit,
    currentNoiseFragment,
    removedNoiseCount,
    keepSlotsLeft,
    workflowStage,
    canRemoveCurrentNoise,
    canKeepCurrentNoise,
    isMergeRevealPending,
    scanNoiseFragments,
    denoiseSelectedNoise,
    decideCurrentNoise,
    stopGeneration: () => { abortRef.current = true; },
  };
}
