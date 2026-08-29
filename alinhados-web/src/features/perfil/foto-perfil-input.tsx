'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

interface FotoPerfilInputProps {
  onChange: (arquivo: File | null) => void;
  error?: string;
  /** Foto já salva (data URL) para pré-visualizar ao editar o perfil. */
  previewInicial?: string | null;
}

/** Upload da foto de perfil obrigatória (RF21), com pré-visualização. */
export function FotoPerfilInput({ onChange, error, previewInicial }: FotoPerfilInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewInicial ?? null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0] ?? null;
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(arquivo ? URL.createObjectURL(arquivo) : (previewInicial ?? null));
    onChange(arquivo);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-describedby={error ? `${id}-erro` : undefined}
        className="group relative size-28 overflow-hidden rounded-full border-2 border-paper/40 bg-ink-soft transition-colors hover:border-lime data-[erro=true]:border-danger"
        data-erro={Boolean(error)}
      >
        {preview ? (
          <Image src={preview} alt="Pré-visualização da foto de perfil" fill unoptimized className="object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-paper/60 group-hover:text-lime">
            <span aria-hidden="true" className="font-display text-2xl">
              +
            </span>
            <span className="text-xs font-semibold">Adicionar foto</span>
          </span>
        )}
      </button>

      <label htmlFor={id} className="font-display text-sm font-bold text-paper">
        Foto de perfil <span className="text-lime">*</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={aoSelecionar}
        className="sr-only"
      />

      {error && (
        <p id={`${id}-erro`} role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
