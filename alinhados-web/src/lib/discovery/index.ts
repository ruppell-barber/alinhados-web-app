import type { DiscoveryGateway } from './gateway';
import { MockDiscoveryGateway } from './mock-gateway';

/**
 * Ainda não há API de Discovery: usamos o mock. Quando o adapter real existir, a seleção
 * passa por env (como o AuthGateway) — o resto do app depende só da porta `DiscoveryGateway`.
 */
export const discoveryGateway: DiscoveryGateway = new MockDiscoveryGateway();

export type { CardFeed, PerfilPublico, UsuarioFeed, DiscoveryGateway } from './gateway';
