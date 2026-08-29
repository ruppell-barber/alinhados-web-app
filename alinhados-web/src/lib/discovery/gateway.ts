import type {
  CardBarbeiro,
  CardBarbearia,
  DirecaoSwipe,
  PerfilBarbeiroPublico,
  PerfilBarbeariaPublico,
  TipoUsuario,
} from '@/contracts-local';

/** Card do feed com discriminante `tipo` para o componente saber o que renderizar. */
export type CardFeed =
  | ({ tipo: 'barbeiro' } & CardBarbeiro)
  | ({ tipo: 'barbearia' } & CardBarbearia);

export type PerfilPublico =
  | ({ tipo: 'barbeiro' } & PerfilBarbeiroPublico)
  | ({ tipo: 'barbearia' } & PerfilBarbeariaPublico);

export interface UsuarioFeed {
  usuarioId: string;
  tipo: TipoUsuario;
  cidade?: string | null;
  estado?: string | null;
}

/**
 * Porta do Discovery (Sprint 2). Hoje resolvida pelo MockDiscoveryGateway; quando a
 * API existir, entra um adapter real selecionado por env — mesmo padrão do AuthGateway.
 */
export interface DiscoveryGateway {
  /** Cards do lado OPOSTO (RN02), filtrados (RN01/04/05/06) e ordenados por proximidade (RN03). */
  buscarFeed(usuario: UsuarioFeed): Promise<CardFeed[]>;
  /** Registra like/dislike (RF57). Idempotente e irreversível na V1 (RN14). */
  registrarSwipe(usuarioId: string, swipedId: string, direction: DirecaoSwipe): Promise<void>;
  /** Perfil completo read-only (RF62). Não dispara swipe. */
  buscarPerfilCompleto(id: string): Promise<PerfilPublico | null>;
}
