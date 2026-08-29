import { NextFunction, Request, RequestHandler, Response } from 'express';
import { container } from '../../../../../shared/container';
import { HttpError } from '../../../../../shared/infra/http/HttpError';
import { AutenticarRequisicaoUseCase } from '../../../application/use-cases/AutenticarRequisicaoUseCase';

export function criarAutenticacaoMiddleware(
  useCase: AutenticarRequisicaoUseCase
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization?.startsWith('Bearer ')) {
        throw new HttpError(
          401,
          'AUTHORIZATION_HEADER_MISSING',
          'Token de acesso não fornecido.'
        );
      }

      const accessToken = authorization.slice('Bearer '.length).trim();
      if (!accessToken) {
        throw new HttpError(
          401,
          'AUTHORIZATION_HEADER_MISSING',
          'Token de acesso não fornecido.'
        );
      }

      const result = await useCase.execute({ accessToken });
      req.userId = result.userId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const autenticacaoMiddleware = criarAutenticacaoMiddleware(
  container.resolve(AutenticarRequisicaoUseCase)
);
