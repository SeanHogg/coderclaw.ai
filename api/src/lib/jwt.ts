import type { Context, Next } from 'hono'
import type { Env, JwtPayload } from '../types'

/** Minimal JWT verify/sign using Web Crypto (no external library needed). */

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function decodeBase64url(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + ((4 - (s.length % 4)) % 4), '=')
  return new Uint8Array(
    atob(padded)
      .split('')
      .map((c) => c.charCodeAt(0))
  )
}

async function getKey(secret: string, usage: ('sign' | 'verify')[]): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage)
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresInSec = 60 * 60 * 24 * 30): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresInSec }

  const enc = new TextEncoder()
  const headerB64 = base64url(enc.encode(JSON.stringify(header)))
  const payloadB64 = base64url(enc.encode(JSON.stringify(fullPayload)))
  const sigInput = `${headerB64}.${payloadB64}`

  const key = await getKey(secret, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(sigInput))
  return `${sigInput}.${base64url(sig)}`
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, sigB64] = parts
    const enc = new TextEncoder()
    const sigInput = `${headerB64}.${payloadB64}`

    const key = await getKey(secret, ['verify'])
    const sigBytes = decodeBase64url(sigB64)
    const dataBytes = enc.encode(sigInput)
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, dataBytes.buffer as ArrayBuffer)
    if (!valid) return null

    const payload: JwtPayload = JSON.parse(new TextDecoder().decode(decodeBase64url(payloadB64)))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.slice(7)
  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
  c.set('jwtPayload' as never, payload)
  await next()
}
