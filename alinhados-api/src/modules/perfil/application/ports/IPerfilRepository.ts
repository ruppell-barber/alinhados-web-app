import { Perfil, ProfileStatus } from '../../domain/entities/Perfil';

export interface IPerfilRepository {
  save(perfil: Perfil): Promise<void>;
  findById(id: string): Promise<Perfil | null>;
  updateStatus(
    id: string,
    data: { isComplete: boolean; status: ProfileStatus }
  ): Promise<void>;
}
