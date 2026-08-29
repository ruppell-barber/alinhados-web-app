import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../../../logger';

/**
 * Middleware global de logs HTTP baseado nos padrões semânticos do OpenTelemetry.
 * Registra o início, a duração e os detalhes da resposta para observabilidade estruturada.
 */
export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Simula ou resgata um Trace ID para Distributed Tracing
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
  
  // Injeta o Trace ID na resposta para o client conseguir reportar falhas
  res.setHeader('x-trace-id', traceId);

  // Aguarda o fim da requisição para ter os dados exatos (status code, duração, etc)
  res.on('finish', () => {
    const duration = Date.now() - start;
    const contentLength = res.getHeader('content-length');

    // Padrão de Nomenclatura Semântica do OpenTelemetry
    const otelAttributes = {
      trace_id: traceId,
      span_id: randomUUID(),
      'http.method': req.method,
      'http.url': req.originalUrl,
      'http.status_code': res.statusCode,
      'http.user_agent': req.headers['user-agent'] || 'unknown',
      'http.client_ip': req.ip || req.socket.remoteAddress || 'unknown',
      'http.response_content_length': contentLength ? Number(contentLength) : 0,
      'http.server.duration_ms': duration,
    };

    const message = `[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

    // Se for erro client ou server (>= 400), loga com nível warn/error apropriado
    if (res.statusCode >= 500) {
      logger.error(otelAttributes, message);
    } else if (res.statusCode >= 400) {
      logger.warn(otelAttributes, message);
    } else {
      logger.info(otelAttributes, message);
    }
  });

  next();
}
