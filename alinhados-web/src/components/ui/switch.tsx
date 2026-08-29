'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  label: string;
  descricao?: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
  disabled?: boolean;
}

/** Toggle acessível (role=switch nativo via checkbox) no estilo neubrutalista. */
export function Switch({ label, descricao, checked, onChange, disabled }: SwitchProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 rounded-card border-2 p-4 transition-colors',
        checked ? 'border-lime bg-ink-soft' : 'border-paper/30 bg-ink-soft',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="min-w-0">
        <span className="block font-display text-sm font-bold text-paper">{label}</span>
        {descricao && <span className="block text-sm text-paper/70">{descricao}</span>}
      </span>

      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border-2 border-ink transition-colors',
          checked ? 'bg-lime' : 'bg-paper/30',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full border-2 border-ink bg-paper transition-all',
            checked ? 'left-[1.4rem]' : 'left-0.5',
          )}
        />
      </span>
    </label>
  );
}
