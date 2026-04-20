import { NextResponse } from "next/server";
import {
  createSession,
  updateSessionCuration,
  completeSession,
  rateSession,
} from "@/lib/telemetry";
import type {
  Bullet,
  BulletStatus,
  CurationAnswers,
  Fields,
  QuestionnaireAnswers,
  StoryConditioning,
} from "@/types";

interface SessionStartBody {
  type: "session-start";
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

interface CurateCompleteBody {
  type: "curate-complete";
  sessionId: string;
  scanFragments: Array<{
    id: number;
    text: string;
    status: BulletStatus;
    passCount: number;
    chamberIndex: number | null;
  }>;
  curationAnswers: CurationAnswers;
  authorVoice?: string;
}

interface StoryCompleteBody {
  type: "story-complete";
  sessionId: string;
  finalStory: string;
}

interface RateBody {
  type: "rate";
  sessionId: string;
  rating: "like" | "dislike";
  feedback?: string;
}

type Body =
  | SessionStartBody
  | CurateCompleteBody
  | StoryCompleteBody
  | RateBody;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  switch (body.type) {
    case "session-start": {
      if (!body.sessionUuid) {
        return NextResponse.json(
          { error: "sessionUuid required" },
          { status: 400 }
        );
      }
      const sessionId = await createSession({
        sessionUuid: body.sessionUuid,
        language: body.language,
        provider: body.provider,
        model: body.model,
        guidance: body.guidance,
        denoiseSteps: body.denoiseSteps,
        bigFive: body.bigFive,
        questionnaireAnswers: body.questionnaireAnswers,
        normalizedFields: body.normalizedFields,
        storyConditioning: body.storyConditioning,
      });
      return NextResponse.json({ sessionId });
    }
    case "curate-complete": {
      if (!body.sessionId) {
        return NextResponse.json(
          { error: "sessionId required" },
          { status: 400 }
        );
      }
      const fragments: Bullet[] = body.scanFragments.map((f) => ({
        id: f.id,
        text: f.text,
        status: f.status,
        passCount: f.passCount,
        chamberIndex: f.chamberIndex,
      }));
      await updateSessionCuration({
        sessionId: body.sessionId,
        scanFragments: fragments,
        curationAnswers: body.curationAnswers,
        authorVoice: body.authorVoice,
      });
      return NextResponse.json({ ok: true });
    }
    case "story-complete": {
      if (!body.sessionId) {
        return NextResponse.json(
          { error: "sessionId required" },
          { status: 400 }
        );
      }
      await completeSession(body.sessionId, body.finalStory);
      return NextResponse.json({ ok: true });
    }
    case "rate": {
      if (!body.sessionId || !body.rating) {
        return NextResponse.json(
          { error: "sessionId and rating required" },
          { status: 400 }
        );
      }
      await rateSession(body.sessionId, body.rating, body.feedback);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  }
}
