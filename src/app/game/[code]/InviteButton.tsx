'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InviteButtonProps {
  code: string;
}

export function InviteButton({ code }: InviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/?join=${code}`;
    const shareData = {
      title: 'Rejoins notre partie Royan Photo !',
      text: `Utilise le code ${code} pour rejoindre notre jeu photo.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Copié !
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Inviter
        </>
      )}
    </Button>
  );
}
