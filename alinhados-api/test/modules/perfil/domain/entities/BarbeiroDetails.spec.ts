import { describe, expect, it } from 'vitest';
import { BarbeiroDetails } from '../../../../../src/modules/perfil/domain/entities/BarbeiroDetails';
import { DomainError } from '../../../../../src/shared/core/domain/DomainError';

function build(overrides: Partial<Parameters<typeof BarbeiroDetails.create>[0]> = {}) {
  return BarbeiroDetails.create({
    profileId: 'profile-1',
    servicos: ['corte'],
    valores: ['pontualidade'],
    ...overrides,
  });
}

describe('BarbeiroDetails', () => {
  it('cria com defaults (estaDesempregado=false, arrays vazios)', () => {
    const details = BarbeiroDetails.create({ profileId: 'p1', servicos: [], valores: [] });
    expect(details.estaDesempregado).toBe(false);
    expect(details.servicos).toEqual([]);
    expect(details.valores).toEqual([]);
  });

  it('expõe os campos via getters', () => {
    const details = build({ comissaoDesejada: 50, taxaOcupacao: 80, faturamentoMensal: 6000 });
    expect(details.profileId).toBe('profile-1');
    expect(details.comissaoDesejada).toBe(50);
    expect(details.taxaOcupacao).toBe(80);
    expect(details.faturamentoMensal).toBe(6000);
  });

  it('rejeita profileId vazio', () => {
    expect(() => build({ profileId: '  ' })).toThrow(DomainError);
  });

  it('rejeita apelido com menos de 3 caracteres', () => {
    expect(() => build({ apelidoProfissional: 'ab' })).toThrow(DomainError);
  });

  it('rejeita comissão desejada fora de 40–60 (RF14)', () => {
    expect(() => build({ comissaoDesejada: 30 })).toThrow(DomainError);
    expect(() => build({ comissaoDesejada: 70 })).toThrow(DomainError);
    expect(build({ comissaoDesejada: 50 }).comissaoDesejada).toBe(50);
  });

  it('rejeita taxa de ocupação fora de 0–100', () => {
    expect(() => build({ taxaOcupacao: 120 })).toThrow(DomainError);
  });

  it('rejeita faturamento mensal negativo', () => {
    expect(() => build({ faturamentoMensal: -10 })).toThrow(DomainError);
  });

  it('rejeita mais de 6 valores', () => {
    expect(() => build({ valores: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] })).toThrow(DomainError);
  });

  it('rejeita mais de 12 serviços', () => {
    expect(() => build({ servicos: Array.from({ length: 13 }, (_, i) => `s${i}`) })).toThrow(
      DomainError
    );
  });
});
