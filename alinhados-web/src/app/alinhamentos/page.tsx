'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/features/identidade/use-sessao';
import { ListaAlinhamentos } from '@/features/matching/lista-alinhamentos';

/**
 * Lista de alinhamentos do usuário. Para a barbearia é o histórico de contratações (E10);
 * para o barbeiro, "Meus alinhamentos". Só o próprio usuário vê a sua lista.
 */
export default function PaginaAlinhamentos() {
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

  const ehBarbearia = sessao.tipo === 'barbearia';

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
        <div>
          <h1 className="font-display text-2xl font-bold">
            {ehBarbearia ? 'Histórico de contratações' : 'Meus alinhamentos'}
          </h1>
          <p className="text-sm text-paper/70">
            {ehBarbearia
              ? 'Seus alinhamentos e o funil de contratação.'
              : 'Quem se alinhou com você. Continue a conversa.'}
          </p>
        </div>
      </header>

      <ListaAlinhamentos usuarioId={sessao.usuarioId} tipoUsuario={sessao.tipo} />
    </main>
  );
}
