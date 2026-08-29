import { describe, expect, it } from 'vitest';
import { perfilBarbeariaSchema, LIMITES } from '@/contracts-local';
import { calcularCompletudeBarbearia } from '@/features/perfil/completude-barbearia';

const barbeariaValida = {
  nome: 'Brutal Cuts',
  bio: 'Barbearia de bairro com vibe de família.',
  cidade: 'Sobra Nada',
  estado: 'SP' as const,
  nome_decisor: 'Ale Wood',
  num_cadeiras: 4,
  num_unidades: 1,
  e_franquia: false,
  comissao_paga: 50,
  tem_fixo: false,
  tem_clube: false,
  descricao_clube: '',
  tem_pops: true,
  valores: ['Respeito', 'Pontualidade'],
  esta_contratando: true,
};

describe('perfilBarbeariaSchema (E01/E02)', () => {
  it('aceita um perfil válido', () => {
    expect(perfilBarbeariaSchema.safeParse(barbeariaValida).success).toBe(true);
  });

  it('trava comissão paga fora de 40–60% (RF34)', () => {
    expect(perfilBarbeariaSchema.safeParse({ ...barbeariaValida, comissao_paga: 30 }).success).toBe(false);
    expect(perfilBarbeariaSchema.safeParse({ ...barbeariaValida, comissao_paga: 61 }).success).toBe(false);
  });

  it('exige valor do fixo quando "tem fixo" está ligado (RF35 — validação condicional)', () => {
    expect(perfilBarbeariaSchema.safeParse({ ...barbeariaValida, tem_fixo: true }).success).toBe(false);
    expect(
      perfilBarbeariaSchema.safeParse({ ...barbeariaValida, tem_fixo: true, valor_fixo: 1600 }).success,
    ).toBe(true);
    expect(
      perfilBarbeariaSchema.safeParse({ ...barbeariaValida, tem_fixo: false, valor_fixo: undefined }).success,
    ).toBe(true);
  });

  it('exige descrição do clube quando "tem clube" está ligado (RF33)', () => {
    expect(perfilBarbeariaSchema.safeParse({ ...barbeariaValida, tem_clube: true }).success).toBe(false);
    expect(
      perfilBarbeariaSchema.safeParse({
        ...barbeariaValida,
        tem_clube: true,
        descricao_clube: 'Assinatura mensal com cortes ilimitados.',
      }).success,
    ).toBe(true);
  });

  it(`limita valores a ${LIMITES.MAX_VALORES} tags (RN07)`, () => {
    expect(
      perfilBarbeariaSchema.safeParse({ ...barbeariaValida, valores: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] })
        .success,
    ).toBe(false);
  });

  it('exige pelo menos 1 cadeira e 1 unidade', () => {
    expect(perfilBarbeariaSchema.safeParse({ ...barbeariaValida, num_cadeiras: 0 }).success).toBe(false);
    expect(perfilBarbeariaSchema.safeParse({ ...barbeariaValida, num_unidades: 0 }).success).toBe(false);
  });
});

describe('calcularCompletudeBarbearia (RN01)', () => {
  it('retorna 0 para perfil vazio', () => {
    expect(calcularCompletudeBarbearia({}, false, false, false)).toBe(0);
  });

  it('só chega a 100 com galeria completa (mín 5) e tabela de serviços (E03)', () => {
    const semGaleria = calcularCompletudeBarbearia(barbeariaValida, true, false, false);
    const completo = calcularCompletudeBarbearia(barbeariaValida, true, true, true);
    expect(semGaleria).toBeLessThan(100);
    expect(completo).toBe(100);
  });

  it('cresce conforme os campos são preenchidos', () => {
    const soFoto = calcularCompletudeBarbearia({}, true, false, false);
    const fotoENome = calcularCompletudeBarbearia({ nome: 'Brutal Cuts' }, true, false, false);
    expect(fotoENome).toBeGreaterThan(soFoto);
  });
});
