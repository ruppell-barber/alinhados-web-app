'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  MarcarDeuCertoInput,
  ResumoAlinhamento,
  TipoUsuario,
  VisibilidadePosContratacao,
} from '@/contracts-local';
import { matchingGateway } from '@/lib/matching';
import { salvarStatusLocal } from '@/features/perfil/status';

interface Props {
  usuarioId: string;
  matchId: string;
  tipoUsuario: TipoUsuario;
  nomeContraparte: string;
  onConcluido: (resumo: ResumoAlinhamento) => void;
  onFechar: () => void;
}

/** Opções de visibilidade pós-contratação do barbeiro (Seção 6.3). O sistema nunca remove sozinho. */
const OPCOES: { valor: VisibilidadePosContratacao; titulo: string; descricao: string }[] = [
  {
    valor: 'ficar_visivel',
    titulo: 'Continuar aparecendo',
    descricao: 'Seu perfil segue no feed das barbearias.',
  },
  {
    valor: 'sair_do_feed',
    titulo: 'Sair do feed',
    descricao: 'Você para de aparecer, mas mantém a conta.',
  },
  {
    valor: 'arquivar_conta',
    titulo: 'Arquivar minha conta',
    descricao: 'Encerra sua conta na plataforma.',
  },
];

/**
 * Fluxo "Fui contratado" (B08 · RF72). Marca o alinhamento como "Deu certo" — qualquer
 * parte pode marcar (RN15). Quando quem marca é o barbeiro, pergunta o que fazer com a
 * visibilidade (Seção 6.3) e reflete no status do perfil (B09/RN05). Nunca remove sozinho.
 */
export function FuiContratadoModal({
  usuarioId,
  matchId,
  tipoUsuario,
  nomeContraparte,
  onConcluido,
  onFechar,
}: Props) {
  const ehBarbeiro = tipoUsuario === 'barbeiro';
  const [visibilidade, setVisibilidade] = useState<VisibilidadePosContratacao>('ficar_visivel');
  const [enviando, setEnviando] = useState(false);
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelarRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !enviando) onFechar();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onFechar, enviando]);

  async function confirmar() {
    setEnviando(true);
    const input: MarcarDeuCertoInput = {
      matchId,
      visibilidade: ehBarbeiro ? visibilidade : undefined,
    };
    const resumo = await matchingGateway.marcarDeuCerto(usuarioId, input);
    // A decisão do barbeiro reflete no status do feed (B09) — o sistema não decide por ele.
    if (ehBarbeiro && (visibilidade === 'sair_do_feed' || visibilidade === 'arquivar_conta')) {
      salvarStatusLocal(usuarioId, 'indisponivel');
    }
    setEnviando(false);
    if (resumo) onConcluido(resumo);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deu-certo-titulo"
    >
      <div className="w-full max-w-sm rounded-card border-2 border-ink bg-ink-soft p-6 shadow-brutal-paper">
        <h2 id="deu-certo-titulo" className="font-display text-2xl font-black text-paper">
          {ehBarbeiro ? 'Fui contratado! 🎉' : 'Deu certo! 🎉'}
        </h2>
        <p className="mt-2 text-sm text-paper/80">
          {ehBarbeiro
            ? `Marcar o alinhamento com ${nomeContraparte} como contratação realizada.`
            : `Confirmar que a contratação com ${nomeContraparte} deu certo.`}
        </p>

        {ehBarbeiro && (
          <fieldset className="mt-5">
            <legend className="font-display text-sm font-bold text-paper">
              O que fazer com o seu perfil agora?
            </legend>
            <p className="mt-1 text-xs text-paper/50">
              A escolha é sua — a gente nunca tira você do feed automaticamente.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {OPCOES.map((o) => (
                <label
                  key={o.valor}
                  className={`flex cursor-pointer items-start gap-3 rounded-card border-2 p-3 transition-colors ${
                    visibilidade === o.valor ? 'border-lime bg-lime/10' : 'border-paper/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibilidade"
                    value={o.valor}
                    checked={visibilidade === o.valor}
                    onChange={() => setVisibilidade(o.valor)}
                    className="mt-1 accent-lime"
                  />
                  <span>
                    <span className="block font-display font-bold text-paper">{o.titulo}</span>
                    <span className="block text-sm text-paper/60">{o.descricao}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex gap-3">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onFechar}
            disabled={enviando}
            className="flex-1 rounded-full border-2 border-paper/40 py-3 font-display font-bold text-paper transition-colors hover:border-paper disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={enviando}
            className="flex-1 rounded-full border-2 border-ink bg-mint py-3 font-display font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
          >
            {enviando ? 'Salvando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
