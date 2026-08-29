/**
 * Erro HTTP lançado por um ADAPTER da porta primária (ex.: controller/middleware)
 * quando a falha é puramente de protocolo HTTP e não uma regra de domínio —
 * por exemplo, header de autorização ausente ou malformado.
 *
 * O `globalErrorHandler` mapeia diretamente `status`/`code`/`message` para a resposta.
 * Assim o controller não precisa formatar a resposta de erro manualmente.
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
