import { redirect } from 'next/navigation';

import { RankingList } from '@/components/game/RankingList';
import { getSession } from '@/lib/actions/auth';
import { ParticipantService } from '@/lib/services/ParticipantService';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RankingPage({ params }: PageProps) {
  const { code: _code } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const ranked = await ParticipantService.getRanking(session.gameId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Classement</h1>
        <p className="mt-1 text-sm text-gray-500">
          Points : 1 par vote reçu + 3 bonus pour le gagnant du jour.
        </p>
      </div>

      <RankingList participants={ranked} currentParticipantId={session.participantId} />
    </div>
  );
}
