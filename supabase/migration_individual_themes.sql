-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : thèmes individuels par joueur
-- À exécuter dans Supabase SQL Editor (nouvel onglet vide)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ajouter la colonne individual_themes sur challenges
ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS individual_themes BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Créer la table participant_themes
CREATE TABLE IF NOT EXISTS participant_themes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  theme_id      UUID REFERENCES themes(id),
  theme_text    TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (challenge_id, participant_id)
);

-- 3. RLS
ALTER TABLE participant_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participant_themes_select"
  ON participant_themes FOR SELECT
  USING (true);

CREATE POLICY "participant_themes_insert"
  ON participant_themes FOR INSERT
  WITH CHECK (true);
