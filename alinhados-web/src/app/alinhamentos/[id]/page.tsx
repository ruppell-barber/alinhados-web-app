'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ResumoAlinhamento } from '@/contracts-local';
import { useSessao } from '@/features/identidade/use-sessao';
import { matchingGateway } from '@/lib/matching';
import { StatusBadge } from '@/features/matching/status-badge';
import { FuiContratadoModal } from '@/features/matching/fui-contratado-modal';

/**
 * Detalhe do alinhamento — alvo do "Ir para a conversa" (overlay) e do deep-link da
 * notificação. Hospeda o fluxo "Fui contratado / Deu certo" (B08). O chat em tempo real
 * é da Sprint 4, então aqui entra um placeholder honesto no lugar da conversa.
 */
export default function PaginaAlinhamento() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  // undefined = carregando · null = não encontrado
  const [alinhamento, setAlinhamento] = useState<ResumoAlinhamento | null | undefined>(undefined);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    if (!isLoading && !sessao) {
      router.replace('/login');
      return;
    }
    if (sessao && id) matchingGateway.buscar(sessao.usuarioId, id).then(setAlinhamento);
  }, [isLoading, sessao, id, router]);

  if (isLoading || !sessao || alinhamento === undefined) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-5">
        <p role="status" className="font-display text-paper/70">
          Carregando…
        </p>
      </main>
    );
  }

  if (alinhamento === null) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-4xl">🤷</p>
        <p className="font-display text-lg font-bold text-paper">Alinhamento não encontrado</p>
        <Link
          href="/alinhamentos"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-6 font-display font-bold text-ink shadow-brutal-paper"
        >
          Ver meus alinhamentos
        </Link>
      </main>
    );
  }

  const c = alinhamento.contraparte;
  const nome = c.nome ?? 'Sem nome';
  const jaContratou = alinhamento.deu_certo;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center gap-3">
        <Link
          href="/alinhamentos"
          aria-label="Voltar"
          className="flex size-10 items-center justify-center rounded-full border-2 border-paper/40 text-paper hover:border-lime hover:text-lime"
        >
          ←
        </Link>
        <h1 className="font-display text-xl font-bold">Alinhamento</h1>
      </header>

      <section className="flex items-center gap-4 rounded-card border-2 border-ink bg-ink-soft p-4 shadow-brutal-paper">
        <div className="size-20 shrink-0 overflow-hidden rounded-card border-2 border-ink bg-paper/10">
          {c.avatar_url ? (
            <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">💈</div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl font-bold text-paper">{nome}</h2>
          {c.cidade && (
            <p className="text-sm text-paper/60">
              {c.cidade}
              {c.estado ? ` · ${c.estado}` : ''}
            </p>
          )}
          <div className="mt-2">
            <StatusBadge status={alinhamento.status} />
          </div>
        </div>
      </section>

      {/* Placeholder da conversa — o chat em tempo real é da Sprint 4 (RF71/Módulo Conversa). */}
      <section className="flex flex-1 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-paper/25 p-8 text-center">
        <p className="text-3xl">💬</p>
        <p className="font-display font-bold text-paper">A conversa chega na próxima sprint</p>
        <p className="text-sm text-paper/60">
          O chat em tempo real entre vocês está a caminho. Por enquanto, o alinhamento já está
          registrado dos dois lados.
        </p>
      </section>

      {jaContratou ? (
        <p className="rounded-card border-2 border-mint bg-mint/10 p-4 text-center font-display font-bold text-mint">
          Contratação registrada ✓
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="rounded-full border-2 border-ink bg-mint py-3 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5"
        >
          {sessao.tipo === 'barbeiro' ? '✓ Fui contratado' : '✓ Deu certo (contratei)'}
        </button>
      )}

      {modalAberto && (
        <FuiContratadoModal
          usuarioId={sessao.usuarioId}
          matchId={alinhamento.id}
          tipoUsuario={sessao.tipo}
          nomeContraparte={nome}
          onFechar={() => setModalAberto(false)}
          onConcluido={(resumo) => {
            setAlinhamento(resumo);
            setModalAberto(false);
          }}
        />
      )}
    </main>
  );
}
