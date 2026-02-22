import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { skillsRoutes } from './routes/skills'
import { usersRoutes } from './routes/users'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['https://coderclaw.ai', 'http://localhost:4321'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

// Routes
app.route('/auth', authRoutes)
app.route('/skills', skillsRoutes)
app.route('/users', usersRoutes)

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
