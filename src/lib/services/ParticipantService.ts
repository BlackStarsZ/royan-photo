import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Participant, ParticipantWithRank } from '@/types';

export class ParticipantService {
  /**
   * Fetches all participants of a game, sorted by total_points descending.
   * Adds a computed rank field.
   */
  static async getRanking(gameId: string): Promise<ParticipantWithRank[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('game_id', gameId)
      .order('total_points', { ascending: false });

    if (error) throw new Error(error.message);
    if (!data) return [];

    // Assign ranks (handle ties: same rank for same points)
    let rank = 1;
    return data.map((p, i) => {
      if (i > 0 && (data[i - 1]?.total_points ?? 0) > p.total_points) {
        rank = i + 1;
      }
      return { ...p, rank };
    });
  }

  /**
   * Fetches a single participant by ID.
   */
  static async getById(id: string): Promise<Participant | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Fetches all participants for a game.
   */
  static async getByGameId(gameId: string): Promise<Participant[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
