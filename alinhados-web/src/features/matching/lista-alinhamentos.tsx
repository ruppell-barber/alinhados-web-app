'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ResumoAlinhamento, TipoUsuario } from '@/contracts-local';
import { matchingGateway } from '@/lib/matching';
import { StatusBadge } from './status-badge';

function dataCurta(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso));
}

/**
 * Lista de alinhamentos, mais recentes primeiro (RF65). É a base da tela de histórico da
 * barbearia (E10) e de "Meus alinhamentos" do barbeiro — o `tipoUsuario` só ajusta o texto.
 * Só o próprio usuário vê a sua lista (o mock guarda por `usuarioId` — controle de acesso).
 */
export function ListaAlinhamentos({
  usuarioId,
  tipoUsuario,
}: {
  usuarioId: string;
  tipoUsuario: TipoUsuario;
}) {
  const [itens, setItens] = useState<ResumoAlinhamento[] | null>(null);

  useEffect(() => {
    let ativo = true;
    matchingGateway.listar(usuarioId).then((a) => ativo && setItens(a));
    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  const alvo = tipoUsuario === 'barbearia' ? 'barbeiro' : 'barbearia';

  if (itens === null) {
    return (
      <p role="status" className="text-center text-paper/70">
        Carregando…
      </p>
    );
  }

  if (itens.length === 0) {
    return (
      <div
        className="rounded-card border-2 border-paper/20 bg-ink-soft p-8 text-center"
        role="status"
      >
        <p className="text-4xl">🤝</p>
        <p className="mt-3 font-display text-lg font-bold text-paper">Nenhum alinhamento ainda</p>
        <p className="mt-1 text-sm text-paper/60">
          Quando você e {alvo === 'barbeiro' ? 'um barbeiro' : 'uma barbearia'} demonstrarem
          interesse mútuo, o alinhamento aparece aqui.
        </p>
        <Link
          href="/feed"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-6 font-display font-bold text-ink shadow-brutal-paper"
        >
          Ir para o feed
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {itens.map((a) => (
        <li key={a.id}>
          <Link
            href={`/alinhamentos/${a.id}`}
            className="flex items-center gap-3 rounded-card border-2 border-ink bg-ink-soft p-3 shadow-brutal-paper transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <div className="size-14 shrink-0 overflow-hidden rounded-card border-2 border-ink bg-paper/10">
              {a.contraparte.avatar_url ? (
                <img src={a.contraparte.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">💈</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold text-paper">
                {a.contraparte.nome ?? 'Sem nome'}
              </p>
              {a.contraparte.cidade && (
                <p className="truncate text-sm text-paper/60">
                  {a.contraparte.cidade}
                  {a.contraparte.estado ? ` · ${a.contraparte.estado}` : ''}
                </p>
              )}
              <p className="mt-0.5 text-xs text-paper/40">Alinhados em {dataCurta(a.created_at)}</p>
            </div>
            <StatusBadge status={a.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
