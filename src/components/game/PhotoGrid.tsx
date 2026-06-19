import Image from 'next/image';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { PhotoWithParticipant } from '@/types';

interface PhotoGridProps {
  photos: PhotoWithParticipant[];
  winnerIds?: Set<string>;
  themeByParticipant?: Map<string, string>;
}

export function PhotoGrid({ photos, winnerIds, themeByParticipant }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-12 text-gray-400">
        <p className="text-sm">Aucune photo soumise pour ce defi.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => {
        const individualTheme = themeByParticipant?.get(photo.participant_id);
        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isWinner={winnerIds?.has(photo.id) ?? false}
            {...(individualTheme ? { individualTheme } : {})}
          />
        );
      })}
    </div>
  );
}

function PhotoCard({
  photo,
  isWinner,
  individualTheme,
}: {
  photo: PhotoWithParticipant;
  isWinner: boolean;
  individualTheme?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-sm">
        {photo.public_url ? (
          <div className="relative aspect-square w-full">
            <Image
              src={photo.public_url}
              alt={`Photo de ${photo.participant.pseudo}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center bg-gray-200 text-gray-400 text-sm">
            Photo indisponible
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Avatar
                pseudo={photo.participant.pseudo}
                color={photo.participant.avatar_color}
                size="xs"
              />
              <span className="truncate text-xs font-medium text-white">
                {photo.participant.pseudo}
              </span>
            </div>
            {photo.votes_count > 0 && (
              <span className="text-xs font-semibold text-amber-300">
                {photo.votes_count} votes
              </span>
            )}
          </div>
        </div>

        {isWinner && (
          <div className="absolute left-2 top-2">
            <Badge variant="warning">Gagnant</Badge>
          </div>
        )}
      </div>

      {individualTheme && (
        <p className="rounded-lg bg-violet-50 px-2 py-1 text-xs text-violet-700 italic leading-snug">
          {individualTheme}
        </p>
      )}
    </div>
  );
}
