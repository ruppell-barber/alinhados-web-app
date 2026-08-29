'use client';

import type { PerfilBarbeiroPublico } from '@/contracts-local';
import { reais } from './ui';

/**
 * PROPOSTA DE LAYOUT (opcional) — variação "vitrine" do card do feed, inspirada na
 * referência do designer (Padlet): foto full-bleed com gradiente, tiles neon 2×2 e
 * "Valores" como bolinhas coloridas. Não substitui o CardDiscovery entregue na S2;
 * fica aqui como alternativa visual para o time comparar. Mantém a paleta e o contraste
 * dos tokens (RNF13).
 */

const CORES_TILE = ['bg-grape', 'bg-lime', 'bg-tangerine', 'bg-mint'] as const;
const CORES_DOT = ['bg-grape', 'bg-lime', 'bg-tangerine', 'bg-mint', 'bg-paper'] as const;

function Tile({ cor, rotulo, valor }: { cor: string; rotulo: string; valor: string }) {
  return (
    <div className={`rounded-card border-2 border-ink ${cor} p-3 text-ink`}>
      <p className="font-display text-sm font-bold leading-tight opacity-80">{rotulo}</p>
      <p className="font-display text-2xl font-black leading-tight">{valor}</p>
    </div>
  );
}

export function CardVitrine({ barbeiro }: { barbeiro: PerfilBarbeiroPublico }) {
  const tiles = [
    barbeiro.comissao_desejada !== null && {
      rotulo: 'Comissão desejada',
      valor: `${barbeiro.comissao_desejada}%`,
    },
    barbeiro.anos_experiencia !== null && {
      rotulo: 'Tempo de mercado',
      valor: `${barbeiro.anos_experiencia} anos`,
    },
    barbeiro.taxa_ocupacao !== null && {
      rotulo: 'Ocupação atual',
      valor: `${barbeiro.taxa_ocupacao}%`,
    },
    barbeiro.faturamento_mensal !== null && {
      rotulo: 'Faturamento médio',
      valor: reais(barbeiro.faturamento_mensal),
    },
  ].filter(Boolean) as { rotulo: string; valor: string }[];

  return (
    <article className="overflow-hidden rounded-card border-2 border-ink bg-ink shadow-brutal-paper">
      {/* Foto full-bleed + gradiente + nome sobreposto */}
      <div className="relative aspect-[4/5] w-full bg-paper/10">
        {barbeiro.avatar_url ? (
          <img src={barbeiro.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">💈</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="font-display text-3xl font-black leading-none text-paper">
            {barbeiro.nome}
          </h2>
          {barbeiro.apelido_profissional && (
            <p className="mt-1 font-display text-paper/80">“{barbeiro.apelido_profissional}”</p>
          )}
          {barbeiro.cidade && (
            <p className="mt-1 flex items-center gap-1 text-sm text-paper/70">
              <span aria-hidden>📍</span>
              {barbeiro.cidade}
              {barbeiro.estado ? ` · ${barbeiro.estado}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <span
          className={`w-fit rounded-full border-2 border-ink px-3 py-1 font-display text-xs font-bold ${
            barbeiro.esta_desempregado ? 'bg-mint text-ink' : 'bg-tangerine text-ink'
          }`}
        >
          {barbeiro.esta_desempregado
            ? 'Disponível para novas oportunidades'
            : 'Aberto a propostas'}
        </span>

        {tiles.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {tiles.map((t, i) => (
              <Tile
                key={t.rotulo}
                cor={CORES_TILE[i % CORES_TILE.length]}
                rotulo={t.rotulo}
                valor={t.valor}
              />
            ))}
          </div>
        )}

        {barbeiro.servicos.length > 0 && (
          <div>
            <p className="mb-1.5 font-display text-sm font-bold uppercase tracking-wide text-paper/50">
              Serviços
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {barbeiro.servicos.map((s) => (
                <li
                  key={s}
                  className="rounded-full border-2 border-paper/30 px-3 py-0.5 font-display text-xs font-bold text-paper"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {barbeiro.valores.length > 0 && (
          <div>
            <p className="mb-1.5 font-display text-sm font-bold uppercase tracking-wide text-paper/50">
              Valores
            </p>
            <ul
              className="flex flex-wrap gap-2"
              aria-label={`Valores: ${barbeiro.valores.join(', ')}`}
            >
              {barbeiro.valores.map((v, i) => (
                <li
                  key={v}
                  className={`size-6 rounded-full border-2 border-ink ${CORES_DOT[i % CORES_DOT.length]}`}
                  title={v}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
