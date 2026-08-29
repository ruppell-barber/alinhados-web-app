import type { NotificacoesGateway } from './gateway';
import { MockNotificacoesGateway } from './mock-gateway';

/**
 * Sem API de Notificações ainda: usamos o mock. Quando o adapter real existir, a seleção
 * passa por env (como o AuthGateway); o resto do app depende só da porta.
 */
export const notificacoesGateway: NotificacoesGateway = new MockNotificacoesGateway();

export { emitirNotificacao } from './mock-gateway';
export type { NotificacoesGateway } from './gateway';
