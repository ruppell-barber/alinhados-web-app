import { UserType, ContaStatus } from '../../domain/entities/Conta';

export interface CriarPerfilInput {
  id: string;
  user_type: UserType;
}

export interface PerfilInfo {
  id: string;
  user_type: UserType;
  is_complete: boolean;
  status: ContaStatus;
}

export interface IIdentidadeRepository {
  criarPerfil(input: CriarPerfilInput): Promise<void>;
  buscarPerfil(userId: string): Promise<PerfilInfo | null>;
}
