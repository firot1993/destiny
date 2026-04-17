# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For the project overview, repo structure, setup commands, environment variables, data flow, and rate limiting details, see [README.md](README.md). Treat the README as the source of truth for the current stack — update it when any of that changes.

## Documentation

Write docs into the `doc/` folder when the work warrants durable context. Match the content to the subfolder:

- **`doc/plan/`** — Implementation plans for multi-step tasks before coding starts. One file per plan (e.g. `YYYY-MM-DD-feature-name.md`). Include goals, approach, steps, and open questions.
- **`doc/architecture/`** — System design notes: data flow, module boundaries, provider integration, prompt pipeline decisions. Update existing files when architecture changes rather than creating new ones for the same topic.
- **`doc/worklog/`** — Dated session logs of what was done and why (e.g. `YYYY-MM-DD.md`). Capture non-obvious decisions, dead ends, and context that would be lost otherwise. Append to the day's file if one exists.

When to write:
- Before a non-trivial implementation → drop a plan in `doc/plan/`.
- After finishing meaningful work → append to `doc/worklog/`.
- When introducing or changing a subsystem → update `doc/architecture/`.

Skip docs for trivial edits, typo fixes, or one-line changes. Prefer updating an existing doc over creating a new one on the same topic.

## Implementation Notes

Details below are intentionally not duplicated in the README — they're Claude-facing pointers for navigating the code.

### Generation Pipeline Parsing

- Scan output is parsed via `^\s*\d+\s*::\s*(.+)$` with a fallback regex.
- Step 0 of denoising is the raw fragments; final step produces the 8–12 sentence narrative.
- Each denoising step feeds the previous output as context, with Big Five scores and guidance scale in every prompt.

### Key Files

- [app/page.tsx](app/page.tsx) — UI state machine (`idle → scanning → reviewing → ready → denoising`), daily quota tracking via localStorage.
- [hooks/useGeneration.ts](hooks/useGeneration.ts) — Generation pipeline: prompt construction, fragment parsing, parallel trajectory generation.
- [lib/prompts.ts](lib/prompts.ts) — Prompt templates for each pipeline phase.
- [lib/providers.ts](lib/providers.ts) — Multi-provider LLM client (Anthropic, OpenRouter, xAI, Gemini); normalizes responses to Anthropic format.
- [lib/rateLimit.ts](lib/rateLimit.ts) — Upstash Redis-backed per-IP and global daily rate limiting.
- [i18n/index.tsx](i18n/index.tsx) — i18n Context Provider; prompts respond in the selected language.
