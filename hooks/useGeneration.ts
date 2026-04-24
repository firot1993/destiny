"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  generateQualityGatePrompt,
  parseQualityGateScore,
  generateRevisionVerificationPrompt,
  parseRevisionVerification,
  generateDiversityCheckPrompt,
  parseDiversityCheck,
  extractNormalizedText,
  parseNoiseFragments,
} from "@/lib/prompts";
import { getAgeGroup } from "@/lib/questionnaire";
import { pickSignatureStyle } from "@/lib/styles";
import {
  DAILY_USAGE_STORAGE_PREFIX,
  API_ROUTE,
  QUALITY_GATE_THRESHOLD,
  MAX_EXTRA_SHARPEN_PASSES,
} from "@/lib/constants";
import { BIG5_KEYS } from "@/lib/constants";

type TelemetryPhase =
  | "scan"
  | "structure"
  | "critique"
  | "sharpen"
  | "final"
  | "cleanup"
  | "quality_gate"
  | "revision_verify"
  | "diversity_check"
  | "scan_rescan";

const TELEMETRY_ROUTE = "/api/telemetry";

function postTelemetry(body: unknown): Promise<Response> | null {
  if (typeof window === "undefined") return null;
  return fetch(TELEMETRY_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => new Response(null, { status: 0 }));
}

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
  sessionUuid?: string;
  enableGeminiSearch?: boolean;
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
  sessionId: string | null;
  /** Streaming text accumulated so far during the final/cleanup step */
  streamingText: string;
  /** The latest quality gate score from the adaptive loop (0 if not yet run) */
  lastQualityScore: number;
  /** Pending steering note — set externally to inject direction before sharpen */
  steeringNote: string;
  setSteeringNote: (note: string) => void;
  /** Resume generation after the steering pause */
  resumeFromSteering: () => void;
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
  sessionUuid,
  enableGeminiSearch,
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [lastQualityScore, setLastQualityScore] = useState(0);
  const [steeringNote, setSteeringNote] = useState("");
  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef(false);
  const generationLockRef = useRef(false);
  // Steering pause mechanism: resolve this promise to resume generation
  const steeringResolveRef = useRef<(() => void) | null>(null);
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
    maxTokens = 1000,
    telemetryMeta?: { phase: TelemetryPhase; stepIndex?: number },
    opts?: { stream?: boolean }
  ): Promise<string> => {
    const today = getUtcDateKey();
    const currentUsage =
      readDailyUsageSnapshot() ??
      (dailyUsageDate === today &&
      dailyRemaining !== null &&
      dailyLimit !== null
        ? { remaining: dailyRemaining, limit: dailyLimit }
        : null);

    const telemetry =
      sessionIdRef.current && telemetryMeta
        ? {
            sessionId: sessionIdRef.current,
            phase: telemetryMeta.phase,
            stepIndex: telemetryMeta.stepIndex ?? 0,
          }
        : undefined;

    const shouldStream = opts?.stream === true;

    const res = await fetch(API_ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        max_tokens: maxTokens,
        temperature,
        messages,
        ...(telemetry ? { telemetry } : {}),
        ...(shouldStream ? { stream: true } : {}),
        ...(enableGeminiSearch !== undefined ? { enableGeminiSearch } : {}),
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

    // ---------------------------------------------------------------------------
    // Streaming response path (Enhancement 2)
    // ---------------------------------------------------------------------------
    if (shouldStream && res.headers.get("Content-Type")?.includes("text/event-stream") && res.body) {
      let fullText = "";
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE lines for OpenAI-compat format
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const delta = parsed?.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  setStreamingText(fullText);
                }
              } catch {
                // Ignore malformed SSE lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!fullText) throw new Error("Streaming API returned no text content.");
      return fullText;
    }

    // ---------------------------------------------------------------------------
    // Standard JSON response path
    // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Enhancement 6: Scan with diversity check
  // ---------------------------------------------------------------------------
  const scanNoiseFragments = async () => {
    if (generationLockRef.current) return;
    generationLockRef.current = true;

    const conditioning = buildStoryConditioning(fields, big5);
    setIsGenerating(true);
    setRunPhase("scanning");
    setBullets([]);
    clearDenoisedOutputs();
    setError(null);
    setStreamingText("");
    setLastQualityScore(0);
    setSteeringNote("");
    abortRef.current = false;
    setCurrentStep(0);

    // Fresh generation attempt → fresh session row.
    sessionIdRef.current = null;
    setSessionId(null);
    if (sessionUuid) {
      try {
        const bigFivePayload = Object.fromEntries(
          BIG5_KEYS.map((k, i) => [k, big5[i]])
        );
        const res = await postTelemetry({
          type: "session-start",
          sessionUuid,
          language: lang,
          provider,
          model,
          guidance,
          denoiseSteps,
          bigFive: bigFivePayload,
          questionnaireAnswers,
          normalizedFields: fields,
          storyConditioning: conditioning,
        });
        if (res && res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { sessionId?: string }
            | null;
          if (data?.sessionId) {
            sessionIdRef.current = data.sessionId;
            setSessionId(data.sessionId);
          }
        }
      } catch {
        // Telemetry must never break generation.
      }
    }

    try {
      const msg = generateStepPrompt(
        0,
        denoiseSteps,
        conditioning,
        guidance,
        null,
        lang
      );
      const rawNoise = await callModel([msg], 1.15, 1000, {
        phase: "scan",
        stepIndex: 0,
      });

      if (abortRef.current) {
        setRunPhase("idle");
        return;
      }

      let parsedNoise = parseNoiseFragments(rawNoise);
      if (parsedNoise.length === 0) {
        throw new Error("Noise scan returned no usable fragments.");
      }

      // Enhancement 6: Diversity check — score fragments for thematic overlap
      if (parsedNoise.length >= 4 && !abortRef.current) {
        try {
          const diversityMsg = generateDiversityCheckPrompt(parsedNoise, lang);
          const diversityRaw = await callModel([diversityMsg], 0.5, 400, {
            phase: "diversity_check",
            stepIndex: 0,
          });
          const diversityResult = parseDiversityCheck(diversityRaw);

          if (
            !diversityResult.isDiverse &&
            diversityResult.replaceIndices.length > 0 &&
            !abortRef.current
          ) {
            // Re-scan only the duplicate slots (up to 1 retry)
            const replacementCount = diversityResult.replaceIndices.length;
            const rescanMsg = generateStepPrompt(
              0,
              denoiseSteps,
              conditioning,
              guidance,
              null,
              lang
            );
            const rescanRaw = await callModel([rescanMsg], 1.25, 1000, {
              phase: "scan_rescan",
              stepIndex: 0,
            });
            const rescanFragments = parseNoiseFragments(rescanRaw);

            // Replace flagged indices with fresh fragments
            if (rescanFragments.length > 0) {
              let rescanIdx = 0;
              parsedNoise = parsedNoise.map((frag, i) => {
                if (
                  diversityResult.replaceIndices.includes(i + 1) &&
                  rescanIdx < rescanFragments.length &&
                  rescanIdx < replacementCount
                ) {
                  return rescanFragments[rescanIdx++];
                }
                return frag;
              });
            }
          }
        } catch {
          // Diversity check is best-effort — don't fail the scan
        }
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

  // ---------------------------------------------------------------------------
  // Enhancement 5: Resume from steering pause
  // ---------------------------------------------------------------------------
  const resumeFromSteering = useCallback(() => {
    if (steeringResolveRef.current) {
      steeringResolveRef.current();
      steeringResolveRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Main denoise generation with all agentic enhancements
  // ---------------------------------------------------------------------------
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
    setStreamingText("");
    setLastQualityScore(0);
    abortRef.current = false;

    // Record the user's curation choices before kicking off denoise.
    if (sessionIdRef.current) {
      postTelemetry({
        type: "curate-complete",
        sessionId: sessionIdRef.current,
        scanFragments: bullets.map((b) => ({
          id: b.id,
          text: b.text,
          status: b.status,
          passCount: b.passCount,
          chamberIndex: b.chamberIndex,
        })),
        curationAnswers: {
          whyThese: curationAnswers?.whyThese ?? "",
          rejectedFuture: curationAnswers?.rejectedFuture ?? "",
        },
        authorVoice: signatureStyle.author,
      });
    }

    try {
      const stepResults: string[] = [mergedNoiseSeed];
      let critiqueNotes: string | null = null;
      let currentSteeringNote: string | null = null;
      let extraSharpenPasses = 0;

      for (let step = 1; step < denoiseSteps; step++) {
        if (abortRef.current) break;
        setCurrentStep(step);

        const isFinalStep = step === denoiseSteps - 1;
        const progress = step / Math.max(1, denoiseSteps - 1);
        const isSharpenStep = step !== 0 && !isFinalStep && progress >= 0.45;
        const isStructureStep = step !== 0 && !isFinalStep && progress < 0.45;

        const msg = generateStepPrompt(
          step,
          denoiseSteps,
          conditioning,
          guidance,
          stepResults[step - 1],
          lang,
          orderedBulletTexts,
          critiqueNotes,
          signatureStyle.author,
          currentSteeringNote
        );

        const stepMaxTokens = isFinalStep ? 3000 : isSharpenStep ? 1800 : 1000;
        const phase: TelemetryPhase = isFinalStep
          ? "final"
          : isSharpenStep
          ? "sharpen"
          : "structure";

        // Use streaming for the final step (Enhancement 2)
        const useStreaming = isFinalStep;

        const result = await callModel([msg], 1.05, stepMaxTokens, {
          phase,
          stepIndex: step,
        }, { stream: useStreaming });
        stepResults.push(result);

        // Clear streaming text after step completes
        if (useStreaming) setStreamingText("");

        // -----------------------------------------------------------------------
        // Enhancement 3: Critique after the structure step
        // -----------------------------------------------------------------------
        if (isStructureStep && !abortRef.current) {
          const critiqueMsg = generateCritiquePrompt(result, conditioning, lang);
          critiqueNotes = await callModel([critiqueMsg], 0.7, 800, {
            phase: "critique",
            stepIndex: step,
          });
        }

        // -----------------------------------------------------------------------
        // Enhancement 5: Steering pause after structure step
        // -----------------------------------------------------------------------
        if (isStructureStep && !abortRef.current && !isFinalStep) {
          // Pause to let the user optionally type a steering note
          setRunPhase("steering");
          await new Promise<void>((resolve) => {
            steeringResolveRef.current = resolve;

            // Auto-resume after 15 seconds if the user doesn't interact
            const timer = setTimeout(() => {
              if (steeringResolveRef.current === resolve) {
                steeringResolveRef.current = null;
                resolve();
              }
            }, 15_000);

            // Also resolve immediately if we get resumed via the button
            const checkAbort = () => {
              if (abortRef.current) {
                clearTimeout(timer);
                resolve();
              }
            };
            // Check once quickly
            setTimeout(checkAbort, 100);
          });

          // Capture the steering note the user typed during the pause
          currentSteeringNote = steeringNote.trim() || null;
          if (!abortRef.current) setRunPhase("denoising");
        }

        // -----------------------------------------------------------------------
        // Enhancement 3: Multi-round critique — verify revision after sharpen
        // -----------------------------------------------------------------------
        if (isSharpenStep && critiqueNotes && !abortRef.current) {
          try {
            const verifyMsg = generateRevisionVerificationPrompt(
              result,
              critiqueNotes,
              lang
            );
            const verifyRaw = await callModel([verifyMsg], 0.5, 600, {
              phase: "revision_verify",
              stepIndex: step,
            });
            const verifyResult = parseRevisionVerification(verifyRaw);

            if (!verifyResult.allResolved && verifyResult.unresolvedNotes) {
              // Run one more targeted fix pass
              const fixMsg = generateStepPrompt(
                step,
                denoiseSteps,
                conditioning,
                guidance,
                result,
                lang,
                orderedBulletTexts,
                verifyResult.unresolvedNotes,
                signatureStyle.author,
                currentSteeringNote
              );
              const fixResult = await callModel([fixMsg], 1.0, 1800, {
                phase: "sharpen",
                stepIndex: step,
              });
              stepResults[stepResults.length - 1] = fixResult;
            }
          } catch {
            // Revision verification is best-effort
          }
          // Clear critique notes after sharpen to avoid double-injection
          critiqueNotes = null;
        }

        // -----------------------------------------------------------------------
        // Enhancement 1: Adaptive quality gate after sharpen
        // -----------------------------------------------------------------------
        if (
          isSharpenStep &&
          !isFinalStep &&
          !abortRef.current &&
          extraSharpenPasses < MAX_EXTRA_SHARPEN_PASSES
        ) {
          try {
            const latestDraft = stepResults[stepResults.length - 1];
            const gateMsg = generateQualityGatePrompt(latestDraft, conditioning, lang);
            const gateRaw = await callModel([gateMsg], 0.3, 100, {
              phase: "quality_gate",
              stepIndex: step,
            });
            const gateResult = parseQualityGateScore(gateRaw);
            setLastQualityScore(gateResult.score);

            if (gateResult.shouldContinue && gateResult.score < QUALITY_GATE_THRESHOLD) {
              // Add an extra sharpen pass — the draft needs more work
              extraSharpenPasses++;
              const extraMsg = generateStepPrompt(
                step,
                denoiseSteps,
                conditioning,
                guidance,
                latestDraft,
                lang,
                orderedBulletTexts,
                null,
                signatureStyle.author,
                currentSteeringNote
              );
              const extraResult = await callModel([extraMsg], 1.1, 1800, {
                phase: "sharpen",
                stepIndex: step,
              });
              stepResults[stepResults.length - 1] = extraResult;
            }
          } catch {
            // Quality gate is best-effort — don't fail generation
          }
        }
      }

      // -------------------------------------------------------------------------
      // Cleanup pass
      // -------------------------------------------------------------------------
      if (!abortRef.current && stepResults.length > 0) {
        const cleanupPrompt = generateCleanupPrompt(
          stepResults[stepResults.length - 1],
          lang
        );
        const cleanedTrajectory = await callModel([cleanupPrompt], 0.8, 3000, {
          phase: "cleanup",
          stepIndex: denoiseSteps,
        });
        stepResults[stepResults.length - 1] = cleanedTrajectory;
        setTrajectories([cleanedTrajectory]);
        setAllStepOutputs([stepResults]);

        if (sessionIdRef.current) {
          postTelemetry({
            type: "story-complete",
            sessionId: sessionIdRef.current,
            finalStory: cleanedTrajectory,
          });
        }
      }

      setRunPhase(abortRef.current ? "ready" : "complete");
    } catch (e) {
      setError((e as Error).message);
      setRunPhase("ready");
    } finally {
      generationLockRef.current = false;
      setIsGenerating(false);
      setCurrentStep(0);
      setStreamingText("");
    }
  };

  const workflowStage: WorkflowStage =
    runPhase === "scanning"
      ? "scan"
      : runPhase === "reviewing" || runPhase === "ready"
      ? "curate"
      : runPhase === "denoising" || runPhase === "steering" || trajectories.length > 0
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
    sessionId,
    streamingText,
    lastQualityScore,
    steeringNote,
    setSteeringNote,
    resumeFromSteering,
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
