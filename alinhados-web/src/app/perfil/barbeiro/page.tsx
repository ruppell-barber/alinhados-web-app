'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/features/identidade/use-sessao';
import { PerfilBarbeiroForm } from '@/features/perfil/perfil-barbeiro-form';
import {
  carregarPerfilLocal,
  salvarPerfilLocal,
  type PerfilSalvo,
} from '@/features/perfil/perfil-storage';

export default function PaginaPerfilBarbeiro() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const [inicial, setInicial] = useState<PerfilSalvo | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
    // Guarda de tipo: página exclusiva de barbeiro.
    if (sessao && sessao.tipo !== 'barbeiro') router.replace('/perfil');
    if (sessao) setInicial(carregarPerfilLocal(sessao.usuarioId));
  }, [isLoading, sessao, router]);

  // Espera sessão E leitura do perfil salvo, para o form nascer pré-preenchido.
  if (isLoading || !sessao || sessao.tipo !== 'barbeiro' || inicial === undefined) {
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
        <h1 className="font-display text-2xl font-bold">
          {inicial ? 'Editar meu perfil' : 'Meu perfil de barbeiro'}
        </h1>
      </header>

      {/*
       * Persistência local até o endpoint de Perfil existir na alinhados-api
       * (PerfilController + StorageGateway — Wiki C4 1.1.4.2).
       */}
      <PerfilBarbeiroForm
        inicial={inicial}
        onSalvar={(dados, fotoDataUrl) =>
          salvarPerfilLocal(sessao.usuarioId, { dados, fotoDataUrl })
        }
      />
    </main>
  );
}
