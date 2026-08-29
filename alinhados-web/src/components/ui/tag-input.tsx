'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  id?: string;
  valores: string[];
  onChange: (valores: string[]) => void;
  sugestoes?: string[];
  maximo?: number;
  placeholder?: string;
  tom?: 'lime' | 'grape' | 'tangerine';
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

const tons = {
  lime: 'bg-lime text-ink',
  grape: 'bg-grape text-ink',
  tangerine: 'bg-tangerine text-ink',
};

/**
 * Campo de tags/chips com criação livre e sugestões (RN07: valores em tags,
 * máx. definido pelo chamador; usado também para serviços e cursos).
 */
export function TagInput({
  id,
  valores,
  onChange,
  sugestoes = [],
  maximo,
  placeholder = 'Digite e aperte Enter',
  tom = 'lime',
  ...aria
}: TagInputProps) {
  const [texto, setTexto] = useState('');
  const atingiuMaximo = maximo !== undefined && valores.length >= maximo;

  function adicionar(valor: string) {
    const limpo = valor.trim();
    if (!limpo || atingiuMaximo) return;
    if (valores.some((v) => v.toLowerCase() === limpo.toLowerCase())) return;
    onChange([...valores, limpo]);
    setTexto('');
  }

  function remover(valor: string) {
    onChange(valores.filter((v) => v !== valor));
  }

  const sugestoesDisponiveis = sugestoes.filter(
    (s) => !valores.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2">
      {valores.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Itens selecionados">
          {valores.map((valor) => (
            <li key={valor}>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border-2 border-ink px-3 py-1 text-sm font-bold',
                  tons[tom],
                )}
              >
                {valor}
                <button
                  type="button"
                  onClick={() => remover(valor)}
                  aria-label={`Remover ${valor}`}
                  className="ml-1 font-display leading-none"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <input
        id={id}
        type="text"
        value={texto}
        disabled={atingiuMaximo}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            adicionar(texto);
          }
        }}
        placeholder={atingiuMaximo ? `Máximo de ${maximo} atingido` : placeholder}
        className="min-h-12 w-full rounded-xl border-2 border-paper/30 bg-ink-soft px-4 text-base text-paper placeholder:text-paper/40 focus:border-lime disabled:opacity-60 aria-[invalid=true]:border-danger"
        {...aria}
      />

      {sugestoesDisponiveis.length > 0 && !atingiuMaximo && (
        <div className="flex flex-wrap gap-1.5">
          {sugestoesDisponiveis.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => adicionar(sugestao)}
              className="rounded-full border-2 border-paper/30 px-3 py-1 text-sm text-paper/80 hover:border-lime hover:text-lime"
            >
              + {sugestao}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
