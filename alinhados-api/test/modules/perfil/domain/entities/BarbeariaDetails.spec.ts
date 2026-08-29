import { describe, expect, it } from 'vitest';
import { BarbeariaDetails } from '../../../../../src/modules/perfil/domain/entities/BarbeariaDetails';
import { DomainError } from '../../../../../src/shared/core/domain/DomainError';

function buildProps(overrides?: Partial<Parameters<typeof BarbeariaDetails.create>[0]>) {
  return {
    profileId: 'profile-1',
    nomeDecisor: 'João da Silva',
    valores: ['Premium', 'Moderno'],
    ...overrides,
  };
}

describe('BarbeariaDetails', () => {
  it('cria detalhes válidos com defaults corretos', () => {
    const details = BarbeariaDetails.create(buildProps());

    expect(details.profileId).toBe('profile-1');
    expect(details.temClube).toBe(false);
    expect(details.temPops).toBe(false);
    expect(details.eFranquia).toBe(false);
    expect(details.temFixo).toBe(false);
    expect(details.vagasAbertas).toBe(0);
    expect(details.numUnidades).toBe(1);
    expect(details.estaContratando).toBe(true);
  });

  it('rejeita profileId vazio', () => {
    expect(() => BarbeariaDetails.create(buildProps({ profileId: '' }))).toThrow(
      'O profileId é obrigatório.'
    );
  });

  it('rejeita nome do decisor com menos de 3 caracteres quando informado', () => {
    expect(() => BarbeariaDetails.create(buildProps({ nomeDecisor: 'ab' }))).toThrow(
      'O nome do decisor deve ter no mínimo 3 caracteres.'
    );
  });

  it('rejeita mais de 6 valores', () => {
    expect(() =>
      BarbeariaDetails.create(buildProps({ valores: ['1', '2', '3', '4', '5', '6', '7'] }))
    ).toThrow(DomainError);
  });

  it('aceita exatamente 6 valores', () => {
    const details = BarbeariaDetails.create(
      buildProps({ valores: ['1', '2', '3', '4', '5', '6'] })
    );

    expect(details.valores).toHaveLength(6);
  });

  it('preserva o profileId como id ao reidratar do banco', () => {
    const details = BarbeariaDetails.create(buildProps());

    expect(details.id).toBe('profile-1');
  });

  // E09 — vagas abertas
  it('rejeita vagasAbertas negativa', () => {
    expect(() => BarbeariaDetails.create(buildProps({ vagasAbertas: -1 }))).toThrow(
      'O número de vagas abertas não pode ser negativo.'
    );
  });

  it('aceita vagasAbertas informada', () => {
    const details = BarbeariaDetails.create(buildProps({ vagasAbertas: 3 }));

    expect(details.vagasAbertas).toBe(3);
  });

  // E02 — comissão paga e fixo de segurança
  it('rejeita comissaoPaga fora da faixa 40-60', () => {
    expect(() => BarbeariaDetails.create(buildProps({ comissaoPaga: 39 }))).toThrow(
      'A comissão paga deve estar entre 40% e 60%.'
    );
    expect(() => BarbeariaDetails.create(buildProps({ comissaoPaga: 61 }))).toThrow(
      'A comissão paga deve estar entre 40% e 60%.'
    );
  });

  it('aceita comissaoPaga dentro da faixa 40-60', () => {
    const details = BarbeariaDetails.create(buildProps({ comissaoPaga: 50 }));

    expect(details.comissaoPaga).toBe(50);
  });

  it('rejeita temFixo=true sem valorFixo', () => {
    expect(() => BarbeariaDetails.create(buildProps({ temFixo: true }))).toThrow(
      'O valor do fixo de segurança é obrigatório quando o fixo está ativado.'
    );
  });

  it('aceita temFixo=true com valorFixo informado', () => {
    const details = BarbeariaDetails.create(
      buildProps({ temFixo: true, valorFixo: 1500 })
    );

    expect(details.temFixo).toBe(true);
    expect(details.valorFixo).toBe(1500);
  });

  it('nasce com estaContratando=true por padrão', () => {
    const details = BarbeariaDetails.create(buildProps());

    expect(details.estaContratando).toBe(true);
  });

  it('pauseHiring marca estaContratando=false', () => {
    const details = BarbeariaDetails.create(buildProps());

    details.pauseHiring();

    expect(details.estaContratando).toBe(false);
  });

  it('resumeHiring marca estaContratando=true', () => {
    const details = BarbeariaDetails.create(buildProps({ estaContratando: false }));

    details.resumeHiring();

    expect(details.estaContratando).toBe(true);
  });

  it('pauseHiring é idempotente ao ser chamado duas vezes', () => {
    const details = BarbeariaDetails.create(buildProps());

    details.pauseHiring();
    details.pauseHiring();

    expect(details.estaContratando).toBe(false);
  });
});
