import { redirect } from 'next/navigation';

import { VotePageClient } from './VotePageClient';
import { AutoRefresh } from '@/components/ui/AutoRefresh';
import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { PhotoService } from '@/lib/services/PhotoService';
import { VoteService } from '@/lib/services/VoteService';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function VotePage({ params }: PageProps) {
  const { code } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const challenge = await ChallengeService.getTodayChallenge(session.gameId);

  if (!challenge || challenge.status === 'pending' || challenge.status === 'active') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl">⏳</p>
        <p className="mt-3 font-semibold text-gray-800">Les votes ne sont pas encore ouverts</p>
        <p className="mt-1 text-sm text-gray-400">Revenez ce soir pour voter !</p>
      </div>
    );
  }

  const [photos, existingVote] = await Promise.all([
    PhotoService.getByChallengeId(challenge.id),
    VoteService.getVote(challenge.id, session.participantId),
  ]);

  // Filter out the current participant's own photo
  const votablePhotos = photos.filter((p) => p.participant_id !== session.participantId);

  return (
    <>
      <AutoRefresh intervalMs={10000} />
      <VotePageClient
      challengeId={challenge.id}
      challengeText={challenge.theme_text}
      gameCode={code}
      photos={votablePhotos}
      initialVotePhotoId={existingVote?.photo_id ?? null}
      challengeStatus={challenge.status}
    />
    </>
  );
}
