import type { Notificacao, TipoNotificacao } from '@/contracts-local';
import type { NotificacoesGateway } from './gateway';

function chave(usuarioId: string) {
  return `alinhados.notificacoes.${usuarioId}`;
}

function ler(usuarioId: string): Notificacao[] {
  try {
    return JSON.parse(localStorage.getItem(chave(usuarioId)) ?? '[]') as Notificacao[];
  } catch {
    return [];
  }
}

function salvar(usuarioId: string, itens: Notificacao[]) {
  localStorage.setItem(chave(usuarioId), JSON.stringify(itens));
}

function novoId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Cria uma notificação in-app para o usuário. Usada pelo fan-out do Matching quando um
 * alinhamento acontece (Wiki C4: matching → notificações, "Evento de alinhamento").
 * Idempotente por `match_id + tipo`: reprocessar o mesmo evento não duplica a notificação.
 */
export function emitirNotificacao(
  usuarioId: string,
  dados: { tipo: TipoNotificacao; titulo: string; corpo: string; match_id?: string | null },
): Notificacao {
  const itens = ler(usuarioId);
  if (dados.match_id) {
    const existente = itens.find((n) => n.match_id === dados.match_id && n.tipo === dados.tipo);
    if (existente) return existente;
  }
  const notificacao: Notificacao = {
    id: novoId(),
    tipo: dados.tipo,
    titulo: dados.titulo,
    corpo: dados.corpo,
    match_id: dados.match_id ?? null,
    lida: false,
    created_at: new Date().toISOString(),
  };
  salvar(usuarioId, [notificacao, ...itens]);
  return notificacao;
}

/** Notificações em modo dev — persistidas no localStorage por usuário. */
export class MockNotificacoesGateway implements NotificacoesGateway {
  async listar(usuarioId: string): Promise<Notificacao[]> {
    return ler(usuarioId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async contarNaoLidas(usuarioId: string): Promise<number> {
    return ler(usuarioId).filter((n) => !n.lida).length;
  }

  async marcarLida(usuarioId: string, id: string): Promise<void> {
    salvar(
      usuarioId,
      ler(usuarioId).map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );
  }

  async marcarTodasLidas(usuarioId: string): Promise<void> {
    salvar(
      usuarioId,
      ler(usuarioId).map((n) => ({ ...n, lida: true })),
    );
  }
}
