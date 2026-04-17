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
components/         Modular React components (Big5Form, NoiseSeedPanel, etc.)
hooks/              useGeneration.ts — generation pipeline logic
i18n/               Context-based i18n (English, Chinese, Japanese, Korean)
lib/                constants, prompts, providers, rateLimit
types/              Shared TypeScript types
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
```

## Commands

```bash
npm run dev       # local dev server
npm run build     # production build
npm run start     # run production build locally
npm run lint      # ESLint
```

## Generation Pipeline

1. **Scan** — LLM generates 10 raw noise fragments (4–12 words each).
2. **Curate** — User keeps up to 5 fragments; one random unselected fragment is auto-injected as a "wildcard".
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
- **Multiple samples** — parallel trajectories from the same starting point
- **i18n** — English, Chinese, Japanese, Korean
- **Multi-provider** — Anthropic, OpenRouter, xAI, Google Gemini

## Rate Limiting

Optional, enabled when `UPSTASH_REDIS_REST_URL` is set:

- **Per-minute**: IP-based throttling via Upstash Redis
- **Per-day**: Global cap via Upstash Redis counter; quota returned in `X-Daily-Remaining` / `X-Daily-Limit` response headers and cached client-side in localStorage

## Tech Stack

- **Framework**: Next.js (App Router) + React
- **LLM providers**: Anthropic, OpenRouter, xAI, Google Gemini
- **Rate limiting**: Upstash Redis
- **i18n**: Lightweight React Context (no dependencies)
