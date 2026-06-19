'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { logoutAction } from '@/lib/actions/auth';

export function LogoutButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-reset confirmation after 3 s if user doesn't confirm
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await logoutAction();
    router.push('/');
  };

  return (
    <button
      onClick={handleClick}
      title={confirming ? 'Confirmer ?' : 'Quitter la partie'}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
        confirming
          ? 'bg-red-100 text-red-600'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
      }`}
    >
      <LogOut className="h-3.5 w-3.5" />
      {confirming ? 'Confirmer ?' : 'Quitter'}
    </button>
  );
}
