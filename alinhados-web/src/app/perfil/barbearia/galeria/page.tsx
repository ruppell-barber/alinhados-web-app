'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSessao } from '@/features/identidade/use-sessao';
import {
  carregarGaleriaLocal,
  carregarTabelaServicosLocal,
  galeriaEstaCompleta,
  MAX_FOTOS_GALERIA,
  MIN_FOTOS_GALERIA,
  salvarGaleriaLocal,
  salvarTabelaServicosLocal,
} from '@/features/perfil/galeria';
import { fotoParaDataUrl } from '@/features/perfil/perfil-storage';
import { adicionarFotos, moverFoto, removerFoto } from '@/features/perfil/portfolio';

export default function PaginaGaleriaBarbearia() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const inputGaleriaRef = useRef<HTMLInputElement>(null);
  const inputTabelaRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<string[] | null>(null);
  const [tabela, setTabela] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
    // Guarda de tipo: página exclusiva de barbearia.
    if (sessao && sessao.tipo !== 'barbearia') router.replace('/perfil');
    if (sessao) {
      setFotos(carregarGaleriaLocal(sessao.usuarioId));
      setTabela(carregarTabelaServicosLocal(sessao.usuarioId));
    }
  }, [isLoading, sessao, router]);

  if (isLoading || !sessao || sessao.tipo !== 'barbearia' || fotos === null) {
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
    if (!salvarGaleriaLocal(sessao!.usuarioId, novasFotos)) {
      setAviso('Espaço de armazenamento local cheio — remova algumas fotos e tente de novo.');
    }
  }

  /** Mesma pipeline da B03: compressão client-side 1200px (RF45) com progresso (RNF02). */
  async function aoSelecionarGaleria(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (arquivos.length === 0) return;

    setAviso(null);
    setProgresso({ atual: 0, total: arquivos.length });

    const comprimidas: string[] = [];
    let falhas = 0;
    for (const [i, arquivo] of arquivos.entries()) {
      try {
        comprimidas.push(await fotoParaDataUrl(arquivo, 1200));
      } catch {
        falhas += 1; // RF49: segue sem travar
      }
      setProgresso({ atual: i + 1, total: arquivos.length });
    }

    const { fotos: proximas, recusadas } = adicionarFotos(fotos!, comprimidas);
    atualizar(proximas);
    setProgresso(null);

    const mensagens: string[] = [];
    if (falhas > 0) mensagens.push(`${falhas} arquivo(s) não puderam ser lidos — tente JPG ou PNG.`);
    if (recusadas > 0) mensagens.push(`Limite de ${MAX_FOTOS_GALERIA} fotos: ${recusadas} ficaram de fora.`);
    if (mensagens.length > 0) setAviso(mensagens.join(' '));
  }

  async function aoSelecionarTabela(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setAviso(null);
    try {
      const dataUrl = await fotoParaDataUrl(arquivo, 1200);
      setTabela(dataUrl);
      if (!salvarTabelaServicosLocal(sessao!.usuarioId, dataUrl)) {
        setAviso('Espaço de armazenamento local cheio — remova algumas fotos e tente de novo.');
      }
    } catch {
      setAviso('Não foi possível ler a foto da tabela — tente JPG ou PNG.'); // RF49
    }
  }

  const completa = galeriaEstaCompleta(fotos);
  const cheia = fotos.length >= MAX_FOTOS_GALERIA;

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
          <h1 className="font-display text-2xl font-bold">Galeria da barbearia</h1>
          <p className="text-sm text-paper/70">
            {fotos.length}/{MAX_FOTOS_GALERIA} fotos · mínimo de {MIN_FOTOS_GALERIA}
          </p>
        </div>
      </header>

      {!completa && (
        <Card tone="tangerine" className="py-3 text-sm font-semibold">
          Faltam {MIN_FOTOS_GALERIA - fotos.length} foto(s) para a galeria contar na completude do
          perfil. Mostre o ambiente da casa!
        </Card>
      )}

      <button
        type="button"
        onClick={() => inputGaleriaRef.current?.click()}
        disabled={cheia || progresso !== null}
        className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-6 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
      >
        {cheia ? `Limite de ${MAX_FOTOS_GALERIA} fotos atingido` : 'Adicionar fotos do ambiente'}
      </button>
      <input
        ref={inputGaleriaRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={aoSelecionarGaleria}
        className="sr-only"
        aria-label="Selecionar fotos da galeria"
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

      {fotos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3" aria-label="Fotos da galeria">
          {fotos.map((foto, indice) => (
            <li key={`${indice}-${foto.slice(-16)}`} className="flex flex-col gap-1.5">
              <img
                src={foto}
                alt={`Foto ${indice + 1} da galeria`}
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

      {/* RF30 — foto da tabela de serviços */}
      <section aria-labelledby="secao-tabela" className="flex flex-col gap-3 rounded-card border-2 border-grape p-4">
        <h2 id="secao-tabela" className="font-display text-lg font-bold text-grape">
          Tabela de serviços
        </h2>
        <p className="text-sm text-paper/70">
          Uma foto da sua tabela de preços/serviços — o barbeiro vê o nível do negócio antes de
          demonstrar interesse.
        </p>

        {tabela && (
          <img
            src={tabela}
            alt="Foto da tabela de serviços"
            className="w-full rounded-card border-2 border-paper/30 object-cover"
          />
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputTabelaRef.current?.click()}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-paper px-4 font-display text-sm font-bold text-paper hover:bg-paper/10"
          >
            {tabela ? 'Trocar foto da tabela' : 'Adicionar foto da tabela'}
          </button>
          {tabela && (
            <button
              type="button"
              onClick={() => {
                setTabela(null);
                salvarTabelaServicosLocal(sessao!.usuarioId, null);
              }}
              aria-label="Remover foto da tabela"
              className="flex size-11 items-center justify-center rounded-full border-2 border-danger text-danger hover:bg-danger hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
        <input
          ref={inputTabelaRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={aoSelecionarTabela}
          className="sr-only"
          aria-label="Selecionar foto da tabela de serviços"
        />
      </section>
    </main>
  );
}
