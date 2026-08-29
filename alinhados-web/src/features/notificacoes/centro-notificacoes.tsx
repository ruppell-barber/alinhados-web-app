'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Notificacao } from '@/contracts-local';
import { notificacoesGateway } from '@/lib/notificacoes';
import { tempoRelativo } from './tempo';

const ICONE: Record<Notificacao['tipo'], string> = {
  alinhamento: '💈',
  mensagem: '💬',
  perfil_incompleto: '📝',
};

/**
 * Centro de notificações in-app (B13/E13 · NF01) — componente compartilhado pelos dois
 * lados. Estado lido/não lido, deep-link para a conversa do alinhamento (tocar leva ao
 * detalhe) e ação "marcar todas como lidas".
 */
export function CentroNotificacoes({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const [itens, setItens] = useState<Notificacao[] | null>(null);

  useEffect(() => {
    let ativo = true;
    notificacoesGateway.listar(usuarioId).then((n) => ativo && setItens(n));
    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  async function abrir(n: Notificacao) {
    await notificacoesGateway.marcarLida(usuarioId, n.id);
    setItens((cur) => cur?.map((x) => (x.id === n.id ? { ...x, lida: true } : x)) ?? null);
    if (n.match_id) router.push(`/alinhamentos/${n.match_id}`); // deep-link (RF70)
  }

  async function marcarTodas() {
    await notificacoesGateway.marcarTodasLidas(usuarioId);
    setItens((cur) => cur?.map((x) => ({ ...x, lida: true })) ?? null);
  }

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
        <p className="text-4xl">🔔</p>
        <p className="mt-3 font-display text-lg font-bold text-paper">Nenhuma notificação ainda</p>
        <p className="mt-1 text-sm text-paper/60">
          Quando rolar um alinhamento, a gente te avisa por aqui.
        </p>
      </div>
    );
  }

  const temNaoLida = itens.some((n) => !n.lida);

  return (
    <div className="flex flex-col gap-3">
      {temNaoLida && (
        <button
          type="button"
          onClick={marcarTodas}
          className="self-end text-sm font-bold text-lime underline-offset-2 hover:underline"
        >
          Marcar todas como lidas
        </button>
      )}

      <ul className="flex flex-col gap-2">
        {itens.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => abrir(n)}
              className={`flex w-full items-start gap-3 rounded-card border-2 p-4 text-left transition-colors ${
                n.lida
                  ? 'border-paper/15 bg-transparent'
                  : 'border-ink bg-ink-soft shadow-brutal-paper'
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {ICONE[n.tipo]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-display font-bold text-paper">{n.titulo}</span>
                  {!n.lida && (
                    <span className="size-2 shrink-0 rounded-full bg-lime" aria-label="não lida" />
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-paper/70">{n.corpo}</span>
                <span className="mt-1 block text-xs text-paper/40">
                  {tempoRelativo(n.created_at)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
