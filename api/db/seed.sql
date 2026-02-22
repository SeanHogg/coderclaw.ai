-- Seed script — sample skills for development
-- Run after schema.sql:
--   psql $DATABASE_URL -f seed.sql

-- Demo user (password: "password123")
INSERT INTO users (email, username, display_name, bio, password_hash)
VALUES (
  'demo@coderclaw.ai',
  'coderclaw',
  'CoderClaw Team',
  'Official CoderClaw skills and examples.',
  'pbkdf2:dGVzdHNhbHQ=:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
)
ON CONFLICT (email) DO NOTHING;

-- Sample published skills
WITH author AS (SELECT id FROM users WHERE username = 'coderclaw' LIMIT 1)
INSERT INTO skills (name, slug, description, author_id, category, tags, published)
SELECT name, slug, description, author.id, category, tags, true
FROM author, (VALUES
  ('Discord', 'discord', 'Full Discord integration — servers, channels & DMs via the Discord API.', 'Messaging', ARRAY['discord','chat','notifications']),
  ('Slack', 'slack', 'Slack workspace integration via Bolt. Send messages, manage channels.', 'Messaging', ARRAY['slack','chat','workspace']),
  ('WhatsApp', 'wacli', 'WhatsApp messaging via QR pairing with Baileys.', 'Messaging', ARRAY['whatsapp','chat','baileys']),
  ('Home Assistant', 'homeassistant', 'Control smart home devices via Home Assistant REST API.', 'Home', ARRAY['iot','smart-home','automation']),
  ('Obsidian', 'obsidian', 'Read and write Obsidian vault notes from your agent.', 'Productivity', ARRAY['notes','obsidian','knowledge']),
  ('Spotify Player', 'spotify-player', 'Control Spotify playback: play, pause, skip, search.', 'Media', ARRAY['spotify','music','media']),
  ('Weather', 'weather', 'Real-time weather forecasts and conditions for any location.', 'Utilities', ARRAY['weather','forecast','data']),
  ('Browser Control', 'verify-on-browser', 'Automate Chrome/Chromium for web tasks and scraping.', 'Automation', ARRAY['browser','chrome','automation'])
) AS v(name, slug, description, category, tags)
ON CONFLICT (slug) DO NOTHING;
