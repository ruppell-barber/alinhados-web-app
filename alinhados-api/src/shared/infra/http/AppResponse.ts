import { Response } from 'express';
import { ZodIssue } from 'zod';

/**
 * Utilitário padronizador de Respostas HTTP para os Controllers do Express.
 * Remove a necessidade de manipular `.status()` e `.json()` repetitivamente, 
 * garantindo consistência no formato das respostas entre todos os módulos.
 */
export class AppResponse {
  private static getMeta(res: Response) {
    return {
      path: res.req?.originalUrl || '',
      timestamp: new Date().toISOString(),
    };
  }

  static ok<T>(res: Response, dto?: T) {
    return res.status(200).json({
      success: true,
      data: dto ?? null,
      meta: AppResponse.getMeta(res)
    });
  }

  static created<T>(res: Response, dto?: T) {
    return res.status(201).json({
      success: true,
      data: dto ?? null,
      meta: AppResponse.getMeta(res)
    });
  }

  static clientError(res: Response, message?: string, code?: string) {
    return res.status(400).json({
      success: false,
      error: {
        code: code || 'BAD_REQUEST',
        message: message || 'Parâmetros ou requisição inválida',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static validationError(res: Response, issues: ZodIssue[]) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados enviados na requisição são inválidos',
        issues,
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static unauthorized(res: Response, message?: string, code?: string) {
    return res.status(401).json({
      success: false,
      error: {
        code: code || 'UNAUTHORIZED',
        message: message || 'Você não possui permissão para acessar este recurso',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static forbidden(res: Response, message?: string, code?: string) {
    return res.status(403).json({
      success: false,
      error: {
        code: code || 'FORBIDDEN',
        message: message || 'Acesso negado',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static notFound(res: Response, message?: string, code?: string) {
    return res.status(404).json({
      success: false,
      error: {
        code: code || 'NOT_FOUND',
        message: message || 'Recurso não encontrado',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static conflict(res: Response, message?: string, code?: string) {
    return res.status(409).json({
      success: false,
      error: {
        code: code || 'CONFLICT',
        message: message || 'Conflito com o estado atual do recurso',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static unprocessableEntity(res: Response, message?: string, code?: string) {
    return res.status(422).json({
      success: false,
      error: {
        code: code || 'UNPROCESSABLE_ENTITY',
        message: message || 'Ação rejeitada por regras de negócio',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static serviceUnavailable(res: Response, message?: string, code?: string) {
    return res.status(503).json({
      success: false,
      error: {
        code: code || 'SERVICE_UNAVAILABLE',
        message: message || 'Serviço temporariamente indisponível',
      },
      meta: AppResponse.getMeta(res)
    });
  }

  static fail(res: Response, error: Error | string, code?: string, statusCode: number = 500) {
    const message = typeof error === 'string' ? error : error.message;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: code || 'INTERNAL_SERVER_ERROR',
        message,
      },
      meta: AppResponse.getMeta(res)
    });
  }
}
