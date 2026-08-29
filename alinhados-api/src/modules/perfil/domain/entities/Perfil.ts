import { Entity } from '../../../../shared/core/domain/Entity';
import { DomainError } from '../../../../shared/core/domain/DomainError';

export type UserType = 'barbeiro' | 'barbearia';
export type ProfileStatus = 'disponivel' | 'aberto' | 'indisponivel' | 'pausado' | 'banido';

const VALID_USER_TYPES: UserType[] = ['barbeiro', 'barbearia'];

export interface PerfilProps {
  userType: UserType;
  nome?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  bio?: string;
  avatarUrl?: string;
  isComplete?: boolean;
  status?: ProfileStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Perfil extends Entity<PerfilProps> {
  private constructor(props: PerfilProps, id: string) {
    super(props, id);
    this.validate();
  }

  static create(props: PerfilProps, id: string): Perfil {
    if (!id || id.trim().length === 0) {
      throw new DomainError('O id do perfil é obrigatório e deve vir da autenticação.');
    }

    return new Perfil(
      {
        ...props,
        pais: props.pais ?? 'Brasil',
        isComplete: props.isComplete ?? false,
        status: props.status ?? 'indisponivel',
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id
    );
  }

  private validate(): void {
    if (!VALID_USER_TYPES.includes(this.props.userType)) {
      throw new DomainError('O tipo de usuário informado é inválido.');
    }

    if (this.props.nome !== undefined && this.props.nome.trim().length < 2) {
      throw new DomainError('O nome deve ter no mínimo 2 caracteres.');
    }
  }

  public changeNome(nome?: string): void {
    const normalized = nome?.trim() || undefined;
    if (normalized !== undefined && normalized.length < 2) {
      throw new DomainError('O nome deve ter no mínimo 2 caracteres.');
    }
    this.props.nome = normalized;
    this.touch();
  }

  public changeCidade(cidade?: string): void {
    this.props.cidade = cidade?.trim() || undefined;
    this.touch();
  }

  public changeEstado(estado?: string): void {
    this.props.estado = estado?.trim() || undefined;
    this.touch();
  }

  public changeBio(newBio?: string): void {
    this.props.bio = newBio?.trim() || undefined;
    this.touch();
  }

  public changeAvatarUrl(avatarUrl?: string): void {
    this.props.avatarUrl = avatarUrl;
    this.touch();
  }

  public setCompleteness(isComplete: boolean, status: ProfileStatus): void {
    this.props.isComplete = isComplete;
    this.props.status = status;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  get userType(): UserType {
    return this.props.userType;
  }

  get nome(): string | undefined {
    return this.props.nome;
  }

  get cidade(): string | undefined {
    return this.props.cidade;
  }

  get estado(): string | undefined {
    return this.props.estado;
  }

  get pais(): string {
    return this.props.pais as string;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get isComplete(): boolean {
    return this.props.isComplete ?? false;
  }

  get status(): ProfileStatus {
    return this.props.status as ProfileStatus;
  }

  get createdAt(): Date {
    return this.props.createdAt as Date;
  }

  get updatedAt(): Date {
    return this.props.updatedAt as Date;
  }
}
