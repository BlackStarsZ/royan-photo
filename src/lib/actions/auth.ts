'use server';

import { cookies } from 'next/headers';

import { GameService } from '@/lib/services/GameService';
import type { ActionResult, CreateGamePayload, JoinGamePayload, SessionData } from '@/types';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'royan_photo_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createGameAction(
  payload: CreateGamePayload,
): Promise<ActionResult<{ gameCode: string }>> {
  try {
    const { pseudo, gameName, gameMode, challengeTime } = payload;

    if (!pseudo.trim()) return { success: false, error: 'Le pseudo est requis.' };
    if (!gameName.trim()) return { success: false, error: 'Le nom de la partie est requis.' };
    if (pseudo.length > 50) return { success: false, error: 'Pseudo trop long (max 50 caractères).' };

    const { game, participant } = await GameService.create({
      gameName: gameName.trim(),
      pseudo: pseudo.trim(),
      gameMode,
      challengeTime,
    });

    await setSession({
      participantId: participant.id,
      gameId: game.id,
      gameCode: game.code,
      pseudo: participant.pseudo,
    });

    return { success: true, data: { gameCode: game.code } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}

export async function joinGameAction(
  payload: JoinGamePayload,
): Promise<ActionResult<{ gameCode: string }>> {
  try {
    const { pseudo, code } = payload;

    if (!pseudo.trim()) return { success: false, error: 'Le pseudo est requis.' };
    if (!code.trim()) return { success: false, error: 'Le code de la partie est requis.' };

    const { game, participant } = await GameService.join({
      code: code.trim().toUpperCase(),
      pseudo: pseudo.trim(),
    });

    await setSession({
      participantId: participant.id,
      gameId: game.id,
      gameCode: game.code,
      pseudo: participant.pseudo,
    });

    return { success: true, data: { gameCode: game.code } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSession();
}
