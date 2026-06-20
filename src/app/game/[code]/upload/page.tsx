import { redirect } from 'next/navigation';

import { AutoRefresh } from '@/components/ui/AutoRefresh';
import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { PhotoService } from '@/lib/services/PhotoService';
import { UploadClient } from './UploadClient';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function UploadPage({ params }: PageProps) {
  const { code } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const challenge = await ChallengeService.getCurrentChallenge(session.gameId);

  // No challenge yet
  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl">⏳</p>
        <p className="mt-3 font-semibold text-gray-800">Pas encore de défi aujourd&apos;hui</p>
        <p className="mt-1 text-sm text-gray-400">
          L&apos;hôte génèrera le défi bientôt !
        </p>
      </div>
    );
  }

  // Voting or completed — submissions closed
  if (challenge.status === 'voting' || challenge.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl">🔒</p>
        <p className="mt-3 font-semibold text-gray-800">Soumissions fermées</p>
        <p className="mt-1 text-sm text-gray-400">
          {challenge.status === 'voting'
            ? 'La phase de vote est ouverte — plus de photos acceptées.'
            : 'Ce défi est terminé.'}
        </p>
      </div>
    );
  }

  // Check if this participant already uploaded
  const alreadyUploaded = await PhotoService.hasUploaded(challenge.id, session.participantId);

  if (alreadyUploaded) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl">✅</p>
        <p className="mt-3 font-semibold text-gray-800">Photo déjà soumise !</p>
        <p className="mt-1 text-sm text-gray-400">
          Vous avez déjà participé à ce défi. Bonne chance pour les votes 🤞
        </p>
      </div>
    );
  }

  // Resolve theme text: individual or shared
  let themeText = challenge.theme_text;
  if (challenge.individual_themes) {
    const pt = await ChallengeService.getParticipantTheme(challenge.id, session.participantId);
    themeText = pt?.theme_text ?? 'Thème en attente…';
  }

  return (
    <>
      <AutoRefresh intervalMs={15000} />
      <UploadClient
      challengeId={challenge.id}
      challengeText={themeText}
      isIndividual={challenge.individual_themes}
      gameCode={code}
    />
    </>
  );
}
