# coderclaw.ai

**CoderClaw** is a self-healing AI engineering agent and orchestration platform that manages tasks, workflows, and collaboration across all AI agents. It provides persistent memory, context-aware reasoning, and self-repair — allowing AI systems to detect failures, fix themselves, and adapt over time — while keeping humans in the loop for governance and approval.

**[CoderClawLink](https://app.coderclaw.ai)** replaces Jira with a centralized orchestration portal offering workflow visibility, auditability, and human-in-the-loop control, making adoption seamless across teams of any size.

Our platform serves:
- **Startups (5–50 developers)** using AI as a virtual workforce
- **Enterprises (100–1,000+ developers)** running complex multi-agent pipelines

It integrates with CI/CD workflows, supports private/self-hosted deployments, and includes **coderClawLLM** — a pay-per-use API layer for AI agent compute. CoderClaw enables teams to build resilient, self-healing software systems while reducing engineering toil and improving delivery outcomes.

---

Monorepo for the CoderClaw web properties.

**Live sites:**

| Site | URL | Source |
|------|-----|--------|
| Landing page | [coderclaw.ai](https://coderclaw.ai) | `landing/` |
| Documentation | [docs.coderclaw.ai](https://docs.coderclaw.ai) | `docs-site/` |

## Structure

```
coderclaw.ai/
├── landing/          # Marketing site (Astro → Cloudflare Workers)
├── docs-site/        # Documentation (Astro Starlight → Cloudflare Pages)
├── scripts/          # Installer CI tests (Docker smoke, matrix, unit)
└── .github/workflows # Deploy + installer CI
```

## Quick Start

### Landing page

```bash
cd landing
bun install
bun run dev        # http://localhost:4321
```

### Docs site

```bash
cd docs-site
npm install
npm run dev        # http://localhost:4321
```

## Deploy

Both sites deploy automatically on push to `main` via GitHub Actions.

Manual deploy (Wrangler):

```bash
# Landing page
cd landing && npx wrangler deploy

# Docs site
cd docs-site && npx wrangler deploy
```

## Install Scripts

The landing page hosts CLI installer scripts at `landing/public/`:

- **macOS/Linux**: `curl -fsSL --proto '=https' --tlsv1.2 https://coderclaw.ai/install.sh | bash`
- **Windows**: `iwr -useb https://coderclaw.ai/install.ps1 | iex`

## Related

- [CoderClaw](https://github.com/SeanHogg/coderClaw) — Core agent runtime
- [CoderClawLink](https://github.com/SeanHogg/coderClawLink) — Project management & mesh orchestrator
