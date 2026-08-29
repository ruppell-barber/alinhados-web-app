import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DomainError } from '../../../core/domain/DomainError';
import { ErroDeInfraestrutura } from '../../../core/errors/ErroDeInfraestrutura';
import { HttpError } from '../HttpError';
import { AppResponse } from '../AppResponse';
import { logger } from '../../../logger';

function isZodError(
  error: unknown
): error is Error & { issues: z.ZodIssue[] } {
  if (error instanceof z.ZodError) return true;

  return (
    error instanceof Error &&
    error.name === 'ZodError' &&
    Array.isArray((error as Error & { issues?: unknown }).issues)
  );
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  // O Express reconhece que é um middleware de erro por ter 4 parâmetros (err, req, res, next)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // 1. Erros de Validação do Zod (DTOs / Request HTTP) -> 400 Bad Request
  if (isZodError(err)) {
    return AppResponse.validationError(res, err.issues);
  }

  // 2. Erros HTTP de adapter (ex.: header de autorização ausente) -> status declarado
  if (err instanceof HttpError) {
    return AppResponse.fail(res, err.message, err.code, err.status);
  }

  // 3. Falha de infraestrutura / dependência externa indisponível -> 503
  if (err instanceof ErroDeInfraestrutura) {
    logger.error({ err }, 'Falha de infraestrutura ao atender requisição');
    return AppResponse.serviceUnavailable(res, err.message, err.code);
  }

  // 4. Erros de domínio/aplicação -> status derivado do `kind` (nunca vaza HTTP para o domínio)
  if (err instanceof DomainError) {
    switch (err.kind) {
      case 'auth':
        return AppResponse.unauthorized(res, err.message, err.code);
      case 'permission':
        return AppResponse.forbidden(res, err.message, err.code);
      case 'not_found':
        return AppResponse.notFound(res, err.message, err.code);
      case 'conflict':
        return AppResponse.conflict(res, err.message, err.code);
      case 'business':
      default:
        return AppResponse.unprocessableEntity(res, err.message, err.code);
    }
  }

  // 5. Erros Fatais Não Tratados -> 500 Internal Server Error
  // Loga internamente (stack completo) e responde com mensagem segura ao cliente.
  logger.error({ err }, 'Erro inesperado não tratado');
  return AppResponse.fail(res, 'Ocorreu um erro inesperado no servidor.');
}
