import { Entity } from '../../../../shared/core/domain/Entity';
import {
  ContaSuspensaError,
  EstadoDaContaInvalidoError,
} from '../errors/IdentidadeErrors';

/** Tipos de perfil suportados no domínio. Espelha o enum `UserType` do Prisma. */
export type UserType = 'barbeiro' | 'barbearia';

/** Status possíveis de uma conta. Espelha o enum `ProfileStatus` do Prisma. */
export type ContaStatus = 'disponivel' | 'aberto' | 'indisponivel' | 'pausado' | 'banido';

const USER_TYPES: readonly UserType[] = ['barbeiro', 'barbearia'];
const CONTA_STATUS: readonly ContaStatus[] = [
  'disponivel',
  'aberto',
  'indisponivel',
  'pausado',
  'banido',
];

export interface ContaProps {
  email?: string;
  userType: UserType;
  status: ContaStatus;
  isComplete: boolean;
}

/** Entrada crua vinda da persistência (banco, seed, migration, fila, testes). */
export interface ContaPersistenceData {
  id: string;
  email?: string;
  userType: string;
  status: string;
  isComplete: boolean;
}

/**
 * Entidade de domínio que representa a conta/identidade de um usuário.
 *
 * Concentra as invariantes de identidade e a regra "quem pode autenticar".
 * Protege o domínio contra dados inválidos vindos de qualquer fronteira —
 * mesmo que Prisma/Zod já validem em alguns pontos.
 */
export class Conta extends Entity<ContaProps> {
  private constructor(props: ContaProps, id: string) {
    super(props, id);
  }

  /**
   * Reconstrói a entidade a partir de dados de persistência, validando as
   * invariantes de estado (userType/status precisam pertencer ao domínio).
   */
  public static fromPersistence(data: ContaPersistenceData): Conta {
    if (!USER_TYPES.includes(data.userType as UserType)) {
      throw new EstadoDaContaInvalidoError(`Tipo de perfil inválido: "${data.userType}".`);
    }

    if (!CONTA_STATUS.includes(data.status as ContaStatus)) {
      throw new EstadoDaContaInvalidoError(`Status de conta inválido: "${data.status}".`);
    }

    return new Conta(
      {
        email: data.email,
        userType: data.userType as UserType,
        status: data.status as ContaStatus,
        isComplete: data.isComplete,
      },
      data.id
    );
  }

  /**
   * Regra de domínio: uma conta banida não pode autenticar (RF08).
   * Lança `ContaSuspensaError` (-> 403) quando a conta está suspensa.
   */
  public assertPodeAutenticar(): void {
    if (this.props.status === 'banido') {
      throw new ContaSuspensaError();
    }
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get userType(): UserType {
    return this.props.userType;
  }

  get status(): ContaStatus {
    return this.props.status;
  }

  get isComplete(): boolean {
    return this.props.isComplete;
  }
}
