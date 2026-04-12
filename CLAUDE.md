# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Destiny** is a "Life Trajectory Diffusion" web app that uses iterative LLM refinement to generate possible life narratives from a user's current state and Big Five personality scores. The concept mirrors ML diffusion models: start with raw "noise" fragments and progressively denoise them into a coherent life trajectory.

## Repository Structure

```
app/                Next.js App Router (pages + API routes)
  page.tsx          Main UI — state machine and generation pipeline
  layout.tsx        Root layout
  globals.css       Global styles
  api/generate/     POST endpoint — provider routing + rate limiting
components/         Modular React components (Big5Form, NoiseSeedPanel, etc.)
hooks/              useGeneration.ts — generation pipeline logic
i18n/               Context-based i18n (English, Chinese, Japanese, Korean)
lib/                constants, prompts, providers, rateLimit
types/              Shared TypeScript type definitions
```

## Commands

```bash
npm install          # install deps
npm run dev          # local dev server (Next.js, with system proxy)
npm run build        # production build
npm run start        # run production build locally
npm run lint         # ESLint
```

Copy `.env.local.example` to `.env.local` and fill in:
```
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
XAI_API_KEY=          # optional
GOOGLE_API_KEY=        # optional
UPSTASH_REDIS_REST_URL=    # optional — enables rate limiting
UPSTASH_REDIS_REST_TOKEN=  # optional
MAX_REQUESTS_PER_DAY=1000  # optional, default 1000
```

## Architecture

### Data Flow

```
Browser (Next.js React)
  → /api/generate (Next.js Route Handler)
    → Claude / OpenRouter / xAI / Google Gemini
```

The API route (`app/api/generate/route.ts`) normalizes all provider responses into Anthropic's format before returning to the frontend. Rate limiting uses Upstash Redis (per-IP + global daily cap).

### Generation Pipeline (3 phases)

1. **Scan** — LLM generates 10 raw noise fragments (4–12 words each). Parsed via `^\s*\d+\s*::\s*(.+)$` with a fallback regex.
2. **Curate** — User keeps up to 5 fragments. One random unselected fragment is auto-injected as a "wildcard" and shuffled into the seed.
3. **Denoise** — Multi-step refinement loop (2–8 steps, configurable):
   - Step 0: Raw fragments
   - Steps 1–40%: Add structure and causality
   - Steps 40–70%: Sharpen specificity and turning points
   - Steps 70–100%: Emotional depth and inevitability
   - Final step: Polished 8–12 sentence narrative

Each denoising step feeds the previous output as context. The Big Five personality scores and guidance scale (1–10, "quiet life" → "biography-worthy") are included in every prompt.

### Key Files

- **`app/page.tsx`** — Main UI state machine (`idle → scanning → reviewing → ready → denoising`), daily quota tracking via localStorage.
- **`hooks/useGeneration.ts`** — Generation pipeline: prompt construction, fragment parsing, parallel trajectory generation.
- **`lib/prompts.ts`** — Prompt templates for each pipeline phase.
- **`lib/providers.ts`** — Multi-provider LLM client (Anthropic, OpenRouter, xAI, Gemini).
- **`lib/rateLimit.ts`** — Upstash Redis-backed per-IP and global daily rate limiting.
- **`i18n/index.tsx`** — i18n Context Provider; prompts respond in the selected language.

### Rate Limiting

- **Per-minute**: IP-based via Upstash Redis (disabled if `UPSTASH_REDIS_REST_URL` is unset)
- **Per-day**: Global cap via Upstash Redis counter; quota communicated via `X-Daily-Remaining` / `X-Daily-Limit` response headers and cached in localStorage.
