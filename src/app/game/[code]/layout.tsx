import { redirect } from 'next/navigation';

import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { getSession } from '@/lib/actions/auth';
import { GameService } from '@/lib/services/GameService';

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}

export default async function GameLayout({ children, params }: GameLayoutProps) {
  const { code } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/?join=${code}`);
  }

  const game = await GameService.getByCode(code);

  if (!game) redirect('/');

  // Ensure this participant belongs to this game
  if (session.gameId !== game.id) {
    redirect(`/?join=${code}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header session={session} gameCode={code} gameName={game.name} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">
        {children}
      </main>
      <BottomNav gameCode={code} />
    </div>
  );
}
