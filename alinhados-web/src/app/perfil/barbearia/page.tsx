'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/features/identidade/use-sessao';
import { PerfilBarbeariaForm } from '@/features/perfil/perfil-barbearia-form';
import {
  carregarPerfilBarbeariaLocal,
  salvarPerfilBarbeariaLocal,
  type PerfilBarbeariaSalvo,
} from '@/features/perfil/perfil-storage';
import {
  carregarGaleriaLocal,
  carregarTabelaServicosLocal,
  galeriaEstaCompleta,
} from '@/features/perfil/galeria';

export default function PaginaPerfilBarbearia() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const [inicial, setInicial] = useState<PerfilBarbeariaSalvo | null | undefined>(undefined);
  const [galeriaCompleta, setGaleriaCompleta] = useState(false);
  const [temTabela, setTemTabela] = useState(false);

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
    // Guarda de tipo: página exclusiva de barbearia.
    if (sessao && sessao.tipo !== 'barbearia') router.replace('/perfil');
    if (sessao) {
      setInicial(carregarPerfilBarbeariaLocal(sessao.usuarioId));
      setGaleriaCompleta(galeriaEstaCompleta(carregarGaleriaLocal(sessao.usuarioId)));
      setTemTabela(Boolean(carregarTabelaServicosLocal(sessao.usuarioId)));
    }
  }, [isLoading, sessao, router]);

  if (isLoading || !sessao || sessao.tipo !== 'barbearia' || inicial === undefined) {
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
          {inicial ? 'Editar perfil da barbearia' : 'Perfil da barbearia'}
        </h1>
      </header>

      {/* Persistência local até o PerfilController existir na alinhados-api. */}
      <PerfilBarbeariaForm
        inicial={inicial}
        galeriaCompleta={galeriaCompleta}
        temTabelaServicos={temTabela}
        onSalvar={(dados, fotoDataUrl) =>
          salvarPerfilBarbeariaLocal(sessao.usuarioId, { dados, fotoDataUrl })
        }
      />
    </main>
  );
}
