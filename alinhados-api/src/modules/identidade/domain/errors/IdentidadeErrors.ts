import { DomainError } from '../../../../shared/core/domain/DomainError';

/**
 * Erros semânticos do módulo Identidade.
 *
 * Nenhum deles herda de classes com nomes HTTP (UnauthorizedError, ConflictError...).
 * Eles carregam apenas semântica neutra (`kind`/`code`); a tradução para status HTTP
 * é responsabilidade exclusiva do `globalErrorHandler`.
 */

/** Credenciais de login inválidas. Mensagem genérica de propósito (RF09). -> 401 */
export class CredenciaisInvalidasError extends DomainError {
  constructor(message = 'Credenciais inválidas.') {
    super(message, { kind: 'auth', code: 'CREDENCIAIS_INVALIDAS' });
  }
}

/** Sessão/refresh token inválido ou expirado. -> 401 */
export class SessaoInvalidaError extends DomainError {
  constructor(message = 'Sessão inválida ou expirada.') {
    super(message, { kind: 'auth', code: 'SESSAO_INVALIDA' });
  }
}

/** Já existe uma conta com o e-mail informado. -> 409 */
export class ContaJaExisteError extends DomainError {
  constructor(message = 'Já existe uma conta com este e-mail.') {
    super(message, { kind: 'conflict', code: 'CONTA_JA_EXISTE' });
  }
}

/** Conta banida/suspensa tentando autenticar (RF08). -> 403 */
export class ContaSuspensaError extends DomainError {
  constructor(message = 'Conta suspensa. Entre em contato com o suporte.') {
    super(message, { kind: 'permission', code: 'CONTA_SUSPENSA' });
  }
}

/**
 * Autenticação OK no provedor, mas não existe perfil correspondente no banco.
 * Tratado como inconsistência de estado entre Auth e banco. -> 409
 */
export class ContaSemPerfilError extends DomainError {
  constructor(message = 'Perfil não encontrado. Entre em contato com o suporte.') {
    super(message, { kind: 'conflict', code: 'CONTA_SEM_PERFIL' });
  }
}

/** Estado da conta inválido (user_type/status fora do domínio permitido). -> 422 */
export class EstadoDaContaInvalidoError extends DomainError {
  constructor(message = 'Estado da conta inválido.') {
    super(message, { kind: 'business', code: 'ESTADO_CONTA_INVALIDO' });
  }
}

/** Token de recuperação de senha inválido ou expirado (B10). -> 401 */
export class TokenRecuperacaoInvalidoError extends DomainError {
  constructor(message = 'Token de recuperação inválido ou expirado.') {
    super(message, { kind: 'auth', code: 'TOKEN_RECUPERACAO_INVALIDO' });
  }
}

/** Senha atual incorreta ao alterar a senha do usuário autenticado. -> 401 */
export class SenhaAtualIncorretaError extends DomainError {
  constructor(message = 'Senha atual incorreta.') {
    super(message, { kind: 'auth', code: 'SENHA_ATUAL_INCORRETA' });
  }
}
