/**
 * Returns today's date as YYYY-MM-DD string.
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]!;
}

/**
 * Returns a date N days from today as YYYY-MM-DD.
 */
export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0]!;
}

/**
 * Formats a date string for display: "Lun. 5 juin"
 */
export function formatDateFr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Formats a datetime string as relative time: "dans 2h", "il y a 5 min"
 */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = then - now;
  const absMs = Math.abs(diffMs);
  const past = diffMs < 0;

  if (absMs < 60_000) return past ? 'il y a quelques secondes' : 'dans quelques secondes';
  if (absMs < 3_600_000) {
    const min = Math.round(absMs / 60_000);
    return past ? `il y a ${min} min` : `dans ${min} min`;
  }
  if (absMs < 86_400_000) {
    const h = Math.round(absMs / 3_600_000);
    return past ? `il y a ${h}h` : `dans ${h}h`;
  }
  const d = Math.round(absMs / 86_400_000);
  return past ? `il y a ${d} jour${d > 1 ? 's' : ''}` : `dans ${d} jour${d > 1 ? 's' : ''}`;
}

/**
 * Builds a full ISO datetime from a date string + a HH:MM time string.
 */
export function buildScheduledTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

/**
 * Returns a random time between 08:00 and 21:00 as "HH:MM".
 */
export function randomTime(): string {
  const hour = Math.floor(Math.random() * 14) + 8; // 8..21
  const minute = Math.random() < 0.5 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
}
