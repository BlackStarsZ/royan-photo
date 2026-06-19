import Link from 'next/link';
import { Camera } from 'lucide-react';

import { LogoutButton } from '@/components/layout/LogoutButton';
import type { SessionData } from '@/types';

interface HeaderProps {
  session?: SessionData | null;
  gameCode?: string;
  gameName?: string;
}

export function Header({ session, gameCode, gameName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={gameCode ? `/game/${gameCode}` : '/'}
          className="flex items-center gap-2 font-bold text-gray-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm">{gameName ?? 'Royan Photo'}</span>
        </Link>

        {/* Session info + logout */}
        {session && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-800">{session.pseudo}</span>
            </span>
            {gameCode && (
              <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-600">
                {gameCode}
              </span>
            )}
            {gameCode && <LogoutButton />}
          </div>
        )}
      </div>
    </header>
  );
}
