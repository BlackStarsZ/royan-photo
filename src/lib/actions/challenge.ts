'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { GameService } from '@/lib/services/GameService';
import { ParticipantService } from '@/lib/services/ParticipantService';
import { VoteService } from '@/lib/services/VoteService';
import type { ActionResult, Challenge } from '@/types';

/**
 * Generates the next daily challenge.
 * Host-only action.
 */
export async function generateChallengeAction(
  gameId: string,
  modeOverride?: 'daily' | 'surprise',
  individualThemes = false,
): Promise<ActionResult<Challenge>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };
    if (session.gameId !== gameId) return { success: false, error: 'Accès refusé.' };

    const game = await GameService.getById(gameId);
    if (!game) return { success: false, error: 'Partie introuvable.' };

    const participant = await ParticipantService.getById(session.participantId);
    if (!participant?.is_host) return { success: false, error: 'Seul l\'hôte peut générer un défi.' };

    const participants = await ParticipantService.getByGameId(gameId);
    const effectiveMode = modeOverride ?? game.game_mode;
    const challenge = await ChallengeService.generateNext(
      gameId,
      participants,
      effectiveMode,
      effectiveMode === 'daily' ? game.challenge_time : null,
      individualThemes,
    );

    revalidatePath(`/game/${game.code}`);
    return { success: true, data: challenge };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}

/**
 * Opens voting phase for a challenge.
 * Host-only action.
 */
export async function openVotingAction(
  challengeId: string,
  gameCode: string,
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    const participant = await ParticipantService.getById(session.participantId);
    if (!participant?.is_host) return { success: false, error: 'Seul l\'hôte peut ouvrir les votes.' };

    await ChallengeService.updateStatus(challengeId, 'voting');
    revalidatePath(`/game/${gameCode}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}

/**
 * Closes voting and tallies points.
 * Host-only action.
 */
export async function closeVotingAction(
  challengeId: string,
  gameCode: string,
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    const participant = await ParticipantService.getById(session.participantId);
    if (!participant?.is_host) return { success: false, error: 'Seul l\'hôte peut clôturer les votes.' };

    await VoteService.tallyAndAwardPoints(challengeId);
    await ChallengeService.updateStatus(challengeId, 'completed');
    revalidatePath(`/game/${gameCode}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}
