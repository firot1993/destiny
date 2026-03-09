# Destiny — Life Trajectory Diffusion

A "diffusion model" for life trajectories. Input your current state, set guidance toward the phenomenal, and sample possible extraordinary futures.

Uses iterative LLM refinement to simulate denoising — starting from noise and progressively sharpening into coherent life trajectories.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  GitHub Pages   │ ──── │  CF Worker Proxy  │ ──── │  Anthropic API  │
│  (Vite + React) │      │  (holds API key)  │      │  or OpenRouter  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## Quick Start

### 1. Deploy the Worker (API proxy)

```bash
cd worker
npm install

# Set your API keys as secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENROUTER_API_KEY

# Optional: restrict to your domain
# Edit wrangler.toml → ALLOWED_ORIGINS = "https://yourusername.github.io"

wrangler deploy
```

Note your worker URL: `https://destiny-proxy.yourusername.workers.dev`

### 2. Configure the Frontend

```bash
cd frontend
npm install
```

Edit `vite.config.js`:
```js
base: '/destiny/',  // ← your repo name
```

Optionally set default API URL in `.env`:
```
VITE_API_URL=https://destiny-proxy.yourusername.workers.dev
```

### 3. Deploy Frontend

**Option A: GitHub Actions (automatic)**

Push to `main` branch. The workflow in `.github/workflows/deploy.yml` handles the rest.

Make sure GitHub Pages is enabled:
- Repo Settings → Pages → Source → GitHub Actions

**Option B: Manual**

```bash
cd frontend
npm run build
# Copy dist/ contents to gh-pages branch
```

### 4. Use It

1. Open `https://yourusername.github.io/destiny/`
2. Click ⚙ to set your Worker URL (if not set via env)
3. Choose provider (Anthropic / OpenRouter)
4. Fill in your state → personality → generate

## Features

- **Structured input** — age, location, skills, resources, constraints, obsessions
- **Big Five personality** — shapes HOW trajectories unfold, not just what happens
- **Adjustable denoising steps** (2-8) — more steps = finer refinement
- **Guidance scale** (1-10) — 1 = quiet life, 10 = biography-worthy
- **Multiple samples** — parallel trajectories from the same starting point
- **i18n** — English & Chinese (中文)
- **Dual provider** — Anthropic direct or OpenRouter

## Rate Limiting (Optional)

To enable rate limiting on the worker:

```bash
# Create KV namespace
wrangler kv:namespace create RATE_LIMIT

# Add the returned ID to wrangler.toml
# Uncomment the [[kv_namespaces]] section
```

## Local Development

```bash
# Terminal 1: Worker
cd worker && wrangler dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## Tech Stack

- **Frontend**: Vite + React 18
- **Proxy**: Cloudflare Workers
- **LLM**: Claude Sonnet 4 (via Anthropic or OpenRouter)
- **Hosting**: GitHub Pages + Cloudflare (both free tier)
- **i18n**: Lightweight React Context (no dependencies)
