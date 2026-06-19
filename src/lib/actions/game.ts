'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/actions/auth';
import { GameService } from '@/lib/services/GameService';
import { ParticipantService } from '@/lib/services/ParticipantService';
import { ThemeService } from '@/lib/services/ThemeService';
import type { ActionResult, Theme } from '@/types';

/**
 * Ends the current game.
 * Host-only action.
 */
export async function endGameAction(gameCode: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    const participant = await ParticipantService.getById(session.participantId);
    if (!participant?.is_host) return { success: false, error: 'Seul l\'hôte peut terminer la partie.' };

    await GameService.end(session.gameId);
    revalidatePath(`/game/${gameCode}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}

/**
 * Adds a custom theme to the game.
 * Host-only action.
 */
export async function addCustomThemeAction(
  text: string,
): Promise<ActionResult<Theme>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    if (!text.trim()) return { success: false, error: 'Le texte du thème est requis.' };
    if (text.length > 500) return { success: false, error: 'Thème trop long (max 500 caractères).' };

    const participant = await ParticipantService.getById(session.participantId);
    if (!participant?.is_host) return { success: false, error: 'Seul l\'hôte peut ajouter des thèmes.' };

    const theme = await ThemeService.createCustom(session.gameId, text.trim());
    return { success: true, data: theme };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}
