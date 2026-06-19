'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

import { PhotoUpload } from '@/components/game/PhotoUpload';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { uploadPhotoAction } from '@/lib/actions/photo';

interface UploadClientProps {
  challengeId: string;
  challengeText: string;
  gameCode: string;
  isIndividual?: boolean;
}

export function UploadClient({ challengeId, challengeText, gameCode, isIndividual = false }: UploadClientProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('challengeId', challengeId);
    formData.append('gameCode', gameCode);

    const result = await uploadPhotoAction(formData);
    setUploading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push(`/game/${gameCode}`), 1800);
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-lg font-semibold text-gray-900">Photo soumise !</p>
        <p className="text-sm text-gray-400">Bonne chance pour les votes ce soir 🤞</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Soumettre ma photo</h1>
        <p className="mt-1 text-sm text-gray-500">Une seule photo par défi. Choisissez bien !</p>
      </div>

      {/* Challenge theme banner */}
      <div className={`rounded-2xl px-4 py-3 ${isIndividual ? 'bg-violet-50' : 'bg-amber-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${isIndividual ? 'text-violet-600' : 'text-amber-600'}`}>
          {isIndividual ? '🎲 Votre thème secret' : 'Thème du défi'}
        </p>
        <p className={`mt-1 text-base font-semibold italic ${isIndividual ? 'text-violet-900' : 'text-amber-900'}`}>
          &ldquo;{challengeText}&rdquo;
        </p>
        {isIndividual && (
          <p className="mt-1 text-xs text-violet-500">Chaque joueur a son propre défi — gardez-le secret !</p>
        )}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4">
          <PhotoUpload onFileSelect={setFile} disabled={uploading} />
        </div>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button
        fullWidth
        size="lg"
        loading={uploading}
        disabled={!file}
        onClick={handleSubmit}
      >
        Envoyer ma photo
      </Button>
    </div>
  );
}
