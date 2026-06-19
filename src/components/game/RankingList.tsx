import { Crown, Medal, Star } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import type { ParticipantWithRank } from '@/types';

interface RankingListProps {
  participants: ParticipantWithRank[];
  currentParticipantId?: string;
}

export function RankingList({ participants, currentParticipantId }: RankingListProps) {
  return (
    <div className="flex flex-col gap-2">
      {participants.map((p) => (
        <RankingRow
          key={p.id}
          participant={p}
          isCurrentUser={p.id === currentParticipantId}
        />
      ))}
      {participants.length === 0 && (
        <Card>
          <p className="text-center text-sm text-gray-400">Aucun participant pour l'instant.</p>
        </Card>
      )}
    </div>
  );
}

function RankingRow({
  participant,
  isCurrentUser,
}: {
  participant: ParticipantWithRank;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
        isCurrentUser ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-white ring-1 ring-gray-100'
      }`}
    >
      {/* Rank */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        <RankIcon rank={participant.rank} />
      </div>

      {/* Avatar + pseudo */}
      <Avatar pseudo={participant.pseudo} color={participant.avatar_color} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          {participant.pseudo}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs text-amber-600 font-normal">(vous)</span>
          )}
        </p>
      </div>

      {/* Points */}
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{participant.total_points}</p>
        <p className="text-xs text-gray-400">pts</p>
      </div>
    </div>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-semibold text-gray-400">#{rank}</span>;
}
