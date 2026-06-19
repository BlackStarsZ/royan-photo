import { cn } from '@/lib/utils/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900',
          'placeholder:text-gray-400',
          'transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}
