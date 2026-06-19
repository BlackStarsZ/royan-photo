import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  pseudo: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

/**
 * Displays a colored circle with the participant's initial.
 */
export function Avatar({ pseudo, color, size = 'md', className }: AvatarProps) {
  const initial = pseudo.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
      aria-label={pseudo}
    >
      {initial}
    </div>
  );
}
