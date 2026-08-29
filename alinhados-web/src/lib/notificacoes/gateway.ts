import type { Notificacao } from '@/contracts-local';

/**
 * Porta de Notificações (Sprint 3 · Épico E8). Hoje resolvida pelo mock em localStorage;
 * quando a API existir, entra um adapter real selecionado por env — mesmo padrão do
 * AuthGateway e do DiscoveryGateway. O front só depende desta interface.
 */
export interface NotificacoesGateway {
  /** Lista in-app, mais recentes primeiro (RF70 · NF01). */
  listar(usuarioId: string): Promise<Notificacao[]>;
  /** Contador do badge (B13/E13). */
  contarNaoLidas(usuarioId: string): Promise<number>;
  /** Marca uma notificação como lida (estado lido/não lido). */
  marcarLida(usuarioId: string, id: string): Promise<void>;
  /** Marca todas como lidas (ação do centro de notificações). */
  marcarTodasLidas(usuarioId: string): Promise<void>;
}
