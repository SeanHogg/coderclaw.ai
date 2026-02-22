# coderclaw.ai

Website and API for CoderClaw — the ultimate coding agent framework.

**Live**: [coderclaw.ai](https://coderclaw.ai)

CoderClaw is the independent agent and subagent manager. [CoderClawLink](https://app.coderclaw.ai) is the project management and mesh orchestrator, enabling teams to transition from coding to managing business outcomes. Documentation is available at [docs.coderclaw.ai](https://docs.coderclaw.ai).

## Architecture

| Layer | Tech | Host |
|-------|------|------|
| **Web** (`/`) | Astro (static) | Cloudflare Pages |
| **API** (`api/`) | Hono on Cloudflare Workers | Cloudflare Workers (free tier) |
| **Database** | Postgres | Neon serverless (free tier) |

## Pages

- `/` — Main landing page with Quick Start, features, and testimonials
- `/integrations` — Visual grid of all supported chat providers, AI models, platforms, and tools
- `/skills` — Community skills directory (browse, search, publish)
- `/shoutouts` — Community testimonials and mentions
- `/coderclawlink` — Web app for account management and skill creation (served by the same worker; CNAME `app.coderclaw.ai` is routed to this worker and mirrors the path)

## API Endpoints

Base URL: `https://api.coderclaw.ai`

The skills directory page (`/skills`) fetches data via a local proxy (`/api/skills`), which in turn calls the registry URL (default `https://api.coderclaw.ai`).
Override the upstream endpoint with `SKILLS_REGISTRY_URL` when deploying a different backend (e.g. your own OpenClaw instance).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Get JWT token |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/skills` | — | List skills (`?q=&category=&page=&limit=`) |
| GET | `/skills/:slug` | — | Skill detail |
| POST | `/skills` | ✓ | Publish a skill |
| PUT | `/skills/:slug` | ✓ | Update own skill |
| POST | `/skills/:slug/like` | ✓ | Toggle like |
| GET | `/users/:username` | — | Public profile + skills |
| PUT | `/users/me` | ✓ | Update profile |

## Tech Stack

- [Astro](https://astro.build/) — Static site generator
- [Hono](https://hono.dev/) — Lightweight API framework for Cloudflare Workers
- [Neon](https://neon.tech) — Serverless Postgres (project: `empty-smoke-28326171`)
- Cloudflare Pages + Workers — Hosting (both free tier)
- Custom CSS — No framework, just vibes

## Web Development

```bash
bun install
bun run dev        # http://localhost:4321
bun run build
bun run preview
```

## API Development

```bash
cd api
bun install

# 1. Copy .dev.vars.example → .dev.vars and fill in secrets (gitignored)
cp .dev.vars.example .dev.vars

# Option A: use Neon Local Connect VS Code extension → start proxy → DATABASE_URL=postgresql://neondb_owner@localhost:5432/neondb
# Option B: paste the full Neon connection string from the Neon dashboard

bun run dev        # wrangler dev → http://localhost:8787
```

### Apply / reset schema

```bash
# Schema is already applied to Neon. To reapply from scratch:
psql $DATABASE_URL -f api/db/schema.sql
psql $DATABASE_URL -f api/db/seed.sql
```

### Production secrets (Cloudflare Workers)

```bash
cd api
wrangler secret put DATABASE_URL   # paste Neon connection string
wrangler secret put JWT_SECRET     # paste a long random secret
wrangler deploy
```

## Deploy

- **Web**: automatically deployed to Cloudflare Pages on push to `main`.
- **API**: `cd api && wrangler deploy` (or CI via GitHub Actions).

## Security

- Secrets are **never** stored in source control.
- `.dev.vars` is gitignored; only `.dev.vars.example` (with dummy values) is committed.
- Wrangler production secrets are stored encrypted in Cloudflare — never in `wrangler.toml`.
- Passwords hashed with PBKDF2-SHA256 (100k iterations) via Web Crypto API.
- JWT signed with HMAC-SHA256; tokens expire in 30 days.

## Install Scripts

The landing page hosts installer scripts:

- **macOS/Linux**: `curl -fsSL --proto '=https' --tlsv1.2 https://coderclaw.ai/install.sh | bash`
- **Windows**: `iwr -useb https://coderclaw.ai/install.ps1 | iex`

## Related

- [CoderClaw](https://github.com/SeanHogg/coderclaw.ai) — Main repository
- [Docs](https://docs.coderclaw.ai) — Documentation
