/**
 * Falha operacional em uma dependência externa.
 *
 * Adapters traduzem falhas conhecidas de rede, timeout ou provedor indisponível
 * para este erro, permitindo que a camada HTTP responda 503.
 */
export class ErroDeInfraestrutura extends Error {
  public readonly code: string;

  constructor(
    message = 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    options: { code?: string; cause?: unknown } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code ?? 'SERVICE_UNAVAILABLE';
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
