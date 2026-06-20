import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Vote } from 'lucide-react';

import { ChallengeCard } from '@/components/game/ChallengeCard';
import { HostControls } from '@/components/game/HostControls';
import { ParticipantList } from '@/components/game/ParticipantList';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { GameService } from '@/lib/services/GameService';
import { ParticipantService } from '@/lib/services/ParticipantService';
import { AutoRefresh } from '@/components/ui/AutoRefresh';
import { InviteButton } from './InviteButton';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function GameDashboardPage({ params }: PageProps) {
  const { code } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  // Guard: session belongs to a different game → redirect to the right one
  if (session.gameCode && session.gameCode !== code) {
    redirect(`/game/${session.gameCode}`);
  }

  const [game, participants, todayChallenge] = await Promise.all([
    GameService.getByCode(code),
    ParticipantService.getByGameId(session.gameId),
    ChallengeService.getTodayChallenge(session.gameId),
  ]);

  // Unknown game code or session / game mismatch
  if (!game || game.id !== session.gameId) redirect('/');

  const currentParticipant = participants.find((p) => p.id === session.participantId);
  const isHost = currentParticipant?.is_host ?? false;
  const isVotingOpen = todayChallenge?.status === 'voting';

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh intervalMs={10000} />
      {/* Invite card */}
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Code de la partie</p>
          <p className="font-mono text-xl font-bold tracking-widest text-gray-900">{code}</p>
        </div>
        <InviteButton code={code} />
      </Card>

      {/* Today's challenge */}
      {todayChallenge ? (
        <ChallengeCard
          challenge={todayChallenge}
          participantCount={participants.length}
          photoCount={todayChallenge.photos?.length ?? 0}
        />
      ) : (
        <Card className="flex flex-col items-center py-8 text-center">
          <p className="text-4xl">📸</p>
          <p className="mt-2 font-semibold text-gray-800">Pas encore de défi aujourd&apos;hui</p>
          <p className="mt-1 text-sm text-gray-400">
            {isHost
              ? 'Générez le défi du jour ci-dessous.'
              : "L'hôte générera le défi bientôt !"}
          </p>
        </Card>
      )}

      {/* Big "Voter" CTA when voting is open */}
      {isVotingOpen && (
        <Link href={`/game/${code}/vote`}>
          <Button variant="primary" size="lg" fullWidth>
            <Vote className="h-5 w-5" />
            Voter maintenant 🗳️
          </Button>
        </Link>
      )}

      {/* Host controls */}
      {isHost && (
        <HostControls
          gameId={session.gameId}
          gameCode={code}
          todayChallenge={todayChallenge}
          defaultMode={game.game_mode}
        />
      )}

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
        </CardHeader>
        <ParticipantList
          participants={participants}
          currentParticipantId={session.participantId}
        />
      </Card>
    </div>
  );
}
