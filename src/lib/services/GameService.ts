import { generateAvatarColor, generateGameCode } from '@/lib/utils/generate-code';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import type { CreateGamePayload, Game, GameWithParticipants, JoinGamePayload, Participant } from '@/types';

export class GameService {
  /**
   * Creates a new game and the host participant in a single transaction.
   * Returns the created game and participant.
   */
  static async create(
    payload: CreateGamePayload,
  ): Promise<{ game: Game; participant: Participant }> {
    const admin = createAdminClient();

    // Generate a unique code
    let code = generateGameCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data } = await admin.from('games').select('id').eq('code', code).maybeSingle();
      if (!data) break;
      code = generateGameCode();
      attempts++;
    }

    // Create the game with host_id null (updated after participant creation)
    const { data: game, error: gameError } = await admin
      .from('games')
      .insert({
        code,
        name: payload.gameName,
        host_id: null,
        game_mode: payload.gameMode,
        challenge_time: payload.challengeTime ?? null,
        start_date: new Date().toISOString().split('T')[0]!,
      })
      .select()
      .single();

    if (gameError || !game) {
      throw new Error(`Failed to create game: ${gameError?.message}`);
    }

    // Create the host participant
    const { data: participant, error: partError } = await admin
      .from('participants')
      .insert({
        game_id: game.id,
        pseudo: payload.pseudo,
        avatar_color: generateAvatarColor(),
        is_host: true,
      })
      .select()
      .single();

    if (partError || !participant) {
      // Rollback game
      await admin.from('games').delete().eq('id', game.id);
      throw new Error(`Failed to create participant: ${partError?.message}`);
    }

    // Update host_id on the game
    const { error: updateError } = await admin
      .from('games')
      .update({ host_id: participant.id })
      .eq('id', game.id);

    if (updateError) {
      throw new Error(`Failed to update host_id: ${updateError.message}`);
    }

    return { game: { ...game, host_id: participant.id }, participant };
  }

  /**
   * Joins an existing game by code.
   * Returns the existing game and the newly created participant.
   */
  static async join(payload: JoinGamePayload): Promise<{ game: Game; participant: Participant }> {
    const admin = createAdminClient();

    const { data: game, error: gameError } = await admin
      .from('games')
      .select('*')
      .eq('code', payload.code.toUpperCase())
      .eq('status', 'active')
      .maybeSingle();

    if (gameError) throw new Error(gameError.message);
    if (!game) throw new Error('Partie introuvable ou terminée.');

    // Check if pseudo is already taken
    const { data: existing } = await admin
      .from('participants')
      .select('id')
      .eq('game_id', game.id)
      .eq('pseudo', payload.pseudo)
      .maybeSingle();

    if (existing) throw new Error('Ce pseudo est déjà pris dans cette partie.');

    const { data: participant, error: partError } = await admin
      .from('participants')
      .insert({
        game_id: game.id,
        pseudo: payload.pseudo,
        avatar_color: generateAvatarColor(),
        is_host: false,
      })
      .select()
      .single();

    if (partError || !participant) {
      throw new Error(`Failed to join game: ${partError?.message}`);
    }

    return { game, participant };
  }

  /**
   * Fetches a game by code with all participants.
   */
  static async getByCode(code: string): Promise<GameWithParticipants | null> {
    const supabase = await createServerSupabaseClient();

    const { data: game, error } = await supabase
      .from('games')
      .select('*, participants!game_id(*)')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!game) return null;

    const { participants, ...gameData } = game as GameWithParticipants & {
      participants: Participant[];
    };

    return { ...gameData, participants: participants ?? [] };
  }

  /**
   * Fetches a game by ID.
   */
  static async getById(id: string): Promise<Game | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('games').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Ends a game.
   */
  static async end(gameId: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from('games')
      .update({ status: 'ended', end_date: new Date().toISOString().split('T')[0]! })
      .eq('id', gameId);
    if (error) throw new Error(error.message);
  }

  /**
   * Fetches a participant by session token.
   */
  static async getParticipantByToken(token: string): Promise<Participant | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_token', token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
}
