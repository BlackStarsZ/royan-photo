'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

import { VoteCard } from '@/components/game/VoteCard';
import { Button } from '@/components/ui/Button';
import { castVoteAction } from '@/lib/actions/vote';
import type { ChallengeStatus, PhotoWithParticipant } from '@/types';

interface VotePageClientProps {
  challengeId: string;
  challengeText: string;
  gameCode: string;
  photos: PhotoWithParticipant[];
  initialVotePhotoId: string | null;
  challengeStatus: ChallengeStatus;
}

export function VotePageClient({
  challengeId,
  challengeText,
  gameCode,
  photos,
  initialVotePhotoId,
  challengeStatus,
}: VotePageClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialVotePhotoId);
  const [submitted, setSubmitted] = useState(Boolean(initialVotePhotoId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isCompleted = challengeStatus === 'completed';
  const disabled = submitted || isCompleted || submitting;

  const handleVote = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError('');

    const result = await castVoteAction(challengeId, selectedId, gameCode);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl">🖼️</p>
        <p className="mt-3 font-semibold text-gray-800">Aucune photo à voter</p>
        <p className="mt-1 text-sm text-gray-400">
          Personne d&apos;autre n&apos;a encore soumis de photo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Voter</h1>
        <p className="mt-1 text-sm text-gray-600 italic">&ldquo;{challengeText}&rdquo;</p>
      </div>

      {submitted && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            {isCompleted ? 'Votes clôturés — merci pour votre participation !' : 'Vote enregistré !'}
          </span>
        </div>
      )}

      {/* User hasn't voted but voting is now closed */}
      {!submitted && isCompleted && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-gray-500">
          <span className="text-sm">
            🔒 Les votes sont clôturés — vous n&apos;avez pas eu le temps de voter cette fois.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {photos.map((photo) => (
          <VoteCard
            key={photo.id}
            photo={photo}
            selected={selectedId === photo.id}
            disabled={disabled}
            onVote={(id) => !disabled && setSelectedId(id)}
          />
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!submitted && !isCompleted && (
        <Button
          fullWidth
          size="lg"
          loading={submitting}
          disabled={!selectedId}
          onClick={handleVote}
        >
          Confirmer mon vote
        </Button>
      )}
    </div>
  );
}
