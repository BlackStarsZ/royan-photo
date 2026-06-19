'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Home, List, Trophy, Vote } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface BottomNavProps {
  gameCode: string;
}

export function BottomNav({ gameCode }: BottomNavProps) {
  const pathname = usePathname();
  const base = `/game/${gameCode}`;

  const links = [
    { href: base, label: 'Accueil', icon: Home },
    { href: `${base}/upload`, label: 'Photo', icon: Camera },
    { href: `${base}/vote`, label: 'Voter', icon: Vote },
    { href: `${base}/ranking`, label: 'Classement', icon: Trophy },
    { href: `${base}/history`, label: 'Historique', icon: List },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-sm"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2 pb-safe">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== base && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors',
                active
                  ? 'text-amber-600'
                  : 'text-gray-400 hover:text-gray-600',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', active && 'scale-110 transition-transform')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
