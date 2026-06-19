import { NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth';

/**
 * GET /api/session
 * Returns the current session (safe for client consumption — no token exposed).
 */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
