-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: predefined themes
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO themes (text, has_player_var, has_random_player_var, is_predefined, game_id) VALUES
  -- Sans variables
  ('Un coucher de soleil depuis là où vous êtes',           false, false, true, NULL),
  ('Votre plat préféré du moment',                          false, false, true, NULL),
  ('Un détail architectural qui vous plaît',                false, false, true, NULL),
  ('Un moment de détente en vacances',                      false, false, true, NULL),
  ('La vue depuis votre chambre',                           false, false, true, NULL),
  ('Un selfie avec la mer',                                 false, false, true, NULL),
  ('Quelque chose de rouge dans votre environnement',       false, false, true, NULL),
  ('Votre boisson préférée du moment',                      false, false, true, NULL),
  ('Un animal rencontré aujourd''hui',                      false, false, true, NULL),
  ('Votre endroit préféré de la journée',                   false, false, true, NULL),
  ('Une ombre intéressante',                                false, false, true, NULL),
  ('Quelqu''un qui rit',                                    false, false, true, NULL),
  ('Un reflet dans l''eau',                                 false, false, true, NULL),
  ('Le ciel à midi pile',                                   false, false, true, NULL),
  ('Votre plus bel achat de la semaine',                    false, false, true, NULL),

  -- Avec {player}
  ('{player} prend un selfie avec la mer en fond',          true,  false, true, NULL),
  ('{player} mange une glace',                              true,  false, true, NULL),
  ('{player} fait la pose devant un monument',              true,  false, true, NULL),
  ('{player} dort ou fait semblant de dormir',              true,  false, true, NULL),
  ('{player} tient quelque chose de coloré',                true,  false, true, NULL),

  -- Avec {random_player}
  ('Prenez un selfie avec {random_player}',                 false, true,  true, NULL),
  ('Faites rire {random_player} et photographiez-le',       false, true,  true, NULL),
  ('Réalisez une photo en miroir avec {random_player}',     false, true,  true, NULL),
  ('{random_player} et vous en train de trinquer',          false, true,  true, NULL);
