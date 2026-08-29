import { beforeEach, describe, expect, it } from 'vitest';
import type { ContraparteAlinhamento } from '@/contracts-local';
import { MockMatchingGateway, statusDe } from '@/lib/matching/mock-gateway';
import { MockNotificacoesGateway } from '@/lib/notificacoes/mock-gateway';

// Barbearia do Zé (SP) está na lista "já curtiu" do mock → like nela gera alinhamento.
const JA_CURTIU: ContraparteAlinhamento = {
  id: '20000000-0000-4000-8000-000000000001',
  nome: 'Barbearia do Zé',
  avatar_url: null,
  cidade: 'São Paulo',
  estado: 'SP',
  tipo: 'barbearia',
};
// Corte Nobre não pré-curtiu → like nela não gera alinhamento.
const NAO_CURTIU: ContraparteAlinhamento = {
  id: '20000000-0000-4000-8000-000000000002',
  nome: 'Corte Nobre',
  avatar_url: null,
  cidade: 'Santos',
  estado: 'SP',
  tipo: 'barbearia',
};

const USUARIO = 'u-barbeiro';

describe('MockMatchingGateway (Sprint 3 · Alinhamento)', () => {
  const gw = new MockMatchingGateway();
  beforeEach(() => localStorage.clear());

  it('RF64/RN09: dar like em quem já curtiu cria o alinhamento (ativo)', async () => {
    const r = await gw.avaliarAposLike(USUARIO, JA_CURTIU);
    expect(r).not.toBeNull();
    expect(r?.contraparte.id).toBe(JA_CURTIU.id);
    expect(r?.deu_certo).toBe(false);
    expect(r?.status).toBe('ativo');
  });

  it('sem reciprocidade, não cria alinhamento', async () => {
    expect(await gw.avaliarAposLike(USUARIO, NAO_CURTIU)).toBeNull();
    expect(await gw.listar(USUARIO)).toHaveLength(0);
  });

  it('RN13: é idempotente por contraparte — não duplica o alinhamento', async () => {
    const a = await gw.avaliarAposLike(USUARIO, JA_CURTIU);
    const b = await gw.avaliarAposLike(USUARIO, JA_CURTIU);
    expect(b?.id).toBe(a?.id);
    expect(await gw.listar(USUARIO)).toHaveLength(1);
  });

  it('fan-out: o alinhamento gera uma notificação in-app de alinhamento', async () => {
    await gw.avaliarAposLike(USUARIO, JA_CURTIU);
    const notificacoes = await new MockNotificacoesGateway().listar(USUARIO);
    expect(notificacoes).toHaveLength(1);
    expect(notificacoes[0].tipo).toBe('alinhamento');
    expect(notificacoes[0].match_id).toBeTruthy();
  });

  it('RF72/RN15/RN16: marcar "deu certo" é idempotente (não conta conversão de novo)', async () => {
    const a = await gw.avaliarAposLike(USUARIO, JA_CURTIU);
    const marcado = await gw.marcarDeuCerto(USUARIO, {
      matchId: a!.id,
      visibilidade: 'ficar_visivel',
    });
    expect(marcado?.deu_certo).toBe(true);
    expect(marcado?.status).toBe('deu_certo');

    const denovo = await gw.marcarDeuCerto(USUARIO, { matchId: a!.id });
    expect(denovo?.deu_certo).toBe(true);
    expect(await gw.listar(USUARIO)).toHaveLength(1);
  });

  it('marcar "deu certo" em id inexistente retorna null', async () => {
    expect(await gw.marcarDeuCerto(USUARIO, { matchId: 'nao-existe' })).toBeNull();
  });

  it('statusDe deriva o status para a UI (E10)', () => {
    expect(statusDe({ deu_certo: false, encerrado: false })).toBe('ativo');
    expect(statusDe({ deu_certo: true, encerrado: false })).toBe('deu_certo');
    expect(statusDe({ deu_certo: false, encerrado: true })).toBe('encerrado');
  });
});
