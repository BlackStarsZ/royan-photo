import { Camera, Clock, Trophy } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDateFr } from '@/lib/utils/date';
import type { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  participantCount: number;
  photoCount: number;
}

const statusConfig = {
  pending: { label: 'En attente', variant: 'default' as const },
  active: { label: 'En cours', variant: 'success' as const },
  voting: { label: 'Vote ouvert', variant: 'warning' as const },
  completed: { label: 'Terminé', variant: 'info' as const },
};

export function ChallengeCard({ challenge, participantCount, photoCount }: ChallengeCardProps) {
  const { label, variant } = statusConfig[challenge.status];

  return (
    <Card className="animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="mb-1 text-xs font-medium text-gray-400">
            Jour {challenge.day_number} — {formatDateFr(challenge.challenge_date)}
          </p>
          {challenge.individual_themes ? (
            <p className="text-lg font-semibold leading-snug text-violet-700">
              🎲 Thèmes individuels secrets
            </p>
          ) : (
            <p className="text-lg font-semibold leading-snug text-gray-900">{challenge.theme_text}</p>
          )}
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Camera className="h-4 w-4" />
          {photoCount} / {participantCount} photos
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {new Date(challenge.scheduled_time).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {challenge.status === 'voting' && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <Trophy className="h-4 w-4" />
          Les votes sont ouverts ! Choisissez votre photo préférée.
        </div>
      )}
    </Card>
  );
}
