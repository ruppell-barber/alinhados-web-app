import type { DirecaoSwipe } from '@/contracts-local';
import type { CardFeed, DiscoveryGateway, PerfilPublico, UsuarioFeed } from './gateway';
import { BARBEARIAS_SEED, BARBEIROS_SEED } from './seed';
import {
  cardBarbeariaDe,
  cardBarbeiroDe,
  excluirVistos,
  ordenarPorProximidade,
  perfilBarbeiroPublicoDe,
} from './feed-regras';

interface SwipeRegistrado {
  swipedId: string;
  direction: DirecaoSwipe;
  ts: number;
}

function chaveSwipes(usuarioId: string) {
  return `alinhados.swipes.${usuarioId}`;
}

/** Swipes que o usuário já deu (base do RN04 e da idempotência do RF57). */
export function lerSwipes(usuarioId: string): SwipeRegistrado[] {
  try {
    return JSON.parse(localStorage.getItem(chaveSwipes(usuarioId)) ?? '[]') as SwipeRegistrado[];
  } catch {
    return [];
  }
}

/**
 * Discovery em modo dev — dados do `seed`, swipes no localStorage. Ativo enquanto a API
 * não existe. Aplica no cliente as mesmas regras que o servidor aplicaria (RN01–RN06).
 */
export class MockDiscoveryGateway implements DiscoveryGateway {
  async buscarFeed(usuario: UsuarioFeed): Promise<CardFeed[]> {
    await new Promise((r) => setTimeout(r, 250)); // simula latência p/ mostrar o loading
    const vistos = new Set(lerSwipes(usuario.usuarioId).map((s) => s.swipedId));

    if (usuario.tipo === 'barbearia') {
      const disponiveis = BARBEIROS_SEED.filter((b) => b.disponivel); // RN05
      return ordenarPorProximidade(excluirVistos(disponiveis, vistos), usuario) // RN04 + RN03
        .map((b) => ({ tipo: 'barbeiro' as const, ...cardBarbeiroDe(b) }));
    }

    const contratando = BARBEARIAS_SEED.filter((e) => e.esta_contratando); // RN06
    return ordenarPorProximidade(excluirVistos(contratando, vistos), usuario) // RN04 + RN03
      .map((e) => ({ tipo: 'barbearia' as const, ...cardBarbeariaDe(e) }));
  }

  async registrarSwipe(usuarioId: string, swipedId: string, direction: DirecaoSwipe): Promise<void> {
    const swipes = lerSwipes(usuarioId);
    // Idempotente e irreversível (RN14): se já existe swipe nesse par, mantém o original.
    if (swipes.some((s) => s.swipedId === swipedId)) return;
    swipes.push({ swipedId, direction, ts: Date.now() });
    localStorage.setItem(chaveSwipes(usuarioId), JSON.stringify(swipes));
  }

  async buscarPerfilCompleto(id: string): Promise<PerfilPublico | null> {
    const barbeiro = BARBEIROS_SEED.find((b) => b.id === id);
    if (barbeiro) return { tipo: 'barbeiro', ...perfilBarbeiroPublicoDe(barbeiro) }; // `disponivel` não vaza
    const barbearia = BARBEARIAS_SEED.find((e) => e.id === id);
    if (barbearia) return { tipo: 'barbearia', ...barbearia };
    return null;
  }
}
