-- Happy Adoptions AI — initial schema
-- Apply with: psql $DATABASE_URL -f src/db/migrations/001_init.sql

-- Auth tables
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS magic_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);

-- Adopter profiles (quiz answers saved per user)
CREATE TABLE IF NOT EXISTS adopter_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Independent dog listings (no shelter required)
CREATE TABLE IF NOT EXISTS dog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  breed         TEXT,
  sex           TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  age_months    INTEGER,
  weight        NUMERIC(5,2),
  color         TEXT,
  temperament   JSONB NOT NULL DEFAULT '{}',
  description   TEXT,
  location      TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  photos        JSONB NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'on_hold', 'removed')),
  special_needs BOOLEAN DEFAULT false,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dog_posts_status ON dog_posts(status);

-- Linked shelter-ai shelters (read-only dog data fetched from shelter-ai)
CREATE TABLE IF NOT EXISTS linked_shelters (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  city      TEXT,
  country   TEXT,
  website   TEXT,
  logo_url  TEXT,
  dog_count INTEGER DEFAULT 0,
  active    BOOLEAN DEFAULT true,
  api_key   TEXT,  -- for authenticating cross-app requests
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cached dog data from shelter-ai (refreshed periodically)
CREATE TABLE IF NOT EXISTS shelter_dogs_cache (
  id          UUID PRIMARY KEY,  -- same ID as in shelter-ai
  shelter_id  UUID REFERENCES linked_shelters(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  breed       TEXT,
  sex         TEXT,
  age_months  INTEGER,
  weight      NUMERIC(5,2),
  color       TEXT,
  temperament JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'available',
  photos      JSONB NOT NULL DEFAULT '[]',
  special_needs BOOLEAN DEFAULT false,
  synced_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shelter_dogs_shelter ON shelter_dogs_cache(shelter_id, status);

-- AI match sessions
CREATE TABLE IF NOT EXISTS match_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  shelter_id UUID REFERENCES linked_shelters(id) ON DELETE SET NULL,
  profile    JSONB NOT NULL,
  result     JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dog_post_id    UUID REFERENCES dog_posts(id) ON DELETE CASCADE,
  shelter_dog_id UUID,  -- references shelter_dogs_cache
  shelter_id     UUID REFERENCES linked_shelters(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, dog_post_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
