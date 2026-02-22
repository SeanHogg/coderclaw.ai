-- CoderClaw Skills API — Neon Postgres schema
-- Run once against your Neon database:
--   psql $DATABASE_URL -f schema.sql

-- ────────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy search

-- ────────────────────────────────────────────
-- Users
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  username      TEXT        NOT NULL UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx    ON users (email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users (username);

-- ────────────────────────────────────────────
-- Skills
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  slug           TEXT        NOT NULL UNIQUE,
  description    TEXT        NOT NULL,
  author_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category       TEXT        NOT NULL,
  tags           TEXT[]      NOT NULL DEFAULT '{}',
  version        TEXT        NOT NULL DEFAULT '1.0.0',
  readme         TEXT,
  icon_url       TEXT,
  repo_url       TEXT,
  downloads      BIGINT      NOT NULL DEFAULT 0,
  likes          BIGINT      NOT NULL DEFAULT 0,
  published      BOOLEAN     NOT NULL DEFAULT false,
  search_vector  TSVECTOR,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS skills_slug_idx      ON skills (slug);
CREATE INDEX IF NOT EXISTS skills_author_idx    ON skills (author_id);
CREATE INDEX IF NOT EXISTS skills_category_idx  ON skills (category);
CREATE INDEX IF NOT EXISTS skills_search_idx    ON skills USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS skills_tags_idx      ON skills USING GIN(tags);

-- Auto-update search_vector from name + description + tags
CREATE OR REPLACE FUNCTION skills_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skills_tsvector_trigger ON skills;
CREATE TRIGGER skills_tsvector_trigger
  BEFORE INSERT OR UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION skills_search_vector_update();

-- ────────────────────────────────────────────
-- Skill likes (unique per user per skill)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_likes (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_slug TEXT NOT NULL REFERENCES skills(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_slug)
);

-- ────────────────────────────────────────────
-- Auto updated_at trigger (reusable)
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at  ON users;
CREATE TRIGGER users_updated_at  BEFORE UPDATE ON users  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS skills_updated_at ON skills;
CREATE TRIGGER skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION set_updated_at();
