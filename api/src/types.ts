export interface Env {
  DATABASE_URL: string
  JWT_SECRET: string
  ENVIRONMENT: string
}

export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  slug: string
  description: string
  author_id: string
  category: string
  tags: string[]
  version: string
  readme: string | null
  icon_url: string | null
  repo_url: string | null
  downloads: number
  likes: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface SkillWithAuthor extends Skill {
  author_username: string
  author_display_name: string | null
  author_avatar_url: string | null
}

export interface JwtPayload {
  sub: string   // user id
  email: string
  username: string
  iat: number
  exp: number
}
