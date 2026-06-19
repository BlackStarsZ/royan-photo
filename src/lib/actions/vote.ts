'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { VoteService } from '@/lib/services/VoteService';
import type { ActionResult, Vote } from '@/types';

/**
 * Casts a vote for a photo during the voting phase.
 */
export async function castVoteAction(
  challengeId: string,
  photoId: string,
  gameCode: string,
): Promise<ActionResult<Vote>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    const challenge = await ChallengeService.getById(challengeId);
    if (!challenge) return { success: false, error: 'Défi introuvable.' };
    if (challenge.status !== 'voting') {
      return { success: false, error: 'La phase de vote n\'est pas ouverte.' };
    }
    if (challenge.game_id !== session.gameId) {
      return { success: false, error: 'Accès refusé.' };
    }

    const vote = await VoteService.cast(challengeId, session.participantId, photoId);
    revalidatePath(`/game/${gameCode}/vote`);
    return { success: true, data: vote };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors du vote.' };
  }
}
