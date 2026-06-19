import { Crown } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import type { Participant } from '@/types';

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId?: string;
}

export function ParticipantList({ participants, currentParticipantId }: ParticipantListProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {participants.map((p) => (
        <div
          key={p.id}
          className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-colors ${
            p.id === currentParticipantId ? 'bg-amber-50' : 'bg-gray-50'
          }`}
        >
          <div className="relative">
            <Avatar pseudo={p.pseudo} color={p.avatar_color} size="md" />
            {p.is_host && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                <Crown className="h-2.5 w-2.5 text-white" />
              </span>
            )}
          </div>
          <span className="max-w-[60px] truncate text-center text-xs font-medium text-gray-700">
            {p.pseudo}
          </span>
        </div>
      ))}
    </div>
  );
}
