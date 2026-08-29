'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/features/identidade/use-sessao';
import { FeedDeck } from '@/features/discovery/feed-deck';
import { carregarPerfilBarbeariaLocal, carregarPerfilLocal } from '@/features/perfil/perfil-storage';
import type { UsuarioFeed } from '@/lib/discovery';

export default function PaginaFeed() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const [usuario, setUsuario] = useState<UsuarioFeed | null>(null);

  useEffect(() => {
    if (!isLoading && !sessao) {
      router.replace('/login');
      return;
    }
    if (sessao) {
      // Cidade/estado vêm do perfil salvo (base do RN03 — compatibilidade por localização).
      const perfil =
        sessao.tipo === 'barbearia'
          ? carregarPerfilBarbeariaLocal(sessao.usuarioId)
          : carregarPerfilLocal(sessao.usuarioId);
      setUsuario({
        usuarioId: sessao.usuarioId,
        tipo: sessao.tipo,
        cidade: perfil?.dados.cidade ?? null,
        estado: perfil?.dados.estado ?? null,
      });
    }
  }, [isLoading, sessao, router]);

  if (isLoading || !sessao || !usuario) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-5">
        <p role="status" className="font-display text-paper/70">
          Carregando…
        </p>
      </main>
    );
  }

  const titulo = sessao.tipo === 'barbearia' ? 'Barbeiros pra você' : 'Barbearias pra você';

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
          <h1 className="font-display text-2xl font-bold">{titulo}</h1>
          <p className="text-sm text-paper/70">Veja quem combina e demonstre interesse.</p>
        </div>
      </header>

      <FeedDeck usuario={usuario} />
    </main>
  );
}
