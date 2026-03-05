# coderclaw.ai monorepo

Two independent sites sharing one repo:

- `landing/` — marketing site at coderclaw.ai (Astro static → Cloudflare Workers)
- `docs-site/` — documentation at docs.coderclaw.ai (Astro Starlight → Cloudflare Pages)

Installer CI scripts live in `scripts/`. They test the install scripts hosted at `landing/public/`.

## Deploy

Both sites auto-deploy on push to `main` via GitHub Actions (path-filtered).

Manual deploy:

```bash
# Landing (Cloudflare Workers)
cd landing && npm install && npx astro build && npx wrangler deploy

# Docs (Cloudflare Pages)
cd docs-site && npm install && npx astro build && npx wrangler pages deploy dist
```
