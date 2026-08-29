import pino from 'pino';

/**
 * Instância global do Logger de Alta Performance (Pino).
 * Deve ser usada no lugar de `console.log()` para manter a rastreabilidade 
 * estruturada em produção e legível em desenvolvimento.
 * 
 * @example
 * logger.info({ userId: 1 }, 'Usuário criado com sucesso');
 * logger.error(err, 'Falha ao conectar no banco');
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
});
