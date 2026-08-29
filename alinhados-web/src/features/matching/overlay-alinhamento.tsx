'use client';

import { useEffect, useRef } from 'react';
import type { ResumoAlinhamento } from '@/contracts-local';

interface OverlayAlinhamentoProps {
  alinhamento: ResumoAlinhamento;
  onIrParaConversa: () => void;
  onContinuar: () => void;
}

/**
 * Overlay "Alinhamento Encontrado!" (RF67/RF68) — componente compartilhado B06 (lado
 * barbeiro) e E06 (lado barbearia); o texto se adapta pela `contraparte.tipo`. Aparece
 * quando o like é mútuo e o app está aberto. Fechar ("Continuar navegando") NÃO bloqueia
 * a navegação: só dispensa o overlay. Acessível: role=dialog, foco inicial e Esc = fechar.
 */
export function OverlayAlinhamento({
  alinhamento,
  onIrParaConversa,
  onContinuar,
}: OverlayAlinhamentoProps) {
  const continuarRef = useRef<HTMLButtonElement>(null);
  const { contraparte } = alinhamento;
  const quem = contraparte.tipo === 'barbearia' ? 'a barbearia' : 'o barbeiro';

  useEffect(() => {
    continuarRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onContinuar();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onContinuar]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alinhamento-titulo"
    >
      <div className="anim-alinhamento w-full max-w-sm rounded-card border-2 border-ink bg-ink-soft p-6 text-center shadow-brutal-paper">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-lime">
          Deu match no jeito certo
        </p>
        <h2 id="alinhamento-titulo" className="mt-1 font-display text-3xl font-black text-paper">
          Alinhamento encontrado! 💈
        </h2>

        <div className="mx-auto mt-5 size-28 overflow-hidden rounded-full border-4 border-lime bg-paper/10">
          {contraparte.avatar_url ? (
            <img src={contraparte.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">💈</div>
          )}
        </div>

        <p className="mt-4 text-paper/80">
          Você e {quem}{' '}
          <span className="font-display font-bold text-paper">
            {contraparte.nome ?? 'sem nome'}
          </span>{' '}
          demonstraram interesse. Agora é só conversar.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onIrParaConversa}
            className="rounded-full border-2 border-ink bg-lime py-3 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Ir para a conversa
          </button>
          <button
            ref={continuarRef}
            type="button"
            onClick={onContinuar}
            className="rounded-full border-2 border-paper/40 py-3 font-display text-base font-bold text-paper transition-colors hover:border-paper"
          >
            Continuar navegando
          </button>
        </div>
      </div>
    </div>
  );
}
