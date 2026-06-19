'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';
import type { PhotoWithParticipant } from '@/types';

interface VoteCardProps {
  photo: PhotoWithParticipant;
  selected: boolean;
  disabled: boolean;
  onVote: (photoId: string) => void;
}

export function VoteCard({ photo, selected, disabled, onVote }: VoteCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={() => !disabled && onVote(photo.id)}
      disabled={disabled}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'ring-2',
        selected
          ? 'ring-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]'
          : 'ring-transparent hover:ring-gray-200',
        disabled && !selected && 'opacity-70',
      )}
      aria-pressed={selected}
      aria-label={`Voter pour la photo de ${photo.participant.pseudo}`}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {photo.public_url && !imageError ? (
          <Image
            src={photo.public_url}
            alt={`Photo de ${photo.participant.pseudo}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Image indisponible
          </div>
        )}

        {/* Selected overlay */}
        {selected && (
          <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
            <Heart className="h-10 w-10 fill-amber-500 text-amber-500 drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Participant info */}
      <div className="flex items-center gap-2 bg-white px-3 py-2">
        <Avatar
          pseudo={photo.participant.pseudo}
          color={photo.participant.avatar_color}
          size="sm"
        />
        <span className="flex-1 truncate text-sm font-medium text-gray-800">
          {photo.participant.pseudo}
        </span>
        {selected && (
          <span className="text-xs font-semibold text-amber-600">Votre choix</span>
        )}
      </div>
    </button>
  );
}
