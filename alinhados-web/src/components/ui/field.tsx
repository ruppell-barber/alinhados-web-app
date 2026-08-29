'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (aria: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  }) => React.ReactNode;
}

/**
 * Wrapper de campo com label, dica e erro acessíveis (WCAG AA — RNF13).
 * O children recebe os atributos ARIA para espalhar no input.
 */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const descricaoId = error ? `${id}-erro` : hint ? `${id}-dica` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-display text-sm font-bold text-paper">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-lime">
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': descricaoId })}
      {hint && !error && (
        <p id={`${id}-dica`} className="text-sm text-paper/70">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClassName =
  'min-h-12 w-full rounded-xl border-2 border-paper/30 bg-ink-soft px-4 text-base text-paper placeholder:text-paper/40 focus:border-lime aria-[invalid=true]:border-danger';
