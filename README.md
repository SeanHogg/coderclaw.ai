# coderclaw.ai

Landing page for CoderClaw — the ultimate coding agent framework.

**Live**: [coderclaw.ai](https://coderclaw.ai)

CoderClaw is the independent agent and subagent manager. [CoderClawLink](https://app.coderclaw.ai) is the project management and mesh orchestrator, enabling teams to transition from coding to managing business outcomes. Documentation is available at [docs.coderclaw.ai](https://docs.coderclaw.ai).

## Pages

- `/` — Main landing page with Quick Start, features, and testimonials
- `/integrations` — Visual grid of all supported chat providers, AI models, platforms, and tools
- `/shoutouts` — Community testimonials and mentions

## Tech Stack

- [Astro](https://astro.build/) — Static site generator
- Cloudflare Pages — Hosting
- Custom CSS — No framework, just vibes

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
bun run preview
```

## Deploy

Automatically deployed to Cloudflare Pages on push to `main`.

## Install Scripts

The landing page hosts installer scripts:

- **macOS/Linux**: `curl -fsSL --proto '=https' --tlsv1.2 https://coderclaw.ai/install.sh | bash`
- **macOS/Linux (CLI only, no onboarding)**: `curl -fsSL --proto '=https' --tlsv1.2 https://coderclaw.ai/install-cli.sh | bash`
- **Windows**: `iwr -useb https://coderclaw.ai/install.ps1 | iex`

Installer UI controls (macOS/Linux `install.sh`):
- Pass `--gum` to force gum UI when supported, or `--no-gum` to disable gum output.
- Set `CODERCLAW_USE_GUM=auto|1|0` to control gum behavior in automation.

These scripts:
1. Install Homebrew (macOS) or detect package managers (Windows)
2. Install Node.js 22+ if needed
3. Install coderclaw globally via npm
4. Run `coderclaw doctor --non-interactive` for migrations (upgrades only)
5. Prompt to run `coderclaw onboard` (new installs)

## Related

- [CoderClaw](https://github.com/SeanHogg/coderclaw.ai) — Main repository
- [Docs](https://docs.coderclaw.ai) — Documentation
