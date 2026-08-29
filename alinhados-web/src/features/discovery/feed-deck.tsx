'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DirecaoSwipe, ResumoAlinhamento } from '@/contracts-local';
import {
  discoveryGateway,
  type CardFeed,
  type PerfilPublico,
  type UsuarioFeed,
} from '@/lib/discovery';
import { matchingGateway } from '@/lib/matching';
import { OverlayAlinhamento } from '@/features/matching/overlay-alinhamento';
import { verificarInteracao } from '@/features/perfil/gate-interacao';
import { CompletarPerfilModal } from '@/features/perfil/completar-perfil-modal';
import { CardDiscovery } from './card';
import { PerfilCompleto } from './perfil-completo';

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-card border-2 border-paper/20 bg-ink-soft p-6 text-center"
      role="status"
    >
      {children}
    </div>
  );
}

/**
 * Deck do feed do Discovery (E04/B04 + B05/E05). Carrega os cards do lado oposto, registra
 * like/dislike (avança pro próximo, irreversível — RN14), abre o perfil completo sem contar
 * swipe (B12/E12) e mostra o empty state quando os cards acabam.
 */
export function FeedDeck({ usuario }: { usuario: UsuarioFeed }) {
  const router = useRouter();
  const [cards, setCards] = useState<CardFeed[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [alinhamento, setAlinhamento] = useState<ResumoAlinhamento | null>(null);
  const [completudeBloqueio, setCompletudeBloqueio] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    discoveryGateway
      .buscarFeed(usuario)
      .then((c) => ativo && setCards(c))
      .catch(() => ativo && setErro('Não foi possível carregar o feed. Tente de novo.'));
    return () => {
      ativo = false;
    };
  }, [usuario]);

  const alvo = usuario.tipo === 'barbearia' ? 'barbeiros' : 'barbearias';

  if (erro) return <Aviso>{erro}</Aviso>;
  if (cards === null) return <Aviso>Carregando o feed…</Aviso>;

  const atual: CardFeed | undefined = cards[indice];

  async function swipe(direction: DirecaoSwipe) {
    if (!atual || ocupado) return;
    // RN01: ver o feed é livre, mas só interage quem tem o perfil completo.
    const gate = verificarInteracao(usuario.usuarioId, usuario.tipo);
    if (!gate.podeInteragir) {
      setPerfil(null); // fecha o detalhe se estava aberto
      setCompletudeBloqueio(gate.completude);
      return;
    }
    const alvo = atual; // fixa o alvo antes de avançar o índice
    setOcupado(true);
    try {
      await discoveryGateway.registrarSwipe(usuario.usuarioId, alvo.id, direction);
      setPerfil(null); // fecha o detalhe se estava aberto
      setIndice((i) => i + 1); // avança — o perfil avaliado não volta (RN04)
      if (direction === 'like') {
        // Like mútuo vira alinhamento (RF64/RN09); o back detecta, o front reflete no overlay.
        const resultado = await matchingGateway.avaliarAposLike(usuario.usuarioId, {
          id: alvo.id,
          nome: alvo.nome,
          avatar_url: alvo.avatar_url,
          cidade: alvo.cidade,
          estado: alvo.estado,
          tipo: alvo.tipo,
        });
        if (resultado) setAlinhamento(resultado);
      }
    } finally {
      setOcupado(false);
    }
  }

  async function abrirPerfil() {
    if (!atual) return;
    const p = await discoveryGateway.buscarPerfilCompleto(atual.id); // read-only, não conta swipe
    if (p) setPerfil(p);
  }

  if (!atual) {
    return (
      <Aviso>
        <p className="font-display text-xl font-bold text-paper">Por enquanto é só! 💈</p>
        <p className="mt-2 text-paper/70">
          Você já viu todos os {alvo} compatíveis com o seu perfil. Novos aparecem aqui conforme
          entram na plataforma.
        </p>
      </Aviso>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm text-paper/50">
          {cards.length - indice} {alvo} no feed
        </p>

        <button
          type="button"
          onClick={abrirPerfil}
          className="block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          aria-label={`Ver perfil completo de ${atual.nome ?? 'perfil'}`}
        >
          <CardDiscovery card={atual} />
        </button>
        <p className="text-center text-xs text-paper/40">
          Toque no card para ver o perfil completo
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => swipe('dislike')}
            disabled={ocupado}
            className="flex-1 rounded-full border-2 border-danger py-3 font-display text-base font-bold text-danger transition-colors hover:bg-danger hover:text-ink disabled:opacity-50"
          >
            ✕ Passar
          </button>
          <button
            type="button"
            onClick={() => swipe('like')}
            disabled={ocupado}
            className="flex-1 rounded-full border-2 border-ink bg-lime py-3 font-display text-base font-bold text-ink shadow-brutal-paper transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
          >
            ♥ Tenho interesse
          </button>
        </div>
      </div>

      {perfil && (
        <PerfilCompleto
          perfil={perfil}
          onLike={() => swipe('like')}
          onDislike={() => swipe('dislike')}
          onVoltar={() => setPerfil(null)}
          ocupado={ocupado}
        />
      )}

      {alinhamento && (
        <OverlayAlinhamento
          alinhamento={alinhamento}
          onIrParaConversa={() => router.push(`/alinhamentos/${alinhamento.id}`)}
          onContinuar={() => setAlinhamento(null)}
        />
      )}

      {completudeBloqueio !== null && (
        <CompletarPerfilModal
          completude={completudeBloqueio}
          onFechar={() => setCompletudeBloqueio(null)}
        />
      )}
    </>
  );
}
