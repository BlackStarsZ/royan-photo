import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { detectThemeVariables } from '@/lib/themes/theme-processor';
import type { Theme } from '@/types';

export class ThemeService {
  /**
   * Fetches all themes available for a game (predefined + game-specific).
   */
  static async getForGame(gameId: string): Promise<Theme[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .or(`game_id.is.null,game_id.eq.${gameId}`)
      .order('is_predefined', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Theme[];
  }

  /**
   * Creates a custom theme for a specific game.
   */
  static async createCustom(gameId: string, text: string): Promise<Theme> {
    const admin = createAdminClient();
    const { hasPlayerVar, hasRandomPlayerVar } = detectThemeVariables(text);

    const { data, error } = await admin
      .from('themes')
      .insert({
        game_id: gameId,
        text,
        has_player_var: hasPlayerVar,
        has_random_player_var: hasRandomPlayerVar,
        is_predefined: false,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create theme: ${error?.message}`);
    return data as Theme;
  }

  /**
   * Deletes a custom theme (game-specific only).
   */
  static async deleteCustom(themeId: string, gameId: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from('themes')
      .delete()
      .eq('id', themeId)
      .eq('game_id', gameId)
      .eq('is_predefined', false);

    if (error) throw new Error(error.message);
  }
}
