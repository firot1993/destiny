# Destiny

Destiny is a Next.js app for generating literary "possible futures" from a staged questionnaire, a Big Five personality read, and a short human curation step.

The current product is not a literal diffusion model. It is a prompt chain that scans for future fragments, lets the user catch the ones that feel charged, then denoises them into a finished narrative.

## Experience Flow

1. Fill out a four-chapter questionnaire in `Now`, `Unstable`, `Pull`, and `Motion`.
2. Rate the Big Five sliders to shape behavioral tone rather than surface facts.
3. Generate 10 story fragments, then catch the bullets you want to keep.
4. Answer two post-curation questions about why those fragments matter and which future you are refusing.
5. Fire the chamber and run a multi-step rewrite loop that turns the selected motifs into a finished life-path story.

## Architecture

```text
┌──────────────────────────┐      ┌──────────────────────────────┐
│  Next.js App Router UI   │ ───▶ │  /api/generate route handler │
│  app/page.tsx            │      │  app/api/generate/route.ts   │
└──────────────┬───────────┘      └──────────────┬───────────────┘
               │                                  │
               │                                  ├─ OpenRouter
               │                                  ├─ xAI
               │                                  ├─ Anthropic
               │                                  └─ Google Gemini
               │
               ├─ Questionnaire normalization (`lib/questionnaire.ts`)
               ├─ Story conditioning + prompts (`lib/prompts.ts`)
               ├─ Bullet model (`lib/revolver.ts`)
               ├─ Runtime orchestration (`hooks/useGeneration.ts`)
               └─ /api/telemetry (`app/api/telemetry/route.ts`)
                                                  │
                                                  └─ Supabase / Postgres (optional)
```

Provider responses are normalized to Anthropic-style text blocks before returning to the client. Optional rate limiting uses Upstash Redis for per-IP throttling plus a global daily cap, and the UI caches the daily quota snapshot in `localStorage`.

The in-app provider picker currently ships with OpenRouter and xAI presets from `lib/constants.ts`. The route adapter also contains direct Anthropic and Gemini support if the request body uses those providers.

When Supabase is configured, the app also records anonymous session telemetry, LLM calls, curated bullets, final stories, and story ratings for later analysis and dataset building. When it is not configured, telemetry calls are silent no-ops.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
OPENROUTER_API_KEY=        # required for the default provider path
XAI_API_KEY=               # optional, enables xAI models in the UI
ANTHROPIC_API_KEY=         # optional, supported by the route adapter
GOOGLE_API_KEY=            # optional, supported by the route adapter
SITE_URL=                  # optional, used as OpenRouter HTTP-Referer

UPSTASH_REDIS_REST_URL=    # optional, enables rate limiting
UPSTASH_REDIS_REST_TOKEN=  # optional
MAX_REQUESTS_PER_DAY=1000  # optional, defaults to 1000

SUPABASE_URL=              # optional, enables telemetry/persistence
SUPABASE_SERVICE_ROLE_KEY= # optional
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:watch

npm run db:start
npm run db:reset
npm run db:push
npm run db:stop
```

## Repository Layout

```text
app/                App Router pages, layout, globals, and API routes
components/         Questionnaire, curate-stage, results UI, and StoryRating
hooks/              Runtime orchestration for scan, curate, denoise, and telemetry
i18n/               English + Simplified Chinese UI copy
lib/                Questionnaire schema, prompts, providers, rateLimit, db, telemetry
public/             Static assets
supabase/           Local Supabase config + migrations for telemetry storage
test/               Vitest + RTL coverage for runtime and UI helpers
types/              Shared TypeScript types
doc/                Human-authored plans, architecture notes, and worklogs
docs/superpowers/   Skill-generated specs/plans from prior sessions
```

## Generation Pipeline

1. `Questionnaire`  
   `lib/questionnaire.ts` builds a route-aware multi-step form. Answers are normalized into the `Fields` shape used by prompts.

2. `Conditioning`  
   `buildStoryConditioning(...)` converts questionnaire answers, Big Five scores, and later curation answers into:
   - hard state
   - latent forces
   - personality signature

3. `Scan`  
   Step `0` in `generateStepPrompt(...)` asks the model for 10 unresolved future fragments. `parseNoiseFragments(...)` converts the raw response into bullets.

4. `Curate`  
   `BulletField` and `AmmoHUD` let the user catch up to 6 fragments into the revolver chamber. The user then answers `whyThese` and `rejectedFuture` before firing.

5. `Denoise`  
   `useGeneration.ts` runs a staged rewrite loop:
   - structure
   - critique
   - sharpen/refine
   - final story

   The hook also injects ordered bullet text plus a signature author chosen by `lib/styles.ts`.

6. `Cleanup`  
   A final cleanup prompt strips obvious questionnaire language and keeps the finished trajectory concrete.

## Persistence And Telemetry

The app can persist questionnaire answers, bullet selections, intermediate LLM calls, final stories, and user ratings to Postgres so the team can study generations and export fine-tuning datasets. The schema lives under `supabase/migrations/`.

```bash
npm run db:start
npm run db:reset
```

`npm run db:start` requires Docker and boots local Postgres plus Supabase Studio. After startup, copy the printed `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Studio is available at `http://localhost:54323`.

For production, link the repo to a Supabase project and run `npm run db:push` to promote migrations.

Telemetry is anonymous and session-based:

- A UUID stored in `localStorage` (`destiny-session-uuid`) identifies the browser session
- `/api/telemetry` records session start, curate completion, final story completion, and like/dislike feedback
- `/api/generate` can also persist per-phase LLM request/response pairs when a `sessionId` is present

Captured data includes:

- Questionnaire answers, Big Five scores, language, provider/model, and story conditioning
- Every LLM request/response pair across `scan`, `structure`, `critique`, `sharpen`, `final`, and `cleanup`
- Which fragments the user caught, their chamber order, curation answers, and chosen author voice
- The final story plus thumbs-up / thumbs-down feedback

No IP address, auth account, or browser fingerprint is stored in the telemetry schema. See `doc/architecture/telemetry-and-persistence.md` for more detail.

## Rate Limiting

Optional, enabled when `UPSTASH_REDIS_REST_URL` is set:

- Per-IP throttling via Upstash Redis
- A global daily cap returned in `X-Daily-Remaining` / `X-Daily-Limit` headers and cached client-side in `localStorage`

## Product Notes

- The questionnaire is chapter-based, not a plain profile form.
- Big Five scores affect behavior and tone, not just labels.
- The curate phase is a real user choice point, not a cosmetic animation.
- The final output is a literary future narrative shaped by a multi-pass rewrite loop.
- Users can rate the finished story with a simple like/dislike control.
- Current i18n support is English and Simplified Chinese.

## Tech Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Framer Motion
- Upstash Redis for optional rate limiting
- Supabase/Postgres for optional telemetry persistence
- Vitest + React Testing Library
