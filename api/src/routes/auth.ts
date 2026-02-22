import { Hono } from 'hono'
import { getDb } from '../db'
import { signJwt } from '../lib/jwt'
import { requireAuth } from '../lib/jwt'
import type { Env, User } from '../types'

export const authRoutes = new Hono<{ Bindings: Env }>()

/** POST /auth/register */
authRoutes.post('/register', async (c) => {
  const { email, username, password } = await c.req.json<{ email: string; username: string; password: string }>()

  if (!email || !username || !password) {
    return c.json({ error: 'email, username, and password are required' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }

  const sql = getDb(c.env.DATABASE_URL)

  // Hash password with PBKDF2 via Web Crypto
  const enc = new TextEncoder()
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  const salt = btoa(String.fromCharCode(...saltBytes))
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hashBuf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const passwordHash = `pbkdf2:${salt}:${btoa(String.fromCharCode(...new Uint8Array(hashBuf)))}`

  try {
    const rows = await sql`
      INSERT INTO users (email, username, password_hash)
      VALUES (${email.toLowerCase()}, ${username}, ${passwordHash})
      RETURNING id, email, username, display_name, avatar_url, bio, created_at, updated_at
    `
    const user = rows[0] as User
    const token = await signJwt({ sub: user.id, email: user.email, username: user.username }, c.env.JWT_SECRET)
    return c.json({ user, token }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'Email or username already taken' }, 409)
    }
    console.error(err)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

/** POST /auth/login */
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()
  if (!email || !password) return c.json({ error: 'email and password are required' }, 400)

  const sql = getDb(c.env.DATABASE_URL)
  const rows = await sql`
    SELECT id, email, username, display_name, avatar_url, bio, password_hash, created_at, updated_at
    FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
  `
  if (!rows.length) return c.json({ error: 'Invalid credentials' }, 401)

  const row = rows[0] as User & { password_hash: string }
  const [, salt, storedHash] = row.password_hash.split(':')

  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hashBuf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const computed = btoa(String.fromCharCode(...new Uint8Array(hashBuf)))
  if (computed !== storedHash) return c.json({ error: 'Invalid credentials' }, 401)

  const { password_hash: _, ...user } = row
  const token = await signJwt({ sub: user.id, email: user.email, username: user.username }, c.env.JWT_SECRET)
  return c.json({ user, token })
})

/** GET /auth/me */
authRoutes.get('/me', requireAuth, async (c) => {
  const payload = c.get('jwtPayload' as never) as { sub: string }
  const sql = getDb(c.env.DATABASE_URL)
  const rows = await sql`
    SELECT id, email, username, display_name, avatar_url, bio, created_at, updated_at
    FROM users WHERE id = ${payload.sub} LIMIT 1
  `
  if (!rows.length) return c.json({ error: 'User not found' }, 404)
  return c.json({ user: rows[0] })
})

/** POST /auth/logout  — stateless JWT; client simply drops the token */
authRoutes.post('/logout', (c) => c.json({ message: 'Logged out' }))
