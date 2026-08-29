/**
 * Semântica neutra de um erro de domínio/aplicação.
 * O domínio NÃO conhece HTTP — ele apenas classifica a natureza do erro.
 * Quem traduz `kind` para status HTTP é o `globalErrorHandler`.
 *
 * - `auth`       -> falha de autenticação (credenciais/sessão) -> 401
 * - `permission` -> autenticado, mas sem permissão (ex.: conta banida) -> 403
 * - `not_found`  -> recurso esperado não encontrado -> 404
 * - `conflict`   -> conflito/inconsistência de estado -> 409
 * - `business`   -> regra de negócio violada -> 422
 */
export type DomainErrorKind = 'auth' | 'permission' | 'not_found' | 'conflict' | 'business';

export interface DomainErrorOptions {
  code?: string;
  kind?: DomainErrorKind;
}

/**
 * Classe base para Erros de Domínio.
 * Usada dentro das Entidades ou Casos de Uso quando uma regra de negócio é violada
 * ou um estado inválido é detectado. Ela NÃO sabe o que é HTTP ou Status Code:
 * carrega apenas semântica neutra (`kind`) e um `code` estável para o cliente.
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly kind: DomainErrorKind;

  constructor(message: string, options: DomainErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.kind = options.kind ?? 'business';
    this.code = options.code ?? 'DOMAIN_ERROR';
    Error.captureStackTrace(this, this.constructor);
  }
}
