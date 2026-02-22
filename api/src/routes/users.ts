import { Hono } from 'hono'
import { getDb } from '../db'
import { requireAuth } from '../lib/jwt'
import type { Env, JwtPayload } from '../types'

export const usersRoutes = new Hono<{ Bindings: Env }>()

/** GET /users/:username — public profile */
usersRoutes.get('/:username', async (c) => {
  const sql = getDb(c.env.DATABASE_URL)
  const rows = await sql`
    SELECT id, username, display_name, avatar_url, bio, created_at
    FROM users WHERE username = ${c.req.param('username')} LIMIT 1
  `
  if (!rows.length) return c.json({ error: 'User not found' }, 404)

  const user = rows[0]
  const skills = await sql`
    SELECT id, name, slug, description, category, tags, downloads, likes, created_at
    FROM skills WHERE author_id = ${user.id} AND published = true
    ORDER BY downloads DESC
  `
  return c.json({ user, skills })
})

/** PUT /users/me — update own profile (auth required) */
usersRoutes.put('/me', requireAuth, async (c) => {
  const payload = c.get('jwtPayload' as never) as JwtPayload
  const body = await c.req.json<Partial<{ display_name: string; bio: string; avatar_url: string }>>()
  const sql = getDb(c.env.DATABASE_URL)

  const rows = await sql`
    UPDATE users
    SET
      display_name = COALESCE(${body.display_name ?? null}, display_name),
      bio          = COALESCE(${body.bio ?? null}, bio),
      avatar_url   = COALESCE(${body.avatar_url ?? null}, avatar_url),
      updated_at   = NOW()
    WHERE id = ${payload.sub}
    RETURNING id, email, username, display_name, avatar_url, bio, created_at, updated_at
  `
  return c.json({ user: rows[0] })
})
