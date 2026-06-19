import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PhotoGrid } from '@/components/game/PhotoGrid';
import { Card } from '@/components/ui/Card';
import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { formatDateFr } from '@/lib/utils/date';

interface PageProps {
  params: Promise<{ code: string; challengeId: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { code, challengeId } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const challenge = await ChallengeService.getById(challengeId);
  if (!challenge || challenge.game_id !== session.gameId) redirect(`/game/${code}/history`);

  const photos = challenge.photos ?? [];

  // Find winners (all tied for most votes, > 0)
  const maxVotes = photos.reduce((max, p) => Math.max(max, p.votes_count), 0);
  const winners = maxVotes > 0 ? photos.filter((p) => p.votes_count === maxVotes) : [];
  const winnerIds = new Set(winners.map((w) => w.id));

  // Load individual themes if applicable
  const participantThemes = challenge.individual_themes
    ? await ChallengeService.getAllParticipantThemes(challengeId)
    : [];
  const themeByParticipant = new Map(participantThemes.map((pt) => [pt.participant_id, pt.theme_text]));

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/game/${code}/history`}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Historique
      </Link>

      <Card>
        <p className="text-xs text-gray-400">
          Jour {challenge.day_number} — {formatDateFr(challenge.challenge_date)}
        </p>
        {challenge.individual_themes ? (
          <p className="mt-1 text-lg font-semibold text-violet-700">🎲 Thèmes individuels</p>
        ) : (
          <p className="mt-1 text-lg font-semibold text-gray-900">{challenge.theme_text}</p>
        )}
      </Card>

      {photos.length > 0 ? (
        <>
          {winners.length === 1 && winners[0] && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-amber-700">
                🏆 Gagnant : {winners[0].participant.pseudo} avec {winners[0].votes_count} vote
                {winners[0].votes_count > 1 ? 's' : ''}
              </p>
            </div>
          )}
          {winners.length > 1 && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-amber-700">
                🏆 Ex-æquo ({maxVotes} vote{maxVotes > 1 ? 's' : ''}) :{' '}
                {winners.map((w) => w.participant.pseudo).join(', ')}
              </p>
            </div>
          )}
          {winners.length === 0 && (
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-sm text-gray-500">Aucun vote pour ce défi.</p>
            </div>
          )}
          <PhotoGrid
            photos={photos}
            winnerIds={winnerIds}
            themeByParticipant={themeByParticipant}
          />
        </>
      ) : (
        <Card className="py-10 text-center">
          <p className="text-sm text-gray-400">Aucune photo soumise pour ce défi.</p>
        </Card>
      )}
    </div>
  );
}
