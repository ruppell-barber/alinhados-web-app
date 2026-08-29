import { beforeEach, describe, expect, it } from 'vitest';
import { MockNotificacoesGateway, emitirNotificacao } from '@/lib/notificacoes/mock-gateway';
import { tempoRelativo } from '@/features/notificacoes/tempo';

const U = 'u1';

describe('MockNotificacoesGateway (Sprint 3 · Notificações in-app)', () => {
  const gw = new MockNotificacoesGateway();
  beforeEach(() => localStorage.clear());

  it('emite e lista, mais recentes primeiro', async () => {
    emitirNotificacao(U, { tipo: 'alinhamento', titulo: 'A', corpo: 'a', match_id: 'm1' });
    emitirNotificacao(U, { tipo: 'alinhamento', titulo: 'B', corpo: 'b', match_id: 'm2' });
    const lista = await gw.listar(U);
    expect(lista).toHaveLength(2);
    expect(lista[0].titulo).toBe('B');
  });

  it('é idempotente por match_id + tipo (não duplica o mesmo evento)', async () => {
    emitirNotificacao(U, { tipo: 'alinhamento', titulo: 'A', corpo: 'a', match_id: 'm1' });
    emitirNotificacao(U, { tipo: 'alinhamento', titulo: 'A de novo', corpo: 'a2', match_id: 'm1' });
    expect(await gw.listar(U)).toHaveLength(1);
  });

  it('conta não-lidas e marca como lida (badge B13/E13)', async () => {
    const n = emitirNotificacao(U, {
      tipo: 'alinhamento',
      titulo: 'A',
      corpo: 'a',
      match_id: 'm1',
    });
    emitirNotificacao(U, { tipo: 'alinhamento', titulo: 'B', corpo: 'b', match_id: 'm2' });
    expect(await gw.contarNaoLidas(U)).toBe(2);

    await gw.marcarLida(U, n.id);
    expect(await gw.contarNaoLidas(U)).toBe(1);

    await gw.marcarTodasLidas(U);
    expect(await gw.contarNaoLidas(U)).toBe(0);
  });
});

describe('tempoRelativo', () => {
  const base = new Date('2026-08-05T12:00:00Z').getTime();
  const atras = (ms: number) => new Date(base - ms).toISOString();

  it('formata em pt-BR curto', () => {
    expect(tempoRelativo(atras(30_000), base)).toBe('agora');
    expect(tempoRelativo(atras(5 * 60_000), base)).toBe('há 5 min');
    expect(tempoRelativo(atras(3 * 3_600_000), base)).toBe('há 3 h');
    expect(tempoRelativo(atras(2 * 86_400_000), base)).toBe('há 2 d');
  });
});
