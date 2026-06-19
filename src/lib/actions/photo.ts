'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { PhotoService } from '@/lib/services/PhotoService';
import type { ActionResult, Photo } from '@/types';

/**
 * Uploads a participant's photo for a challenge.
 */
export async function uploadPhotoAction(
  formData: FormData,
): Promise<ActionResult<Photo>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    const file = formData.get('file') as File | null;
    const challengeId = formData.get('challengeId') as string | null;
    const gameCode = formData.get('gameCode') as string | null;

    if (!file || file.size === 0) return { success: false, error: 'Aucun fichier sélectionné.' };
    if (!challengeId) return { success: false, error: 'Identifiant du défi manquant.' };

    // Verify the challenge is active
    const challenge = await ChallengeService.getById(challengeId);
    if (!challenge) return { success: false, error: 'Défi introuvable.' };
    if (challenge.status !== 'active') {
      return { success: false, error: 'Les soumissions sont fermées pour ce défi.' };
    }
    if (challenge.game_id !== session.gameId) {
      return { success: false, error: 'Accès refusé.' };
    }

    const photo = await PhotoService.upload(
      challengeId,
      session.participantId,
      session.gameId,
      file,
    );

    if (gameCode) revalidatePath(`/game/${gameCode}`);
    return { success: true, data: photo };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de l\'upload.' };
  }
}
