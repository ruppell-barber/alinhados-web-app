'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSessao } from '@/features/identidade/use-sessao';
import { fotoParaDataUrl } from '@/features/perfil/perfil-storage';
import {
  adicionarFotos,
  carregarPortfolioLocal,
  MAX_FOTOS_PORTFOLIO,
  moverFoto,
  removerFoto,
  salvarPortfolioLocal,
} from '@/features/perfil/portfolio';

export default function PaginaPortfolio() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<string[] | null>(null);
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
    // Guarda de tipo: página exclusiva de barbeiro.
    if (sessao && sessao.tipo !== 'barbeiro') router.replace('/perfil');
    if (sessao) setFotos(carregarPortfolioLocal(sessao.usuarioId));
  }, [isLoading, sessao, router]);

  if (isLoading || !sessao || sessao.tipo !== 'barbeiro' || fotos === null) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-5">
        <p role="status" className="font-display text-paper/70">
          Carregando…
        </p>
      </main>
    );
  }

  function atualizar(novasFotos: string[]) {
    setFotos(novasFotos);
    if (!salvarPortfolioLocal(sessao!.usuarioId, novasFotos)) {
      setAviso('Espaço de armazenamento local cheio — remova algumas fotos e tente de novo.');
    }
  }

  /** Seleção múltipla + compressão client-side (máx 1200px — RF45) com progresso (RNF02). */
  async function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = ''; // permite re-selecionar o mesmo arquivo depois
    if (arquivos.length === 0) return;

    setAviso(null);
    setProgresso({ atual: 0, total: arquivos.length });

    const comprimidas: string[] = [];
    let falhas = 0;
    for (const [i, arquivo] of arquivos.entries()) {
      try {
        comprimidas.push(await fotoParaDataUrl(arquivo, 1200));
      } catch {
        falhas += 1; // RF49: erro claro sem travar o fluxo — as demais seguem
      }
      setProgresso({ atual: i + 1, total: arquivos.length });
    }

    const { fotos: proximas, recusadas } = adicionarFotos(fotos!, comprimidas);
    atualizar(proximas);
    setProgresso(null);

    const mensagens: string[] = [];
    if (falhas > 0) mensagens.push(`${falhas} arquivo(s) não puderam ser lidos — tente JPG ou PNG.`);
    if (recusadas > 0) mensagens.push(`Limite de ${MAX_FOTOS_PORTFOLIO} fotos: ${recusadas} ficaram de fora.`);
    if (mensagens.length > 0) setAviso(mensagens.join(' '));
  }

  const cheio = fotos.length >= MAX_FOTOS_PORTFOLIO;

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
          <h1 className="font-display text-2xl font-bold">Meu portfólio</h1>
          <p className="text-sm text-paper/70">
            {fotos.length}/{MAX_FOTOS_PORTFOLIO} fotos · mostre seu nível técnico
          </p>
        </div>
      </header>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={cheio || progresso !== null}
        className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-6 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
      >
        {cheio ? `Limite de ${MAX_FOTOS_PORTFOLIO} fotos atingido` : 'Adicionar fotos'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={aoSelecionar}
        className="sr-only"
        aria-label="Selecionar fotos do portfólio"
      />

      {progresso && (
        <Progress
          valor={(progresso.atual / progresso.total) * 100}
          rotulo={`Preparando fotos (${progresso.atual}/${progresso.total})`}
        />
      )}

      {aviso && (
        <Card tone="tangerine" role="alert" className="py-3 text-sm font-semibold">
          {aviso}
        </Card>
      )}

      {fotos.length === 0 && !progresso ? (
        <Card tone="dark">
          <p className="text-paper/80">
            Nenhuma foto ainda. Capriche: barbearias decidem muito pelo portfólio. 💈
          </p>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-3" aria-label="Fotos do portfólio">
          {fotos.map((foto, indice) => (
            <li key={`${indice}-${foto.slice(-16)}`} className="flex flex-col gap-1.5">
              <img
                src={foto}
                alt={`Foto ${indice + 1} do portfólio`}
                className="aspect-square w-full rounded-card border-2 border-paper/30 object-cover"
              />
              <div className="flex justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => atualizar(moverFoto(fotos, indice, indice - 1))}
                  disabled={indice === 0}
                  aria-label={`Mover foto ${indice + 1} para antes`}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-paper/40 text-paper hover:border-lime hover:text-lime disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => atualizar(removerFoto(fotos, indice))}
                  aria-label={`Remover foto ${indice + 1}`}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-danger text-danger hover:bg-danger hover:text-ink"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => atualizar(moverFoto(fotos, indice, indice + 1))}
                  disabled={indice === fotos.length - 1}
                  aria-label={`Mover foto ${indice + 1} para depois`}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-paper/40 text-paper hover:border-lime hover:text-lime disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
