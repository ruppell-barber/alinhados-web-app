import { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { criarAutenticacaoMiddleware } from '../../../../../../src/modules/identidade/adapters/api-web/middlewares/autenticacao.middleware';
import { AutenticarRequisicaoUseCase } from '../../../../../../src/modules/identidade/application/use-cases/AutenticarRequisicaoUseCase';
import { SessaoInvalidaError } from '../../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';
import { HttpError } from '../../../../../../src/shared/infra/http/HttpError';

function createContext(authorization?: string) {
  const req = { headers: { authorization } } as Request;
  const next = vi.fn() as NextFunction;
  return { req, res: {} as Response, next };
}

describe('criarAutenticacaoMiddleware', () => {
  it('anexa o id autenticado ao request', async () => {
    const useCase = {
      execute: vi.fn().mockResolvedValue({ userId: 'user-1' }),
    } as unknown as AutenticarRequisicaoUseCase;
    const middleware = criarAutenticacaoMiddleware(useCase);
    const { req, res, next } = createContext('Bearer access-token');

    await middleware(req, res, next);

    expect(useCase.execute).toHaveBeenCalledWith({ accessToken: 'access-token' });
    expect(req.userId).toBe('user-1');
    expect(next).toHaveBeenCalledWith();
  });

  it('repassa header ausente como HttpError 401', async () => {
    const useCase = {
      execute: vi.fn(),
    } as unknown as AutenticarRequisicaoUseCase;
    const middleware = criarAutenticacaoMiddleware(useCase);
    const { req, res, next } = createContext();

    await middleware(req, res, next);

    const error = vi.mocked(next).mock.calls[0][0] as unknown as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(401);
    expect(error.code).toBe('AUTHORIZATION_HEADER_MISSING');
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('repassa erro de sessão produzido pelo caso de uso', async () => {
    const useCase = {
      execute: vi.fn().mockRejectedValue(new SessaoInvalidaError()),
    } as unknown as AutenticarRequisicaoUseCase;
    const middleware = criarAutenticacaoMiddleware(useCase);
    const { req, res, next } = createContext('Bearer invalid');

    await middleware(req, res, next);

    expect(vi.mocked(next).mock.calls[0][0]).toBeInstanceOf(SessaoInvalidaError);
    expect(req.userId).toBeUndefined();
  });
});
