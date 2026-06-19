'use client';

import { useEffect, useState } from 'react';
import type { SessionData } from '@/types';

/**
 * Client-side hook that reads the session from the API route.
 * The actual session is stored server-side in a httpOnly cookie,
 * so we expose a lightweight public endpoint for the client.
 */
export function useParticipant() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then((data: { session: SessionData | null }) => {
        setSession(data.session);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  return { session, loading };
}
