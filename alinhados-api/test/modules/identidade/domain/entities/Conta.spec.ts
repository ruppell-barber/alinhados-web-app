import { describe, it, expect } from 'vitest';
import { Conta } from '../../../../../src/modules/identidade/domain/entities/Conta';
import {
  ContaSuspensaError,
  EstadoDaContaInvalidoError,
} from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';

const base = {
  id: 'user-1',
  email: 'barbeiro@exemplo.com',
  userType: 'barbeiro',
  status: 'disponivel',
  isComplete: false,
};

describe('Conta', () => {
  it('reconstrói a partir da persistência e expõe os getters', () => {
    const conta = Conta.fromPersistence(base);

    expect(conta.id).toBe('user-1');
    expect(conta.email).toBe('barbeiro@exemplo.com');
    expect(conta.userType).toBe('barbeiro');
    expect(conta.status).toBe('disponivel');
    expect(conta.isComplete).toBe(false);
  });

  it('permite autenticar quando a conta não está banida', () => {
    const conta = Conta.fromPersistence(base);
    expect(() => conta.assertPodeAutenticar()).not.toThrow();
  });

  it('bloqueia autenticação de conta banida (RF08)', () => {
    const conta = Conta.fromPersistence({ ...base, status: 'banido' });
    expect(() => conta.assertPodeAutenticar()).toThrow(ContaSuspensaError);
  });

  it('rejeita user_type fora do domínio', () => {
    expect(() => Conta.fromPersistence({ ...base, userType: 'admin' })).toThrow(EstadoDaContaInvalidoError);
  });

  it('rejeita status fora do domínio', () => {
    expect(() => Conta.fromPersistence({ ...base, status: 'ativo' })).toThrow(EstadoDaContaInvalidoError);
  });
});
