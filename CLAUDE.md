# CLAUDE.md

This file gives Claude Code project-specific guidance for working in this repository.

For the product overview, setup, commands, environment variables, and high-level runtime flow, treat [README.md](README.md) as the source of truth. When the product behavior or stack changes, update the README in the same pass.

## Documentation

Write durable project docs into `doc/` when the work is substantial. Match the content to the subfolder:

- `doc/plan/` — implementation plans for non-trivial work before coding starts
- `doc/architecture/` — notes on prompt flow, module boundaries, provider integration, and system behavior
- `doc/worklog/` — dated logs of meaningful work, tradeoffs, and dead ends

When to write:

- Before a multi-step implementation, add a plan in `doc/plan/`
- After meaningful work, append to the day's file in `doc/worklog/`
- When the system design changes, update the relevant file in `doc/architecture/`

Skip docs for trivial edits and typo-only changes. Prefer updating an existing file over creating a near-duplicate.

`docs/superpowers/` exists in the repo, but it contains skill-generated artifacts from earlier sessions. Keep human-maintained project context in `doc/` unless the task explicitly targets those generated files.

## Runtime Notes

### Questionnaire Shape

- The questionnaire is no longer the older profile form described by legacy field names in some notes.
- The current staged flow lives in `lib/questionnaire.ts` and `components/InputForm.tsx`.
- User-facing chapters are `Now`, `Unstable`, `Pull`, and `Motion`.
- The canonical prompt input is still the `Fields` type in `types/index.ts`.
- `buildFieldsFromAnswers(...)` keeps legacy aliases populated so prompt inference continues to work while the UI copy stays editorial.

### Generation Flow

- `app/page.tsx` drives three tabs: `input`, `big5`, and `generate`.
- `hooks/useGeneration.ts` owns the runtime phases: `idle -> scanning -> reviewing -> ready -> denoising -> complete`.
- Scan mode generates 10 raw fragments, then `lib/revolver.ts` turns them into bullets with catch/ricochet/spent state.
- The user must catch at least one bullet to fire. Up to 6 bullets are ordered into the revolver chamber.
- Before denoising, the user supplies two extra signals:
  - `whyThese`
  - `rejectedFuture`
- Denoising currently works as:
  - scan fragments
  - structure pass
  - critique pass on the early draft
  - sharpen/refine passes
  - final story pass
  - cleanup pass

### Prompting

- Prompt construction lives in `lib/prompts.ts`.
- `buildStoryConditioning(...)` compresses questionnaire answers, Big Five scores, and post-curation answers into:
  - `hardState`
  - `latentForces`
  - `personalitySignature`
- `generateStepPrompt(...)` takes ordered bullets, optional critique notes, and an optional signature author.
- `generateCleanupPrompt(...)` is the final anti-echo rewrite that removes obvious questionnaire language.
- `parseNoiseFragments(...)` parses the scan response into usable bullet text.

### Providers And Quotas

- The UI provider/model picker is defined in `lib/constants.ts`.
- The current shipped UI presets are OpenRouter and xAI.
- `lib/providers.ts` also contains direct Anthropic and Gemini adapters, even though they are not exposed in the default picker.
- `app/api/generate/route.ts` applies:
  - per-IP throttling through `checkPerIpLimit(...)`
  - global daily quota through `checkAndConsumeDaily(...)`
- `app/api/generate/route.ts` can also record per-phase LLM calls through `recordLlmCall(...)` when a telemetry `sessionId` is present.
- The client caches daily quota headers in `localStorage` using `DAILY_USAGE_STORAGE_PREFIX`.

### Telemetry And Persistence

- Telemetry is optional and should never break the user-facing flow.
- `lib/db.ts` returns `null` when `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are unset.
- `app/api/telemetry/route.ts` records:
  - session start
  - curate completion
  - story completion
  - user rating
- `lib/telemetry.ts` is intentionally best-effort and warns in development rather than surfacing errors to the user.
- `lib/sessionId.ts` stores an anonymous UUID in `localStorage` under `destiny-session-uuid`.
- The local schema lives in `supabase/migrations/`; see `doc/architecture/telemetry-and-persistence.md` for the system note.

## Key Files

- [app/page.tsx](app/page.tsx) — top-level screen flow, settings panel, post-curation answers, and generation wiring
- [app/api/generate/route.ts](app/api/generate/route.ts) — provider proxy, daily quotas, and optional per-phase LLM telemetry logging
- [app/api/telemetry/route.ts](app/api/telemetry/route.ts) — session lifecycle, curate completion, story completion, and rating ingestion
- [components/InputForm.tsx](components/InputForm.tsx) — staged questionnaire UI with chapter headers and route-aware steps
- [components/Big5Form.tsx](components/Big5Form.tsx) — Big Five slider interface
- [components/BulletField.tsx](components/BulletField.tsx) — kinetic bullet stage for the curate phase
- [components/AmmoHUD.tsx](components/AmmoHUD.tsx) — revolver chamber HUD and load state
- [components/FireImpact.tsx](components/FireImpact.tsx) — fire overlay beat after the chamber is ready
- [components/TrajectoryCard.tsx](components/TrajectoryCard.tsx) — rendered story output and step reveal UI
- [components/StoryRating.tsx](components/StoryRating.tsx) — post-story like/dislike feedback control
- [hooks/useGeneration.ts](hooks/useGeneration.ts) — scan/curate/denoise orchestration, daily quota tracking, abort handling
- [lib/questionnaire.ts](lib/questionnaire.ts) — questionnaire schema, routing, normalization, and `Fields` construction
- [lib/prompts.ts](lib/prompts.ts) — conditioning inference, scan/denoise/critique/cleanup prompt builders, noise parsing
- [lib/revolver.ts](lib/revolver.ts) — pure bullet-state helpers and chamber seed building
- [lib/styles.ts](lib/styles.ts) — signature-author selection based on age band and questionnaire affinities
- [lib/providers.ts](lib/providers.ts) — upstream provider adapters normalized to Anthropic-style text content
- [lib/rateLimit.ts](lib/rateLimit.ts) — Upstash-backed rate-limit helpers
- [lib/db.ts](lib/db.ts) — lazy Supabase client bootstrap that no-ops when persistence is unset
- [lib/sessionId.ts](lib/sessionId.ts) — anonymous browser-session UUID storage
- [lib/telemetry.ts](lib/telemetry.ts) — best-effort session and LLM-call persistence helpers
- [lib/constants.ts](lib/constants.ts) — provider presets, API route, quota storage prefix, scan count
- [lib/theme.ts](lib/theme.ts) — shared design tokens and label styles
- [i18n/index.tsx](i18n/index.tsx) — English and Simplified Chinese translations plus language bootstrap
- [doc/architecture/repo-logic-and-prompt-flow.md](doc/architecture/repo-logic-and-prompt-flow.md) — best existing long-form explanation of the current prompt chain
- [doc/architecture/telemetry-and-persistence.md](doc/architecture/telemetry-and-persistence.md) — Supabase schema and telemetry event flow
- [supabase/config.toml](supabase/config.toml) — local Supabase config
- [supabase/migrations/20260420000000_initial_schema.sql](supabase/migrations/20260420000000_initial_schema.sql) — initial persistence schema

## Working Style Notes

- Keep README and CLAUDE aligned; do not let one describe an older runtime than the other.
- If you change the questionnaire schema, prompt flow, provider surface, telemetry flow, or rate limiting, update docs in the same task.
- Preserve the editorial tone of the product. Avoid rewriting docs back into generic "career form" language if the code still uses the more narrative framing.
