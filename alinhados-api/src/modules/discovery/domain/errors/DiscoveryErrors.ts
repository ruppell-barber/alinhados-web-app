import { DomainError } from '../../../../shared/core/domain/DomainError';

/**
 * O perfil do usuário autenticado (viewer) não foi encontrado no banco.
 * Inconsistência: o token é válido, mas não há `profiles` correspondente. -> 404
 */
export class ViewerNaoEncontradoError extends DomainError {
  constructor(message = 'Perfil do usuário não encontrado.') {
    super(message, { kind: 'not_found', code: 'VIEWER_NAO_ENCONTRADO' });
  }
}

/**
 * O tipo de conta do viewer não tem acesso a este feed (RN02) — ex.: um barbeiro chamando o
 * feed de barbeiros, que é exclusivo da barbearia. -> 403
 */
export class AcessoAoFeedNegadoError extends DomainError {
  constructor(message = 'Este feed não está disponível para o seu tipo de conta.') {
    super(message, { kind: 'permission', code: 'FEED_ACESSO_NEGADO' });
  }
}

/**
 * O viewer tentou abrir o perfil do lado errado (RN02) — ex.: um barbeiro abrindo o perfil de outro
 * barbeiro. Só a contraparte (barbearia vê barbeiro / barbeiro vê barbearia) enxerga o perfil, para
 * não vazar dado sensível (faturamento, comissão) a concorrentes do mesmo lado. -> 403
 */
export class AcessoAoPerfilNegadoError extends DomainError {
  constructor(message = 'Este perfil não está disponível para o seu tipo de conta.') {
    super(message, { kind: 'permission', code: 'PERFIL_ACESSO_NEGADO' });
  }
}

/**
 * O perfil-alvo (o barbeiro/barbearia cujo id foi pedido em E12/B12) não existe ou não é do tipo
 * esperado. -> 404
 */
export class PerfilNaoEncontradoError extends DomainError {
  constructor(message = 'Perfil não encontrado.') {
    super(message, { kind: 'not_found', code: 'PERFIL_NAO_ENCONTRADO' });
  }
}

/**
 * O perfil avaliado (alvo do swipe) não existe. -> 404
 */
export class PerfilAvaliadoNaoEncontradoError extends DomainError {
  constructor(message = 'O perfil informado não foi encontrado.') {
    super(message, { kind: 'not_found', code: 'PERFIL_AVALIADO_NAO_ENCONTRADO' });
  }
}

/**
 * Swipe (RF57) rejeitado por violar uma invariante do par swiper/swiped: auto-swipe (o mesmo
 * perfil nos dois lados) ou perfis do mesmo `user_type` (o feed já segrega por lado oposto,
 * RN02 — um swipe fora dessa relação corromperia a base que o E6 usa para detectar match). -> 422
 */
export class SwipeInvalidoError extends DomainError {
  constructor(message = 'Não é possível avaliar o próprio perfil ou perfis do mesmo tipo.') {
    super(message, { kind: 'business', code: 'SWIPE_INVALIDO' });
  }
}
