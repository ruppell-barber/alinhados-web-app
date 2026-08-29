'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notificacoesGateway } from '@/lib/notificacoes';

/**
 * Sino de notificações com badge de contador de não-lidas (B13/E13). Link para o centro
 * de notificações. O contador é lido na montagem; sem realtime no mock, atualiza a cada
 * visita à tela que o renderiza.
 */
export function SinoNotificacoes({ usuarioId }: { usuarioId: string }) {
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    let ativo = true;
    notificacoesGateway.contarNaoLidas(usuarioId).then((n) => ativo && setNaoLidas(n));
    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  return (
    <Link
      href="/notificacoes"
      aria-label={`Notificações${naoLidas > 0 ? `, ${naoLidas} não lidas` : ''}`}
      className="relative flex size-11 items-center justify-center rounded-full border-2 border-paper/40 text-xl text-paper transition-colors hover:border-lime hover:text-lime"
    >
      <span aria-hidden>🔔</span>
      {naoLidas > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-ink bg-danger px-1 font-display text-xs font-bold text-paper">
          {naoLidas > 9 ? '9+' : naoLidas}
        </span>
      )}
    </Link>
  );
}
