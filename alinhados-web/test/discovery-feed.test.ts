import { describe, it, expect, beforeEach } from 'vitest';
import { ordenarPorProximidade, excluirVistos, cardBarbeiroDe } from '@/lib/discovery/feed-regras';
import { MockDiscoveryGateway, lerSwipes } from '@/lib/discovery/mock-gateway';
import { BARBEIROS_SEED } from '@/lib/discovery/seed';

const BARBEIRO_INDISPONIVEL = '10000000-0000-4000-8000-000000000004'; // Pedro Alves (RN05)
const BARBEARIA_PAUSADA = '20000000-0000-4000-8000-000000000004'; // Ale Wood (RN06)
const JOAO_SP = '10000000-0000-4000-8000-000000000001';

describe('regras puras do feed', () => {
  it('RN03: prioriza mesma cidade, depois mesmo estado, depois o resto', () => {
    const itens = [
      { id: 'a', cidade: 'Rio de Janeiro', estado: 'RJ' },
      { id: 'b', cidade: 'Campinas', estado: 'SP' },
      { id: 'c', cidade: 'São Paulo', estado: 'SP' },
    ];
    const ord = ordenarPorProximidade(itens, { cidade: 'São Paulo', estado: 'SP' });
    expect(ord.map((i) => i.id)).toEqual(['c', 'b', 'a']);
  });

  it('RN03: ordenação é estável entre itens do mesmo rank', () => {
    const itens = [
      { id: 'x', cidade: 'São Paulo', estado: 'SP' },
      { id: 'y', cidade: 'São Paulo', estado: 'SP' },
    ];
    expect(ordenarPorProximidade(itens, { cidade: 'São Paulo', estado: 'SP' }).map((i) => i.id)).toEqual(['x', 'y']);
  });

  it('RN04: exclui os já-vistos', () => {
    const itens = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(excluirVistos(itens, new Set(['b'])).map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('RF58/RN08: o card do barbeiro não vaza campos privados nem de detalhe', () => {
    const card = cardBarbeiroDe(BARBEIROS_SEED[0]);
    expect(card).not.toHaveProperty('disponivel'); // interno
    expect(card).not.toHaveProperty('faturamento_mensal'); // só no perfil completo
    expect(card).not.toHaveProperty('anos_experiencia');
    expect(card.id).toBe(BARBEIROS_SEED[0].id);
  });
});

describe('MockDiscoveryGateway', () => {
  const gw = new MockDiscoveryGateway();
  const barbearia = { usuarioId: 'u-barbearia', tipo: 'barbearia' as const, cidade: 'São Paulo', estado: 'SP' };
  const barbeiro = { usuarioId: 'u-barbeiro', tipo: 'barbeiro' as const, cidade: 'São Paulo', estado: 'SP' };

  beforeEach(() => localStorage.clear());

  it('RN02 + RN05: barbearia vê só barbeiros, e nunca os indisponíveis', async () => {
    const feed = await gw.buscarFeed(barbearia);
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((c) => c.tipo === 'barbeiro')).toBe(true);
    expect(feed.some((c) => c.id === BARBEIRO_INDISPONIVEL)).toBe(false);
  });

  it('RN02 + RN06: barbeiro vê só barbearias, e nunca as pausadas', async () => {
    const feed = await gw.buscarFeed(barbeiro);
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((c) => c.tipo === 'barbearia')).toBe(true);
    expect(feed.some((c) => c.id === BARBEARIA_PAUSADA)).toBe(false);
  });

  it('RN03: a cidade do usuário aparece no topo do feed', async () => {
    const feed = await gw.buscarFeed(barbearia);
    expect(feed[0].cidade).toBe('São Paulo');
  });

  it('RN04: perfil avaliado não retorna ao feed do mesmo usuário', async () => {
    const antes = await gw.buscarFeed(barbearia);
    const alvo = antes[0].id;
    await gw.registrarSwipe(barbearia.usuarioId, alvo, 'like');
    const depois = await gw.buscarFeed(barbearia);
    expect(depois.some((c) => c.id === alvo)).toBe(false);
    expect(depois.length).toBe(antes.length - 1);
  });

  it('RF57/RN14: swipe é idempotente e irreversível (não duplica nem muda a direção)', async () => {
    await gw.registrarSwipe(barbearia.usuarioId, JOAO_SP, 'like');
    await gw.registrarSwipe(barbearia.usuarioId, JOAO_SP, 'dislike'); // tentativa de sobrescrever
    const swipes = lerSwipes(barbearia.usuarioId).filter((s) => s.swipedId === JOAO_SP);
    expect(swipes).toHaveLength(1);
    expect(swipes[0].direction).toBe('like');
  });

  it('RF62: perfil completo retorna por id e não vaza o campo interno `disponivel`', async () => {
    const p = await gw.buscarPerfilCompleto(JOAO_SP);
    expect(p?.tipo).toBe('barbeiro');
    expect(p).not.toHaveProperty('disponivel');
    expect(p && 'anos_experiencia' in p).toBe(true); // agora sim os campos de detalhe
  });

  it('perfil completo de id inexistente retorna null', async () => {
    expect(await gw.buscarPerfilCompleto('inexistente')).toBeNull();
  });
});
