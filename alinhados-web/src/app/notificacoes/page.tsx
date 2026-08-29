'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/features/identidade/use-sessao';
import { CentroNotificacoes } from '@/features/notificacoes/centro-notificacoes';

/** Centro de notificações in-app (B13/E13 · NF01). */
export default function PaginaNotificacoes() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
  }, [isLoading, sessao, router]);

  if (isLoading || !sessao) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-5">
        <p role="status" className="font-display text-paper/70">
          Carregando…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center gap-3">
        <Link
          href="/perfil"
          aria-label="Voltar"
          className="flex size-10 items-center justify-center rounded-full border-2 border-paper/40 text-paper hover:border-lime hover:text-lime"
        >
          ←
        </Link>
        <h1 className="font-display text-2xl font-bold">Notificações</h1>
      </header>

      <CentroNotificacoes usuarioId={sessao.usuarioId} />
    </main>
  );
}
