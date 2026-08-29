'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSessao } from '@/features/identidade/use-sessao';
import {
  carregarPerfilBarbeariaLocal,
  salvarPerfilBarbeariaLocal,
  type PerfilBarbeariaSalvo,
} from '@/features/perfil/perfil-storage';
import {
  abrirVaga,
  carregarVagasLocal,
  contarAbertas,
  encerrarVaga,
  reabrirVaga,
  salvarVagasLocal,
  type Vaga,
} from '@/features/perfil/vagas';

export default function PaginaVagas() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const [vagas, setVagas] = useState<Vaga[] | null>(null);
  const [perfil, setPerfil] = useState<PerfilBarbeariaSalvo | null>(null);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
    // Guarda de tipo: página exclusiva de barbearia.
    if (sessao && sessao.tipo !== 'barbearia') router.replace('/perfil');
    if (sessao) {
      setVagas(carregarVagasLocal(sessao.usuarioId));
      setPerfil(carregarPerfilBarbeariaLocal(sessao.usuarioId));
    }
  }, [isLoading, sessao, router]);

  if (isLoading || !sessao || sessao.tipo !== 'barbearia' || vagas === null) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-5">
        <p role="status" className="font-display text-paper/70">
          Carregando…
        </p>
      </main>
    );
  }

  const abertas = contarAbertas(vagas);
  const cadeiras = perfil?.dados.num_cadeiras;
  const pausada = perfil ? !perfil.dados.esta_contratando : false;

  /** Persiste a lista e espelha o total em barbearia_details.vagas_abertas (RF39). */
  function atualizar(novasVagas: Vaga[]) {
    setVagas(novasVagas);
    salvarVagasLocal(sessao!.usuarioId, novasVagas);
    if (perfil) {
      const atualizado = {
        ...perfil,
        dados: { ...perfil.dados, vagas_abertas: contarAbertas(novasVagas) },
      };
      setPerfil(atualizado);
      salvarPerfilBarbeariaLocal(sessao!.usuarioId, atualizado);
    }
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
        <div>
          <h1 className="font-display text-2xl font-bold">Vagas abertas</h1>
          <p className="text-sm text-paper/70">
            {abertas} ativa(s){cadeiras !== undefined && ` · ${cadeiras} cadeira(s) na casa`}
          </p>
        </div>
      </header>

      {pausada && (
        <Card tone="tangerine" role="status" className="py-3 text-sm font-semibold">
          Contratação pausada: as vagas continuam registradas, mas ficam ocultas do feed até
          você reativar em “Estamos contratando”.
        </Card>
      )}

      {cadeiras !== undefined && abertas > cadeiras && (
        <Card tone="tangerine" role="alert" className="py-3 text-sm font-semibold">
          Você tem mais vagas abertas ({abertas}) do que cadeiras ({cadeiras}) — confira se faz
          sentido.
        </Card>
      )}

      {/* RF39/RF41 — abrir vagas individualmente */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          atualizar(abrirVaga(vagas, titulo));
          setTitulo('');
        }}
        className="flex gap-2"
      >
        <label htmlFor="titulo-vaga" className="sr-only">
          Descrição da vaga
        </label>
        <input
          id="titulo-vaga"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Cadeira 2 — turno da tarde"
          className="min-h-12 w-full rounded-xl border-2 border-paper/30 bg-ink-soft px-4 text-base text-paper placeholder:text-paper/40 focus:border-lime"
        />
        <button
          type="submit"
          disabled={!titulo.trim()}
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-mint px-5 font-display text-sm font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          Abrir
        </button>
      </form>

      {vagas.length === 0 ? (
        <Card tone="dark">
          <p className="text-paper/80">
            Nenhuma vaga ainda. Abra uma vaga por cadeira/turno — dá pra manter várias ao mesmo
            tempo. 💈
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Vagas">
          {vagas.map((vaga) => (
            <li
              key={vaga.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-card border-2 p-4',
                vaga.aberta ? 'border-lime bg-ink-soft' : 'border-paper/20 bg-ink-soft opacity-70',
              )}
            >
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-paper">{vaga.titulo}</p>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full border-2 border-ink px-2 py-0.5 font-display text-[0.65rem] font-bold',
                    vaga.aberta ? 'bg-mint text-ink' : 'bg-paper/40 text-ink',
                  )}
                >
                  {vaga.aberta ? 'Aberta' : 'Encerrada'}
                </span>
              </div>

              {vaga.aberta ? (
                <button
                  type="button"
                  onClick={() => atualizar(encerrarVaga(vagas, vaga.id))}
                  className="shrink-0 rounded-full border-2 border-tangerine px-4 py-1.5 font-display text-xs font-bold text-tangerine hover:bg-tangerine hover:text-ink"
                >
                  Encerrar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => atualizar(reabrirVaga(vagas, vaga.id))}
                  className="shrink-0 rounded-full border-2 border-paper/40 px-4 py-1.5 font-display text-xs font-bold text-paper hover:border-lime hover:text-lime"
                >
                  Reabrir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
