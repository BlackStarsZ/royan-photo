/**
 * Generates a random 6-character alphanumeric game code (uppercase).
 * Excludes ambiguous characters: 0, O, I, 1, L.
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Returns a random pastel hex color for the participant's avatar.
 */
export function generateAvatarColor(): string {
  const colors = [
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ef4444', // red
    '#f97316', // orange
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#a855f7', // purple
  ];
  return colors[Math.floor(Math.random() * colors.length)] ?? '#f59e0b';
}
