import { Hono } from 'hono'
import { getDb } from '../db'
import { requireAuth } from '../lib/jwt'
import type { Env, JwtPayload, SkillWithAuthor } from '../types'

export const skillsRoutes = new Hono<{ Bindings: Env }>()

/** GET /skills — list published skills, optional ?category=&q=&page=&limit= */
skillsRoutes.get('/', async (c) => {
  const { category, q, page = '1', limit = '24' } = c.req.query()
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit)
  const sql = getDb(c.env.DATABASE_URL)

  const rows = await sql`
    SELECT
      s.id, s.name, s.slug, s.description, s.category, s.tags, s.version,
      s.icon_url, s.repo_url, s.downloads, s.likes, s.created_at, s.updated_at,
      u.username AS author_username,
      u.display_name AS author_display_name,
      u.avatar_url AS author_avatar_url
    FROM skills s
    JOIN users u ON u.id = s.author_id
    WHERE s.published = true
      AND (${category || null}::text IS NULL OR s.category = ${category || null})
      AND (${q || null}::text IS NULL OR s.search_vector @@ websearch_to_tsquery(${q || null}))
    ORDER BY s.downloads DESC, s.likes DESC
    LIMIT ${Number(limit)} OFFSET ${offset}
  `
  const [{ count }] = await sql`
    SELECT COUNT(*) FROM skills WHERE published = true
      AND (${category || null}::text IS NULL OR category = ${category || null})
  `
  return c.json({ skills: rows as SkillWithAuthor[], total: Number(count), page: Number(page), limit: Number(limit) })
})

/** GET /skills/:slug */
skillsRoutes.get('/:slug', async (c) => {
  const sql = getDb(c.env.DATABASE_URL)
  const rows = await sql`
    SELECT
      s.*, u.username AS author_username, u.display_name AS author_display_name, u.avatar_url AS author_avatar_url
    FROM skills s
    JOIN users u ON u.id = s.author_id
    WHERE s.slug = ${c.req.param('slug')} AND s.published = true
    LIMIT 1
  `
  if (!rows.length) return c.json({ error: 'Skill not found' }, 404)
  // increment download counter async (fire-and-forget)
  const sql2 = getDb(c.env.DATABASE_URL)
  c.executionCtx.waitUntil(
    sql2`UPDATE skills SET downloads = downloads + 1 WHERE slug = ${c.req.param('slug')}`
  )
  return c.json({ skill: rows[0] as SkillWithAuthor })
})

/** POST /skills — create (auth required) */
skillsRoutes.post('/', requireAuth, async (c) => {
  const payload = c.get('jwtPayload' as never) as JwtPayload
  const body = await c.req.json<{
    name: string; slug: string; description: string; category: string
    tags?: string[]; version?: string; readme?: string; icon_url?: string; repo_url?: string
  }>()
  const { name, slug, description, category, tags = [], version = '1.0.0', readme = null, icon_url = null, repo_url = null } = body

  if (!name || !slug || !description || !category) {
    return c.json({ error: 'name, slug, description, and category are required' }, 400)
  }

  const sql = getDb(c.env.DATABASE_URL)
  try {
    const rows = await sql`
      INSERT INTO skills (name, slug, description, author_id, category, tags, version, readme, icon_url, repo_url)
      VALUES (${name}, ${slug}, ${description}, ${payload.sub}, ${category}, ${tags}, ${version}, ${readme}, ${icon_url}, ${repo_url})
      RETURNING *
    `
    return c.json({ skill: rows[0] }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'Slug already taken' }, 409)
    }
    return c.json({ error: 'Failed to create skill' }, 500)
  }
})

/** PUT /skills/:slug — update own skill (auth required) */
skillsRoutes.put('/:slug', requireAuth, async (c) => {
  const payload = c.get('jwtPayload' as never) as JwtPayload
  const sql = getDb(c.env.DATABASE_URL)
  const existing = await sql`SELECT id, author_id FROM skills WHERE slug = ${c.req.param('slug')} LIMIT 1`
  if (!existing.length) return c.json({ error: 'Not found' }, 404)
  if (existing[0].author_id !== payload.sub) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json<Partial<{ name: string; description: string; category: string; tags: string[]; version: string; readme: string; icon_url: string; repo_url: string; published: boolean }>>()
  const rows = await sql`
    UPDATE skills
    SET
      name        = COALESCE(${body.name ?? null}, name),
      description = COALESCE(${body.description ?? null}, description),
      category    = COALESCE(${body.category ?? null}, category),
      tags        = COALESCE(${body.tags ?? null}, tags),
      version     = COALESCE(${body.version ?? null}, version),
      readme      = COALESCE(${body.readme ?? null}, readme),
      icon_url    = COALESCE(${body.icon_url ?? null}, icon_url),
      repo_url    = COALESCE(${body.repo_url ?? null}, repo_url),
      published   = COALESCE(${body.published ?? null}, published),
      updated_at  = NOW()
    WHERE slug = ${c.req.param('slug')}
    RETURNING *
  `
  return c.json({ skill: rows[0] })
})

/** POST /skills/:slug/like (auth required) */
skillsRoutes.post('/:slug/like', requireAuth, async (c) => {
  const payload = c.get('jwtPayload' as never) as JwtPayload
  const sql = getDb(c.env.DATABASE_URL)
  try {
    await sql`
      INSERT INTO skill_likes (user_id, skill_slug) VALUES (${payload.sub}, ${c.req.param('slug')})
    `
    await sql`UPDATE skills SET likes = likes + 1 WHERE slug = ${c.req.param('slug')}`
    return c.json({ liked: true })
  } catch {
    // duplicate = already liked
    await sql`UPDATE skills SET likes = likes - 1 WHERE slug = ${c.req.param('slug')}`
    await sql`DELETE FROM skill_likes WHERE user_id = ${payload.sub} AND skill_slug = ${c.req.param('slug')}`
    return c.json({ liked: false })
  }
})
