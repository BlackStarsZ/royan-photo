'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type, onDismiss, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg ring-1',
        'transition-all duration-300',
        type === 'success'
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
          : 'bg-red-50 text-red-800 ring-red-200',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      {type === 'success' ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onDismiss} className="ml-1 rounded p-0.5 hover:bg-black/5" aria-label="Fermer">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
