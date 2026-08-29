'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';

/**
 * Modal de bloqueio de interação (RN01). Aparece quando o usuário tenta dar match sem o
 * perfil completo. Não bloqueia a navegação — só a ação de interagir. Acessível: role=dialog,
 * foco inicial e Esc = fechar.
 */
export function CompletarPerfilModal({
  completude,
  onFechar,
}: {
  completude: number;
  onFechar: () => void;
}) {
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fecharRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completar-titulo"
    >
      <div className="w-full max-w-sm rounded-card border-2 border-ink bg-ink-soft p-6 text-center shadow-brutal-paper">
        <p className="text-4xl" aria-hidden>
          🔒
        </p>
        <h2 id="completar-titulo" className="mt-2 font-display text-2xl font-black text-paper">
          Complete seu perfil para dar match
        </h2>
        <p className="mt-2 text-sm text-paper/70">
          Pode explorar o feed à vontade! Mas, pra demonstrar interesse, seu perfil precisa estar
          completo — foto, dados, serviços e portfólio/galeria.
        </p>

        <div className="mt-4">
          <Progress valor={completude} rotulo="Completude do seu perfil" />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/perfil"
            className="rounded-full border-2 border-ink bg-lime py-3 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Completar meu perfil
          </Link>
          <button
            ref={fecharRef}
            type="button"
            onClick={onFechar}
            className="rounded-full border-2 border-paper/40 py-3 font-display text-base font-bold text-paper transition-colors hover:border-paper"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
