import { getDb } from "@/lib/db";
import type {
  Bullet,
  CurationAnswers,
  Fields,
  QuestionnaireAnswers,
  StoryConditioning,
} from "@/types";

export type SessionStatus =
  | "scanning"
  | "curating"
  | "denoising"
  | "complete"
  | "abandoned";

export type LlmPhase =
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

export type UserRating = "like" | "dislike";

export interface CreateSessionPayload {
  sessionUuid: string;
  language?: string;
  provider?: string;
  model?: string;
  guidance?: number;
  denoiseSteps?: number;
  bigFive?: Record<string, number>;
  questionnaireAnswers?: QuestionnaireAnswers;
  normalizedFields?: Fields;
  storyConditioning?: StoryConditioning;
}

export interface RecordLlmCallPayload {
  sessionId: string;
  phase: LlmPhase;
  stepIndex?: number;
  systemPrompt?: string;
  userPrompt: string;
  responseText: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  latencyMs?: number;
}

export interface UpdateCurationPayload {
  sessionId: string;
  scanFragments: Bullet[];
  curationAnswers: CurationAnswers;
  authorVoice?: string;
}

/** Best-effort — never throws; DB writes must not break the user-facing flow. */
function warn(op: string, err: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[telemetry] ${op} failed:`, err);
  }
}

export async function createSession(
  payload: CreateSessionPayload
): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from("sessions")
      .insert({
        session_uuid: payload.sessionUuid,
        status: "scanning",
        language: payload.language ?? null,
        provider: payload.provider ?? null,
        model: payload.model ?? null,
        guidance: payload.guidance ?? null,
        denoise_steps: payload.denoiseSteps ?? null,
        big_five: payload.bigFive ?? null,
        questionnaire_answers: payload.questionnaireAnswers ?? null,
        normalized_fields: payload.normalizedFields ?? null,
        story_conditioning: payload.storyConditioning ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data?.id ?? null;
  } catch (err) {
    warn("createSession", err);
    return null;
  }
}

export async function recordLlmCall(
  payload: RecordLlmCallPayload
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const { error } = await db.from("llm_calls").insert({
      session_id: payload.sessionId,
      phase: payload.phase,
      step_index: payload.stepIndex ?? 0,
      system_prompt: payload.systemPrompt ?? null,
      user_prompt: payload.userPrompt,
      response_text: payload.responseText,
      provider: payload.provider ?? null,
      model: payload.model ?? null,
      temperature: payload.temperature ?? null,
      max_tokens: payload.maxTokens ?? null,
      latency_ms: payload.latencyMs ?? null,
    });
    if (error) throw error;
  } catch (err) {
    warn("recordLlmCall", err);
  }
}

export async function updateSessionCuration(
  payload: UpdateCurationPayload
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const fragmentsSnapshot = payload.scanFragments.map((b) => ({
      id: b.id,
      text: b.text,
      final_status: b.status,
      chamber_index: b.chamberIndex,
      pass_count: b.passCount,
    }));
    const { error } = await db
      .from("sessions")
      .update({
        status: "denoising",
        scan_fragments: fragmentsSnapshot,
        curation_answers: payload.curationAnswers,
        author_voice: payload.authorVoice ?? null,
      })
      .eq("id", payload.sessionId);
    if (error) throw error;
  } catch (err) {
    warn("updateSessionCuration", err);
  }
}

export async function completeSession(
  sessionId: string,
  finalStory: string
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const { error } = await db
      .from("sessions")
      .update({ status: "complete", final_story: finalStory })
      .eq("id", sessionId);
    if (error) throw error;
  } catch (err) {
    warn("completeSession", err);
  }
}

export async function rateSession(
  sessionId: string,
  rating: UserRating,
  feedback?: string
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    const { error } = await db
      .from("sessions")
      .update({
        user_rating: rating,
        user_feedback: feedback ?? null,
        rated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
    if (error) throw error;
  } catch (err) {
    warn("rateSession", err);
  }
}
