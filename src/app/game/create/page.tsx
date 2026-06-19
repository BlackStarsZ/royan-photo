'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createGameAction } from '@/lib/actions/auth';
import type { GameMode } from '@/types';

export default function CreateGamePage() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [challengeTime, setChallengeTime] = useState('12:00');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await createGameAction({
      gameName,
      pseudo,
      gameMode,
      ...(gameMode === 'daily' ? { challengeTime } : {}),
    });

    setLoading(false);

    if (result.success) {
      router.push(`/game/${result.data.gameCode}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-6">
      {/* Back */}
      <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">Créer une partie</h1>

      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        {/* Game details */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-700">La partie</h2>
          <div className="flex flex-col gap-3">
            <Input
              label="Nom de la partie"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Ex: Vacances Royan 2025"
              maxLength={100}
              required
            />
            <Input
              label="Votre pseudo (vous serez l'hôte)"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Choisissez un pseudo"
              maxLength={50}
              required
            />
          </div>
        </Card>

        {/* Game mode */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Mode de jeu</h2>
          <div className="flex flex-col gap-3">
            <GameModeOption
              selected={gameMode === 'daily'}
              onSelect={() => setGameMode('daily')}
              icon={<Clock className="h-5 w-5" />}
              title="Défi quotidien"
              description="Un nouveau défi est généré chaque jour à heure fixe."
            />
            <GameModeOption
              selected={gameMode === 'surprise'}
              onSelect={() => setGameMode('surprise')}
              icon={<Shuffle className="h-5 w-5" />}
              title="Défi surprise"
              description="L'heure du défi est aléatoire — restez à l'affût !"
            />
          </div>

          {gameMode === 'daily' && (
            <div className="mt-4">
              <Input
                label="Heure du défi"
                type="time"
                value={challengeTime}
                onChange={(e) => setChallengeTime(e.target.value)}
                hint="Heure à laquelle le défi est lancé chaque jour"
              />
            </div>
          )}
        </Card>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} size="lg">
          Créer la partie
        </Button>
      </form>
    </main>
  );
}

function GameModeOption({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
        selected
          ? 'border-amber-500 bg-amber-50'
          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
      }`}
    >
      <span
        className={`mt-0.5 rounded-lg p-2 ${selected ? 'bg-amber-500 text-white' : 'bg-white text-gray-400'}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  );
}
