'use client';

import { useState } from 'react';
import type { StatusPerfil } from '@/contracts-local';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { apareceNoFeed, STATUS_BARBEIRO } from './status';

interface StatusSelectorProps {
  status: StatusPerfil;
  onChange: (status: StatusPerfil) => void;
  /** Vínculo atual (RF25) — vem do perfil salvo (B01). */
  barbeariaAtual?: string | null;
  estaDesempregado?: boolean;
}

/** Seletor de status/disponibilidade (B09 — RF24/RF25, RN05, Seção 6.3). */
export function StatusSelector({
  status,
  onChange,
  barbeariaAtual,
  estaDesempregado,
}: StatusSelectorProps) {
  const [mostrarPosContratacao, setMostrarPosContratacao] = useState(false);

  function selecionar(novo: StatusPerfil) {
    onChange(novo);
    // Seção 6.3 — quem sai do feed decide o destino do perfil pós-contratação.
    setMostrarPosContratacao(novo === 'indisponivel');
  }

  return (
    <section aria-labelledby="secao-status" className="flex flex-col gap-3 rounded-card border-2 border-grape p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="secao-status" className="font-display text-lg font-bold text-grape">
          Minha disponibilidade
        </h2>
        <span
          className={cn(
            'rounded-full border-2 border-ink px-3 py-0.5 font-display text-xs font-bold',
            apareceNoFeed(status) ? 'bg-mint text-ink' : 'bg-tangerine text-ink',
          )}
        >
          {apareceNoFeed(status) ? 'No feed' : 'Fora do feed'}
        </span>
      </div>

      <p className="text-sm text-paper/70">
        {estaDesempregado
          ? 'Sem barbearia no momento — disponibilidade imediata.'
          : barbeariaAtual
            ? `Vínculo atual: ${barbeariaAtual}`
            : 'Vínculo atual não informado — edite seu perfil para adicionar.'}
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Status de disponibilidade</legend>
        {STATUS_BARBEIRO.map((opcao) => (
          <label
            key={opcao.valor}
            className={cn(
              'cursor-pointer rounded-card border-2 p-3 transition-colors',
              status === opcao.valor
                ? 'border-lime bg-lime text-ink'
                : 'border-paper/30 bg-ink-soft text-paper hover:border-paper/60',
            )}
          >
            <input
              type="radio"
              name="status-disponibilidade"
              value={opcao.valor}
              checked={status === opcao.valor}
              onChange={() => selecionar(opcao.valor)}
              className="sr-only"
            />
            <span className="block font-display text-sm font-bold">{opcao.titulo}</span>
            <span className={cn('text-xs', status === opcao.valor ? 'text-ink/80' : 'text-paper/70')}>
              {opcao.descricao}
            </span>
          </label>
        ))}
      </fieldset>

      {status === 'indisponivel' && (
        <p role="status" className="rounded-xl border-2 border-tangerine bg-ink-soft p-3 text-sm text-paper/90">
          Seu perfil <strong>saiu do feed</strong> das barbearias. Alinhamentos e conversas
          já existentes continuam ativos.
        </p>
      )}

      {mostrarPosContratacao && (
        <Card tone="dark" className="flex flex-col gap-2">
          <p className="font-display text-sm font-bold text-paper">
            Conseguiu contratação? 🎉 Escolha o destino do perfil:
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => selecionar('aberto')}
              className="rounded-full border-2 border-paper/40 px-4 py-2 text-left text-sm font-semibold text-paper hover:border-lime hover:text-lime"
            >
              Ficar visível a propostas — continuo no feed como “aberto”
            </button>
            <button
              type="button"
              onClick={() => setMostrarPosContratacao(false)}
              className="rounded-full border-2 border-paper/40 px-4 py-2 text-left text-sm font-semibold text-paper hover:border-lime hover:text-lime"
            >
              Sair do feed — mantenho “não disponível”
            </button>
            <button
              type="button"
              disabled
              title="Arquivar chega junto com o módulo de conta"
              className="rounded-full border-2 border-paper/20 px-4 py-2 text-left text-sm font-semibold text-paper/40"
            >
              Arquivar perfil (em breve)
            </button>
          </div>
        </Card>
      )}
    </section>
  );
}
