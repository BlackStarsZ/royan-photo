import { NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await params;
  const session = await getSession();

  if (!session || session.gameId !== gameId) {
    return NextResponse.json({ challenge: null }, { status: 401 });
  }

  try {
    const challenge = await ChallengeService.getTodayChallenge(gameId);
    return NextResponse.json({ challenge });
  } catch {
    return NextResponse.json({ challenge: null }, { status: 500 });
  }
}
