'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { joinGameAction } from '@/lib/actions/auth';

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await joinGameAction({ code: code.toUpperCase(), pseudo });
    setLoading(false);

    if (result.success) {
      router.push(`/game/${result.data.gameCode}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-4 py-12">
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500 shadow-lg shadow-amber-500/30">
          <Camera className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Royan Photo</h1>
        <p className="mt-2 max-w-xs text-gray-500">
          Un défi photo par jour entre amis. Le meilleur photographe gagne ! 🏆
        </p>
      </div>

      {/* Join form */}
      <Card className="w-full max-w-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Rejoindre une partie</h2>
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <Input
            label="Code de la partie"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EX: A2B3C4"
            maxLength={6}
            required
            className="font-mono tracking-widest uppercase"
            autoComplete="off"
          />
          <Input
            label="Votre pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Choisissez un pseudo"
            maxLength={50}
            required
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth loading={loading} size="lg">
            Rejoindre
          </Button>
        </form>
      </Card>

      {/* Divider */}
      <div className="my-6 flex w-full max-w-sm items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Create game */}
      <Link href="/game/create" className="w-full max-w-sm">
        <Button variant="secondary" fullWidth size="lg">
          Créer une nouvelle partie
        </Button>
      </Link>
    </main>
  );
}
