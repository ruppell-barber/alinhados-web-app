'use client';

import type { PerfilPublico } from '@/lib/discovery';
import { Info, Tags, reais } from './ui';

interface PerfilCompletoProps {
  perfil: PerfilPublico;
  onLike: () => void;
  onDislike: () => void;
  onVoltar: () => void;
  ocupado?: boolean;
}

/**
 * Tela de perfil completo (B12/E12 — RF62). View read-only: abrir NÃO conta como swipe.
 * "Voltar" é responsabilidade do deck (que preserva a posição do feed). Os botões de
 * like/dislike aqui chamam os mesmos callbacks do deck.
 */
export function PerfilCompleto({ perfil, onLike, onDislike, onVoltar, ocupado }: PerfilCompletoProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-paper/15 bg-ink/95 px-5 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onVoltar}
            aria-label="Voltar ao feed"
            className="flex size-10 items-center justify-center rounded-full border-2 border-paper/40 text-paper hover:border-lime hover:text-lime"
          >
            ←
          </button>
          <h1 className="font-display text-lg font-bold text-paper">Perfil completo</h1>
        </header>

        <div className="flex flex-1 flex-col gap-5 px-5 py-5 pb-28">
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-card border-2 border-ink bg-paper/10">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">💈</div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold leading-tight text-paper">{perfil.nome}</h2>
              {perfil.cidade && (
                <p className="text-sm text-paper/60">
                  {perfil.cidade}
                  {perfil.estado ? ` · ${perfil.estado}` : ''}
                </p>
              )}
            </div>
          </div>

          {perfil.tipo === 'barbeiro' ? (
            <>
              <div className="rounded-card border-2 border-paper/15 p-4">
                {perfil.apelido_profissional && <Info rotulo="Apelido" valor={perfil.apelido_profissional} />}
                <Info
                  rotulo="Disponibilidade"
                  valor={perfil.esta_desempregado ? 'Disponível agora' : 'Empregado · aberto a propostas'}
                />
                {perfil.anos_experiencia !== null && (
                  <Info rotulo="Tempo de mercado" valor={`${perfil.anos_experiencia} ano(s)`} />
                )}
                {perfil.comissao_desejada !== null && (
                  <Info rotulo="Comissão desejada" valor={`${perfil.comissao_desejada}%`} />
                )}
                {perfil.taxa_ocupacao !== null && (
                  <Info rotulo="Ocupação atual" valor={`${perfil.taxa_ocupacao}%`} />
                )}
                {perfil.faturamento_mensal !== null && (
                  <Info rotulo="Faturamento médio" valor={reais(perfil.faturamento_mensal)} />
                )}
                {perfil.cursos_formacao && <Info rotulo="Cursos" valor={perfil.cursos_formacao} />}
              </div>
              <Secao titulo="Serviços">
                <Tags itens={perfil.servicos} tom="bg-grape text-paper" />
              </Secao>
              <Secao titulo="Valores">
                <Tags itens={perfil.valores} tom="bg-lime text-ink" />
              </Secao>
            </>
          ) : (
            <>
              <div className="rounded-card border-2 border-paper/15 p-4">
                {perfil.nome_decisor && <Info rotulo="Decisor" valor={perfil.nome_decisor} />}
                {perfil.num_cadeiras !== null && <Info rotulo="Cadeiras" valor={String(perfil.num_cadeiras)} />}
                {perfil.num_unidades !== null && (
                  <Info rotulo="Unidades" valor={`${perfil.num_unidades}${perfil.e_franquia ? ' · franquia' : ''}`} />
                )}
                {perfil.comissao_paga !== null && <Info rotulo="Comissão paga" valor={`${perfil.comissao_paga}%`} />}
                <Info
                  rotulo="Fixo de segurança"
                  valor={perfil.tem_fixo ? (perfil.valor_fixo !== null ? reais(perfil.valor_fixo) : 'Sim') : 'Não'}
                />
                <Info rotulo="Clube de assinatura" valor={perfil.tem_clube ? 'Sim' : 'Não'} />
                <Info rotulo="Trabalha com POPs" valor={perfil.tem_pops ? 'Sim' : 'Não'} />
                {perfil.vagas_abertas !== null && (
                  <Info rotulo="Vagas abertas" valor={String(perfil.vagas_abertas)} />
                )}
                {perfil.faturamento_medio !== null && (
                  <Info rotulo="Faturamento médio" valor={reais(perfil.faturamento_medio)} />
                )}
              </div>
              {perfil.tem_clube && perfil.descricao_clube && (
                <Secao titulo="Como funciona o clube">
                  <p className="text-sm text-paper/80">{perfil.descricao_clube}</p>
                </Secao>
              )}
              <Secao titulo="Valores">
                <Tags itens={perfil.valores} tom="bg-lime text-ink" />
              </Secao>
            </>
          )}

          <Secao titulo="Galeria">
            {perfil.fotos.length > 0 ? (
              <ul className="grid grid-cols-2 gap-2">
                {perfil.fotos.map((f, i) => (
                  <li key={i}>
                    <img
                      src={f.url}
                      alt={`Foto ${i + 1}`}
                      className="aspect-square w-full rounded-card border-2 border-paper/20 object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-paper/50">Sem fotos na galeria ainda.</p>
            )}
          </Secao>
        </div>

        {/* Like/dislike também na tela de detalhe (critério B12/E12). */}
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md gap-3 border-t-2 border-paper/15 bg-ink/95 px-5 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onDislike}
            disabled={ocupado}
            className="flex-1 rounded-full border-2 border-danger py-3 font-display text-base font-bold text-danger hover:bg-danger hover:text-ink disabled:opacity-50"
          >
            ✕ Passar
          </button>
          <button
            type="button"
            onClick={onLike}
            disabled={ocupado}
            className="flex-1 rounded-full border-2 border-ink bg-lime py-3 font-display text-base font-bold text-ink shadow-brutal-paper hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
          >
            ♥ Tenho interesse
          </button>
        </div>
      </div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-paper/50">{titulo}</h3>
      {children}
    </section>
  );
}
