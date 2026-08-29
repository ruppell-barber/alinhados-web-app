'use client';

import Link from 'next/link';
import { CardVitrine } from '@/features/discovery/card-vitrine';
import { perfilBarbeiroPublicoDe } from '@/lib/discovery/feed-regras';
import { BARBEIROS_SEED } from '@/lib/discovery/seed';

/**
 * Preview da PROPOSTA DE LAYOUT (opcional) do card, no estilo da referência do designer.
 * Não faz parte do fluxo entregue — é uma tela de comparação para o time decidir. Usa os
 * dados do seed (nada inventado). Fora do escopo das tasks da Sprint 3.
 */
export default function PaginaVitrine() {
  const barbeiros = BARBEIROS_SEED.filter((b) => b.disponivel).map(perfilBarbeiroPublicoDe);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center gap-3">
        <Link
          href="/feed"
          aria-label="Voltar"
          className="flex size-10 items-center justify-center rounded-full border-2 border-paper/40 text-paper hover:border-lime hover:text-lime"
        >
          ←
        </Link>
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-widest text-lime">
            Proposta de layout · opcional
          </p>
          <h1 className="font-display text-2xl font-bold">Card vitrine</h1>
          <p className="text-sm text-paper/70">
            Alternativa visual ao card do feed, no estilo da referência do designer.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {barbeiros.map((b) => (
          <CardVitrine key={b.id} barbeiro={b} />
        ))}
      </div>
    </main>
  );
}
