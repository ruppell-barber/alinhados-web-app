import { DomainError } from '../../../../shared/core/domain/DomainError';

export class PerfilNaoEncontradoError extends DomainError {
  constructor(message = 'Perfil não encontrado.') {
    super(message, { kind: 'not_found', code: 'PERFIL_NAO_ENCONTRADO' });
  }
}

export class DetalhesBarbeariaNaoEncontradosError extends DomainError {
  constructor(message = 'Detalhes da barbearia não encontrados.') {
    super(message, {
      kind: 'not_found',
      code: 'DETALHES_BARBEARIA_NAO_ENCONTRADOS',
    });
  }
}

export class PerfilNaoPertenceABarbeariaError extends DomainError {
  constructor(message = 'Esta operação é permitida apenas para perfis de barbearia.') {
    super(message, {
      kind: 'permission',
      code: 'PERFIL_NAO_E_BARBEARIA',
    });
  }
}

export class DetalhesBarbeiroNaoEncontradosError extends DomainError {
  constructor(message = 'Detalhes do barbeiro não encontrados.') {
    super(message, {
      kind: 'not_found',
      code: 'DETALHES_BARBEIRO_NAO_ENCONTRADOS',
    });
  }
}

export class PerfilNaoPertenceAoBarbeiroError extends DomainError {
  constructor(message = 'Esta operação é permitida apenas para perfis de barbeiro.') {
    super(message, {
      kind: 'permission',
      code: 'PERFIL_NAO_E_BARBEIRO',
    });
  }
}

export class FotoNaoEncontradaError extends DomainError {
  constructor(message = 'Foto não encontrada.') {
    super(message, { kind: 'not_found', code: 'FOTO_NAO_ENCONTRADA' });
  }
}

export class FotoNaoPertenceAoPerfilError extends DomainError {
  constructor(message = 'A foto não pertence ao perfil autenticado.') {
    super(message, {
      kind: 'permission',
      code: 'FOTO_NAO_PERTENCE_AO_PERFIL',
    });
  }
}

/**
 * A galeria já atingiu o máximo de fotos (RF20: até 10 na galeria; o avatar é separado). -> 422
 */
export class LimiteGaleriaAtingidoError extends DomainError {
  constructor(message = 'A galeria já tem o máximo de 10 fotos. Remova uma para adicionar outra.') {
    super(message, { kind: 'business', code: 'LIMITE_GALERIA_ATINGIDO' });
  }
}
