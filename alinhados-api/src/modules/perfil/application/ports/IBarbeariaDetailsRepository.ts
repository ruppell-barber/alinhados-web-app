import { BarbeariaDetails } from '../../domain/entities/BarbeariaDetails';
import { ProfileStatus } from '../../domain/entities/Perfil';

export interface IBarbeariaDetailsRepository {
  findByProfileId(profileId: string): Promise<BarbeariaDetails | null>;
  saveWithPerfilStatus(
    details: BarbeariaDetails,
    perfilStatus: { isComplete: boolean; status: ProfileStatus }
  ): Promise<void>;
}
