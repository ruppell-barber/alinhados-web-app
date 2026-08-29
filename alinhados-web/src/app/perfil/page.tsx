'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSair, useSessao } from '@/features/identidade/use-sessao';
import { SinoNotificacoes } from '@/features/notificacoes/sino-notificacoes';
import { calcularCompletude } from '@/features/perfil/completude';
import { calcularCompletudeBarbearia } from '@/features/perfil/completude-barbearia';
import {
  carregarPerfilBarbeariaLocal,
  carregarPerfilLocal,
  salvarPerfilBarbeariaLocal,
  type PerfilBarbeariaSalvo,
  type PerfilSalvo,
} from '@/features/perfil/perfil-storage';
import { carregarPortfolioLocal } from '@/features/perfil/portfolio';
import { StatusSelector } from '@/features/perfil/status-selector';
import { ContratacaoToggle } from '@/features/perfil/contratacao-toggle';
import { carregarStatusLocal, salvarStatusLocal } from '@/features/perfil/status';
import type { StatusPerfil } from '@/contracts-local';
import {
  carregarGaleriaLocal,
  carregarTabelaServicosLocal,
  galeriaEstaCompleta,
  MAX_FOTOS_GALERIA,
  MIN_FOTOS_GALERIA,
} from '@/features/perfil/galeria';

const linkPrimario =
  'inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-mint px-6 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5';
const linkSecundario =
  'inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-grape px-6 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5';
const linkOutline =
  'inline-flex min-h-12 items-center justify-center rounded-full border-2 border-paper px-6 font-display text-base font-bold text-paper transition-colors hover:bg-paper/10';

export default function PaginaPerfil() {
  const router = useRouter();
  const { data: sessao, isLoading } = useSessao();
  const sair = useSair();
  const [perfil, setPerfil] = useState<PerfilSalvo | null>(null);
  const [perfilBarbearia, setPerfilBarbearia] = useState<PerfilBarbeariaSalvo | null>(null);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [galeria, setGaleria] = useState<string[]>([]);
  const [temTabela, setTemTabela] = useState(false);
  const [status, setStatus] = useState<StatusPerfil>('disponivel');

  useEffect(() => {
    if (!isLoading && !sessao) router.replace('/login');
    if (sessao) {
      setPerfil(carregarPerfilLocal(sessao.usuarioId));
      setPerfilBarbearia(carregarPerfilBarbeariaLocal(sessao.usuarioId));
      setPortfolio(carregarPortfolioLocal(sessao.usuarioId));
      setGaleria(carregarGaleriaLocal(sessao.usuarioId));
      setTemTabela(Boolean(carregarTabelaServicosLocal(sessao.usuarioId)));
      setStatus(carregarStatusLocal(sessao.usuarioId));
    }
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

  const ehBarbeiro = sessao.tipo === 'barbeiro';
  const perfilAtual = ehBarbeiro ? perfil : perfilBarbearia;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-paper/70">Você está logado como</p>
          <p className="truncate font-display font-bold">{sessao.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SinoNotificacoes usuarioId={sessao.usuarioId} />
          <Button variant="outline" onClick={() => sair.mutate()} disabled={sair.isPending}>
            {sair.isPending ? 'Saindo…' : 'Sair'}
          </Button>
        </div>
      </header>

      {/* RN01: ver o feed é livre mesmo sem perfil completo (interagir que exige — gate no feed). */}
      <Link href="/feed" className={linkPrimario}>
        {ehBarbeiro ? '🔥 Descobrir barbearias' : '🔥 Descobrir barbeiros'}
      </Link>

      {perfilAtual && (
        <Link href="/alinhamentos" className={linkSecundario}>
          {ehBarbeiro ? '💬 Meus alinhamentos' : '📋 Histórico de contratações'}
        </Link>
      )}

      {!perfilAtual ? (
        <>
          <Card tone="grape" className="rotate-[1deg]">
            <h1 className="font-display text-2xl font-bold">
              {ehBarbeiro ? 'Bora se alinhar! 💈' : 'Bora encontrar seu time! 💈'}
            </h1>
            <p className="mt-2">
              Perfis completos aparecem primeiro no feed. Leva menos de 5 minutos.
            </p>
          </Card>

          <Link
            href={ehBarbeiro ? '/perfil/barbeiro' : '/perfil/barbearia'}
            className={linkPrimario}
          >
            {ehBarbeiro ? 'Completar meu perfil' : 'Completar perfil da barbearia'}
          </Link>
        </>
      ) : ehBarbeiro && perfil ? (
        <>
          <Card tone="paper" className="flex items-center gap-4">
            <img
              src={perfil.fotoDataUrl}
              alt={`Foto de perfil de ${perfil.dados.nome}`}
              className="size-20 shrink-0 rounded-full border-2 border-ink object-cover"
            />
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold">{perfil.dados.nome}</h1>
              {perfil.dados.apelido_profissional && (
                <p className="truncate text-sm">“{perfil.dados.apelido_profissional}”</p>
              )}
              <p className="text-sm">
                {perfil.dados.cidade}, {perfil.dados.estado} · {perfil.dados.anos_experiencia}{' '}
                {perfil.dados.anos_experiencia === 1 ? 'ano' : 'anos'} de mercado
              </p>
            </div>
          </Card>

          {perfil.dados.servicos.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Serviços">
              {perfil.dados.servicos.map((servico) => (
                <li
                  key={servico}
                  className="rounded-full border-2 border-ink bg-grape px-3 py-1 text-sm font-bold text-ink"
                >
                  {servico}
                </li>
              ))}
            </ul>
          )}

          <Progress valor={calcularCompletude(perfil.dados, true)} rotulo="Completude do perfil" />

          {/* B09 — status controla a aparição no feed (RN05) */}
          <StatusSelector
            status={status}
            onChange={(novo) => {
              setStatus(novo);
              salvarStatusLocal(sessao.usuarioId, novo);
            }}
            barbeariaAtual={perfil.dados.barbearia_atual}
            estaDesempregado={perfil.dados.esta_desempregado}
          />

          <Link href="/perfil/barbeiro/portfolio" className={linkSecundario}>
            Meu portfólio ({portfolio.length}/10)
          </Link>

          <Link href="/perfil/barbeiro" className={linkOutline}>
            Editar meu perfil
          </Link>
        </>
      ) : (
        perfilBarbearia && (
          <>
            <Card tone="paper" className="flex items-center gap-4">
              <img
                src={perfilBarbearia.fotoDataUrl}
                alt={`Foto da barbearia ${perfilBarbearia.dados.nome}`}
                className="size-20 shrink-0 rounded-2xl border-2 border-ink object-cover"
              />
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-bold">
                  {perfilBarbearia.dados.nome}
                </h1>
                <p className="truncate text-sm">Decisor: {perfilBarbearia.dados.nome_decisor}</p>
                <p className="text-sm">
                  {perfilBarbearia.dados.cidade}, {perfilBarbearia.dados.estado} ·{' '}
                  {perfilBarbearia.dados.num_cadeiras}{' '}
                  {perfilBarbearia.dados.num_cadeiras === 1 ? 'cadeira' : 'cadeiras'}
                </p>
              </div>
            </Card>

            {perfilBarbearia.dados.valores.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Valores da casa">
                {perfilBarbearia.dados.valores.map((valor) => (
                  <li
                    key={valor}
                    className="rounded-full border-2 border-ink bg-lime px-3 py-1 text-sm font-bold text-ink"
                  >
                    {valor}
                  </li>
                ))}
              </ul>
            )}

            <Progress
              valor={calcularCompletudeBarbearia(
                perfilBarbearia.dados,
                true,
                galeriaEstaCompleta(galeria),
                temTabela,
              )}
              rotulo="Completude do perfil"
            />

            {/* E08 — pausa sobrepõe as vagas (RF40/RN06) */}
            <ContratacaoToggle
              estaContratando={perfilBarbearia.dados.esta_contratando}
              vagasAbertas={perfilBarbearia.dados.vagas_abertas}
              onChange={(estaContratando) => {
                const atualizado = {
                  ...perfilBarbearia,
                  dados: { ...perfilBarbearia.dados, esta_contratando: estaContratando },
                };
                setPerfilBarbearia(atualizado);
                salvarPerfilBarbeariaLocal(sessao.usuarioId, atualizado);
              }}
            />

            <Link href="/perfil/barbearia/vagas" className={linkSecundario}>
              Vagas abertas ({perfilBarbearia.dados.vagas_abertas ?? 0})
            </Link>

            <Link href="/perfil/barbearia/galeria" className={linkSecundario}>
              Galeria ({galeria.length}/{MAX_FOTOS_GALERIA} · mín {MIN_FOTOS_GALERIA})
            </Link>

            <Link href="/perfil/barbearia" className={linkOutline}>
              Editar perfil da barbearia
            </Link>
          </>
        )
      )}
    </main>
  );
}
