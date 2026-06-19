-- ─────────────────────────────────────────────────────────────────────────────
-- RoyanPhoto — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS games (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(6)  UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  host_id       UUID        NOT NULL,  -- references participants.id (set after creation)
  game_mode     VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (game_mode IN ('daily', 'surprise')),
  challenge_time TIME,                 -- only for 'daily' mode (e.g., '12:00:00')
  start_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
  end_date      DATE,
  status        VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id       UUID        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  pseudo        VARCHAR(50) NOT NULL,
  avatar_color  VARCHAR(7)  NOT NULL DEFAULT '#f59e0b',
  is_host       BOOLEAN     NOT NULL DEFAULT FALSE,
  session_token UUID        NOT NULL DEFAULT gen_random_uuid(),
  total_points  INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, pseudo)
);

-- Add FK from games → participants (deferred to avoid circular dependency)
ALTER TABLE games
  ADD CONSTRAINT fk_games_host
  FOREIGN KEY (host_id) REFERENCES participants(id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS themes (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id               UUID        REFERENCES games(id) ON DELETE CASCADE,
  text                  VARCHAR(500) NOT NULL,
  has_player_var        BOOLEAN     NOT NULL DEFAULT FALSE,
  has_random_player_var BOOLEAN     NOT NULL DEFAULT FALSE,
  is_predefined         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  theme_id        UUID        NOT NULL REFERENCES themes(id),
  theme_text      VARCHAR(500) NOT NULL,
  day_number      INTEGER     NOT NULL,
  challenge_date  DATE        NOT NULL,
  scheduled_time  TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'active', 'voting', 'completed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, challenge_date)
);

CREATE TABLE IF NOT EXISTS photos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID        NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  participant_id  UUID        NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  storage_path    VARCHAR(500) NOT NULL,
  public_url      TEXT,
  votes_count     INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, participant_id)
);

CREATE TABLE IF NOT EXISTS votes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID        NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  voter_id      UUID        NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  photo_id      UUID        NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, voter_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_participants_game_id       ON participants(game_id);
CREATE INDEX idx_participants_session_token ON participants(session_token);
CREATE INDEX idx_challenges_game_id         ON challenges(game_id);
CREATE INDEX idx_challenges_status          ON challenges(status);
CREATE INDEX idx_photos_challenge_id        ON photos(challenge_id);
CREATE INDEX idx_photos_participant_id      ON photos(participant_id);
CREATE INDEX idx_votes_challenge_id         ON votes(challenge_id);
CREATE INDEX idx_votes_voter_id             ON votes(voter_id);
CREATE INDEX idx_themes_game_id             ON themes(game_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- We use service role for all writes (server actions) and anon for reads.
-- RLS is intentionally permissive for public game data — adjust as needed.

ALTER TABLE games        ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges   ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes        ENABLE ROW LEVEL SECURITY;

-- Allow all reads via anon key (game data is not sensitive)
CREATE POLICY "games_select_all"        ON games        FOR SELECT USING (true);
CREATE POLICY "participants_select_all" ON participants  FOR SELECT USING (true);
CREATE POLICY "themes_select_all"       ON themes        FOR SELECT USING (true);
CREATE POLICY "challenges_select_all"   ON challenges    FOR SELECT USING (true);
CREATE POLICY "photos_select_all"       ON photos        FOR SELECT USING (true);
CREATE POLICY "votes_select_all"        ON votes         FOR SELECT USING (true);

-- All writes go through server actions (service role bypasses RLS)
-- No explicit INSERT/UPDATE/DELETE policies needed for anon.

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this in the Supabase dashboard or via the CLI after migration:
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('photos', 'photos', true);
--
--   CREATE POLICY "photos_public_read"
--     ON storage.objects FOR SELECT USING (bucket_id = 'photos');
--
--   CREATE POLICY "photos_service_insert"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'photos');
