'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Camera, ImageIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface PhotoUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function PhotoUpload({ onFileSelect, disabled = false }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl bg-gray-100">
          <div className="relative aspect-square w-full">
            <Image src={preview} alt="Aperçu" fill className="object-cover" />
          </div>
          {!disabled && (
            <button
              onClick={clearPreview}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Supprimer la photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed',
            'aspect-square w-full transition-colors',
            dragging
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Sélectionnez une photo</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP — max 10 Mo</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Sélectionner une photo"
      />

      {!preview && (
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.removeAttribute('capture');
              inputRef.current.click();
            }
          }}
          disabled={disabled}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          Prendre une photo
        </Button>
      )}
    </div>
  );
}
