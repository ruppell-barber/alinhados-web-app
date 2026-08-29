import { BarbeiroDetails } from '../../domain/entities/BarbeiroDetails';
import { ProfileStatus } from '../../domain/entities/Perfil';

export interface IBarbeiroDetailsRepository {
  findByProfileId(profileId: string): Promise<BarbeiroDetails | null>;
  saveWithPerfilStatus(
    details: BarbeiroDetails,
    perfilStatus: { isComplete: boolean; status: ProfileStatus }
  ): Promise<void>;
}
