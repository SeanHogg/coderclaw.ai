# coderclaw.ai monorepo

Two independent sites sharing one repo:

- `landing/` — marketing site at coderclaw.ai (Astro static → Cloudflare Workers)
- `docs-site/` — documentation at docs.coderclaw.ai (Astro Starlight → Cloudflare Pages)

Installer CI scripts live in `scripts/`. They test the install scripts hosted at `landing/public/`.

## Deploy

```bash
# Landing
cd landing && npx wrangler deploy

# Docs
cd docs-site && npx wrangler deploy
```

Both auto-deploy on push to main via `.github/workflows/`.
