import { describe, it, expect } from 'vitest';
import {
  CredenciaisInvalidasError,
  SessaoInvalidaError,
  ContaJaExisteError,
  ContaSuspensaError,
  ContaSemPerfilError,
  EstadoDaContaInvalidoError,
  TokenRecuperacaoInvalidoError,
  SenhaAtualIncorretaError,
} from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';
import { DomainError } from '../../../../../src/shared/core/domain/DomainError';

describe('Erros de Identidade', () => {
  it.each([
    [new CredenciaisInvalidasError(), 'auth', 'CREDENCIAIS_INVALIDAS'],
    [new SessaoInvalidaError(), 'auth', 'SESSAO_INVALIDA'],
    [new ContaJaExisteError(), 'conflict', 'CONTA_JA_EXISTE'],
    [new ContaSuspensaError(), 'permission', 'CONTA_SUSPENSA'],
    [new ContaSemPerfilError(), 'conflict', 'CONTA_SEM_PERFIL'],
    [new EstadoDaContaInvalidoError(), 'business', 'ESTADO_CONTA_INVALIDO'],
    [new TokenRecuperacaoInvalidoError(), 'auth', 'TOKEN_RECUPERACAO_INVALIDO'],
    [new SenhaAtualIncorretaError(), 'auth', 'SENHA_ATUAL_INCORRETA'],
  ])('%s carrega kind/code semânticos e mensagem padrão', (err, kind, code) => {
    expect(err).toBeInstanceOf(DomainError);
    expect(err.kind).toBe(kind);
    expect(err.code).toBe(code);
    expect(err.message.length).toBeGreaterThan(0);
  });

  it('não herda de classes com nome de status HTTP', () => {
    // Todos são DomainError (semântica neutra), nunca "UnauthorizedError" etc.
    expect(new CredenciaisInvalidasError().name).toBe('CredenciaisInvalidasError');
  });
});
