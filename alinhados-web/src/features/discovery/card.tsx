'use client';

import type { CardFeed } from '@/lib/discovery';
import { Info, Tags, reais } from './ui';

/**
 * Card do feed (RF58/RF59) — componente compartilhado E04/B04, parametrizado pelo `tipo`
 * do card exibido. Mostra só os campos públicos (RN08).
 */
export function CardDiscovery({ card }: { card: CardFeed }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-card border-2 border-ink bg-ink-soft shadow-brutal-paper">
      <div className="relative aspect-[4/3] w-full bg-paper/10">
        {card.avatar_url ? (
          <img src={card.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">💈</div>
        )}
        {card.cidade && (
          <span className="absolute left-3 top-3 rounded-full border-2 border-ink bg-lime px-3 py-0.5 font-display text-xs font-bold text-ink">
            {card.cidade}
            {card.estado ? ` · ${card.estado}` : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h2 className="font-display text-2xl font-bold leading-tight text-paper">{card.nome}</h2>

        {card.tipo === 'barbeiro' ? (
          <>
            <span
              className={`w-fit rounded-full border-2 border-ink px-3 py-0.5 font-display text-xs font-bold ${
                card.esta_desempregado ? 'bg-mint text-ink' : 'bg-tangerine text-ink'
              }`}
            >
              {card.esta_desempregado ? 'Disponível agora' : 'Empregado · aberto a propostas'}
            </span>
            <div>
              {card.comissao_desejada !== null && (
                <Info rotulo="Comissão desejada" valor={`${card.comissao_desejada}%`} />
              )}
              {card.taxa_ocupacao !== null && <Info rotulo="Ocupação atual" valor={`${card.taxa_ocupacao}%`} />}
            </div>
            <Tags itens={card.servicos} tom="bg-grape text-paper" />
            <Tags itens={card.valores} tom="bg-lime text-ink" />
          </>
        ) : (
          <>
            <div>
              {card.num_cadeiras !== null && <Info rotulo="Cadeiras" valor={String(card.num_cadeiras)} />}
              {card.comissao_paga !== null && <Info rotulo="Comissão paga" valor={`${card.comissao_paga}%`} />}
              <Info
                rotulo="Fixo de segurança"
                valor={card.tem_fixo ? (card.valor_fixo !== null ? reais(card.valor_fixo) : 'Sim') : 'Não'}
              />
            </div>
            <Tags itens={card.valores} tom="bg-lime text-ink" />
          </>
        )}
      </div>
    </article>
  );
}
