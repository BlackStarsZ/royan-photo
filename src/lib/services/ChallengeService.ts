import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { buildScheduledTime, randomTime, todayISO } from '@/lib/utils/date';
import { pickUnusedTheme, resolveThemeText } from '@/lib/themes/theme-processor';
import type { Challenge, ChallengeWithPhotos, Participant, ParticipantTheme, Theme } from '@/types';

export class ChallengeService {
  /**
   * Generates the next challenge for a game.
   * When individualThemes=true, picks a different theme per participant.
   */
  static async generateNext(
    gameId: string,
    participants: Participant[],
    gameMode: 'daily' | 'surprise',
    challengeTime?: string | null,
    individualThemes = false,
  ): Promise<Challenge> {
    const admin = createAdminClient();

    // Get already-used theme IDs for this game (challenges + individual assignments)
    const { data: existingChallenges } = await admin
      .from('challenges')
      .select('theme_id, id')
      .eq('game_id', gameId);

    const existingIds = existingChallenges ?? [];
    const usedIds = new Set(existingIds.map((c) => c.theme_id).filter(Boolean) as string[]);

    // Also collect theme IDs used in individual assignments
    if (existingIds.length > 0) {
      const { data: ptData } = await admin
        .from('participant_themes')
        .select('theme_id')
        .in('challenge_id', existingIds.map((c) => c.id));
      (ptData ?? []).forEach((pt) => { if (pt.theme_id) usedIds.add(pt.theme_id); });
    }

    // Get available themes (predefined + game-specific)
    const { data: themes, error: themeError } = await admin
      .from('themes')
      .select('*')
      .or(`game_id.is.null,game_id.eq.${gameId}`);

    if (themeError) throw new Error(themeError.message);
    if (!themes || themes.length === 0) throw new Error('No themes available.');

    const dayNumber = existingIds.length + 1;

    // Compute scheduled time
    const timeStr =
      gameMode === 'daily' && challengeTime ? challengeTime.slice(0, 5) : randomTime();
    const today = todayISO();
    const scheduled = buildScheduledTime(today, timeStr);

    if (individualThemes && participants.length > 0) {
      // ── Individual mode: pick a different theme per participant ──────────────
      const usedInThisChallenge = new Set<string>(usedIds);
      // Also track theme *texts* used in this round to avoid duplicate wording
      // (handles cases where the DB has duplicate theme rows with the same text)
      const usedTextsThisChallenge = new Set<string>();

      const assignments: Array<{
        participantId: string;
        theme: Theme;
        themeText: string;
      }> = [];

      for (const participant of participants) {
        // Resolve {player} as this participant, {random_player} as someone else
        const others = participants.filter((p) => p.id !== participant.id);

        // Pick a theme with a unique ID *and* unique base text for this round
        const allThemes = themes as Theme[];
        const byText = allThemes.filter(
          (t) => !usedInThisChallenge.has(t.id) && !usedTextsThisChallenge.has(t.text),
        );
        const byId = allThemes.filter((t) => !usedInThisChallenge.has(t.id));
        const pool = byText.length > 0 ? byText : byId;

        const picked = pool.length > 0
          ? pool[Math.floor(Math.random() * pool.length)]!
          : (allThemes[0] as Theme);

        const theme: Theme = picked;
        usedInThisChallenge.add(theme.id);
        usedTextsThisChallenge.add(theme.text);

        let text = theme.text;
        if (theme.has_player_var) {
          text = text.replace(/\{player\}/g, participant.pseudo);
        }
        if (theme.has_random_player_var) {
          const pool = others.length > 0 ? others : participants;
          const idx = Math.floor(Math.random() * pool.length);
          const rnd = pool[idx] ?? participant;
          text = text.replace(/\{random_player\}/g, rnd.pseudo);
        }

        assignments.push({ participantId: participant.id, theme, themeText: text });
      }

      // Insert challenge with generic label
      const firstTheme = assignments[0]?.theme ?? (themes[0] as Theme);
      const { data: challenge, error } = await admin
        .from('challenges')
        .insert({
          game_id: gameId,
          theme_id: firstTheme.id,
          theme_text: 'Thèmes individuels 🎲',
          individual_themes: true,
          day_number: dayNumber,
          challenge_date: today,
          scheduled_time: scheduled,
          status: 'active',
        })
        .select()
        .single();

      if (error || !challenge) throw new Error(`Failed to create challenge: ${error?.message}`);

      // Insert one participant_theme per player
      const { error: ptError } = await admin.from('participant_themes').insert(
        assignments.map((a) => ({
          challenge_id: challenge.id,
          participant_id: a.participantId,
          theme_id: a.theme.id,
          theme_text: a.themeText,
        })),
      );
      if (ptError) throw new Error(`Failed to assign individual themes: ${ptError.message}`);

      return challenge as Challenge;
    }

    // ── Standard mode: one shared theme ─────────────────────────────────────
    const theme = pickUnusedTheme(themes as Theme[], usedIds) ?? (themes[0] as Theme);
    const themeText = resolveThemeText(theme, participants);

    const { data: challenge, error } = await admin
      .from('challenges')
      .insert({
        game_id: gameId,
        theme_id: theme.id,
        theme_text: themeText,
        individual_themes: false,
        day_number: dayNumber,
        challenge_date: today,
        scheduled_time: scheduled,
        status: 'active',
      })
      .select()
      .single();

    if (error || !challenge) throw new Error(`Failed to create challenge: ${error?.message}`);
    return challenge as Challenge;
  }

  /**
   * Returns the individual theme assigned to a participant for a given challenge.
   * Returns null if the challenge is not in individual mode or no assignment exists.
   */
  static async getParticipantTheme(
    challengeId: string,
    participantId: string,
  ): Promise<ParticipantTheme | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('participant_themes')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('participant_id', participantId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ParticipantTheme | null;
  }

  /**
   * Returns all individual theme assignments for a challenge (for the results page).
   */
  static async getAllParticipantThemes(challengeId: string): Promise<ParticipantTheme[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('participant_themes')
      .select('*')
      .eq('challenge_id', challengeId);
    if (error) throw new Error(error.message);
    return (data ?? []) as ParticipantTheme[];
  }

  /**
   * Fetches the current challenge for a game (most recent, any status).
   */
  static async getCurrentChallenge(gameId: string): Promise<ChallengeWithPhotos | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('challenges')
      .select('*, photos(*, participant:participants(id, pseudo, avatar_color))')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as ChallengeWithPhotos | null;
  }

  /** @deprecated Use getCurrentChallenge instead. */
  static async getTodayChallenge(gameId: string): Promise<ChallengeWithPhotos | null> {
    return ChallengeService.getCurrentChallenge(gameId);
  }

  /**
   * Fetches all challenges for a game ordered by day (history).
   */
  static async getHistory(gameId: string): Promise<Challenge[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('game_id', gameId)
      .order('day_number', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  /**
   * Transitions a challenge status.
   */
  static async updateStatus(
    challengeId: string,
    status: Challenge['status'],
  ): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from('challenges')
      .update({ status })
      .eq('id', challengeId);
    if (error) throw new Error(error.message);
  }

  /**
   * Fetches a single challenge by ID with photos.
   */
  static async getById(challengeId: string): Promise<ChallengeWithPhotos | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('challenges')
      .select('*, photos(*, participant:participants(id, pseudo, avatar_color))')
      .eq('id', challengeId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as ChallengeWithPhotos | null;
  }
}
