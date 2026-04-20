# Destiny — Life Trajectory Diffusion

A "diffusion model" for life trajectories. Input your current state, set guidance toward the phenomenal, and sample possible extraordinary futures.

Uses iterative LLM refinement to simulate denoising — starting from noise fragments and progressively sharpening them into coherent life trajectories.

## Architecture

```
┌──────────────────────────┐      ┌──────────────────────────────┐
│  Next.js App (React UI)  │ ───▶ │  /api/generate Route Handler │
│  app/page.tsx            │      │  app/api/generate/route.ts   │
└──────────────────────────┘      └──────────────┬───────────────┘
                                                 │
                        ┌────────────────────────┼────────────────────────┐
                        ▼                        ▼                        ▼
                  Anthropic API           OpenRouter API         xAI / Google Gemini
```

All provider responses are normalized to Anthropic's format before returning to the client. Rate limiting uses Upstash Redis (per-IP per-minute + global daily cap).

## Repository Structure

```
app/                Next.js App Router (pages + API routes)
  page.tsx          Main UI — state machine and generation pipeline
  api/generate/     POST endpoint — provider routing + rate limiting
components/         Modular React components (Big5Form, BulletField, AmmoHUD, etc.)
hooks/              useGeneration.ts — generation pipeline logic
i18n/               Context-based i18n (English, Chinese, Japanese, Korean)
lib/                constants, prompts, providers, rateLimit, db, telemetry
types/              Shared TypeScript types
supabase/           Local Postgres config + migrations (LLM dataset)
doc/                Plans, architecture notes, worklogs
```

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # then fill in keys
npm run dev
```

Open `http://localhost:3000`.

### Environment Variables

```
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
XAI_API_KEY=               # optional
GOOGLE_API_KEY=            # optional
UPSTASH_REDIS_REST_URL=    # optional — enables rate limiting
UPSTASH_REDIS_REST_TOKEN=  # optional
MAX_REQUESTS_PER_DAY=1000  # optional, default 1000
SUPABASE_URL=              # optional — enables telemetry/persistence
SUPABASE_SERVICE_ROLE_KEY= # optional
```

## Commands

```bash
npm run dev       # local dev server
npm run build     # production build
npm run start     # run production build locally
npm run lint      # ESLint
npm test          # vitest run
npm run test:watch # vitest watch

npm run db:start  # boot local Postgres + Studio (needs Docker)
npm run db:reset  # apply supabase/migrations/ to local DB
npm run db:push   # apply migrations to the linked Supabase project
npm run db:stop   # stop the local Postgres container
```

## Generation Pipeline

1. **Scan** — LLM generates 10 raw noise fragments (4–12 words each).
2. **Curate** — Fragments become "bullets" that fly across a kinetic typography field. User clicks to catch up to 6 bullets into a Danganronpa-style revolver chamber. Missed bullets ricochet and fade; after 3 passes they're spent. When 6 chambers are loaded, the player fires.
3. **Denoise** — Multi-step refinement loop (2–8 steps). Each step feeds the previous output as context; Big Five scores and guidance scale (1–10) are included in every prompt.
   - Steps 1–40%: add structure and causality
   - Steps 40–70%: sharpen specificity and turning points
   - Steps 70–100%: emotional depth and inevitability
   - Final step: polished 8–12 sentence narrative

## Features

- **Structured input** — age, location, skills, resources, constraints, obsessions
- **Big Five personality** — shapes HOW trajectories unfold, not just what happens
- **Adjustable denoising steps** (2–8) — more steps = finer refinement
- **Guidance scale** (1–10) — 1 = quiet life, 10 = biography-worthy
- **Danganronpa-style Curate** — kinetic typography bullet field, cartridge HUD, cinematic FIRE beat
- **i18n** — English, Chinese

## Local Database

The app persists questionnaire answers, bullet selections, intermediate LLM calls, final stories, and user ratings to Postgres so we can build a fine-tuning dataset. The schema lives under `supabase/migrations/`.

```bash
npm run db:start    # requires Docker — boots local Postgres + Studio on localhost
npm run db:reset    # applies all migrations to the fresh local DB
```

Copy the printed `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Open Studio at `http://localhost:54323` to browse rows. For production, link the repo to a Supabase cloud project and run `npm run db:push` to promote migrations.

When `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are unset, the app runs normally — every telemetry call is a silent no-op, matching the behavior of the Upstash rate limiter.

## Data Collection

Destiny captures anonymous generation telemetry to improve prompts and eventually fine-tune the model. Collected per session:

- Questionnaire answers, Big Five scores, guidance/denoise-step settings
- Every LLM request/response pair across the pipeline (`scan` → `structure` → `critique` → `sharpen` → `final` → `cleanup`)
- Which noise fragments the user caught, in which chamber order, plus their curation reflection
- The final story and the user's thumbs-up / thumbs-down rating

Each session is keyed by an anonymous UUID stored in `localStorage` (`destiny-session-uuid`) — **no IP address, no auth, no browser fingerprint**. See `doc/architecture/telemetry-and-persistence.md` for the schema and the SQL query to export a JSONL dataset for fine-tuning.

## Rate Limiting

Optional, enabled when `UPSTASH_REDIS_REST_URL` is set:

- **Per-minute**: IP-based throttling via Upstash Redis
- **Per-day**: Global cap via Upstash Redis counter; quota returned in `X-Daily-Remaining` / `X-Daily-Limit` response headers and cached client-side in localStorage

## Tech Stack

- **Framework**: Next.js (App Router) + React + Framer Motion
- **LLM providers**: Anthropic, OpenRouter, xAI
- **Rate limiting**: Upstash Redis
- **Persistence**: Supabase (Postgres) — optional, for fine-tuning dataset
- **i18n**: Lightweight React Context (no dependencies)
- **Testing**: Vitest + React Testing Library
