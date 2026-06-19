import type { Participant, Theme } from '@/types';

/**
 * Resolves dynamic variables in a theme text.
 *
 * Variables:
 *  - {player}        → replaced with a random participant's pseudo
 *  - {random_player} → replaced with a different random participant's pseudo
 */
export function resolveThemeText(theme: Theme, participants: Participant[]): string {
  if (participants.length === 0) return theme.text;

  let text = theme.text;

  if (theme.has_player_var) {
    const player = pickRandom(participants);
    text = text.replace(/\{player\}/g, player.pseudo);
  }

  if (theme.has_random_player_var) {
    const randomPlayer = pickRandom(participants);
    text = text.replace(/\{random_player\}/g, randomPlayer.pseudo);
  }

  return text;
}

/**
 * Detects which variables are present in a raw theme text.
 */
export function detectThemeVariables(text: string): {
  hasPlayerVar: boolean;
  hasRandomPlayerVar: boolean;
} {
  return {
    hasPlayerVar: /\{player\}/.test(text),
    hasRandomPlayerVar: /\{random_player\}/.test(text),
  };
}

/**
 * Picks a random element from an array (non-empty).
 */
function pickRandom<T>(arr: T[]): T {
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] as T;
}

/**
 * Picks a theme at random from a list, avoiding previously used theme IDs.
 */
export function pickUnusedTheme<T extends { id: string }>(
  themes: T[],
  usedIds: Set<string>,
): T | null {
  const available = themes.filter((t) => !usedIds.has(t.id));
  if (available.length === 0) return null;
  return pickRandom(available);
}
