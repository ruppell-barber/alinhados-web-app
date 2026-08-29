import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../ports/IBarbeariaDetailsRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import { Perfil } from '../../domain/entities/Perfil';
import { BarbeariaDetails } from '../../domain/entities/BarbeariaDetails';
import { PerfilNaoEncontradoError } from '../../domain/errors/PerfilErrors';

export interface GetPerfilInput {
  id: string;
}

export interface GetPerfilOutput {
  perfil: Perfil;
  details: BarbeariaDetails | null;
  /** Signed URL temporária do avatar (o `perfil.avatarUrl` guarda só o path). */
  avatarUrl: string | null;
}

@injectable()
export class GetPerfilUseCase implements UseCase<GetPerfilInput, GetPerfilOutput> {
  constructor(
    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeariaDetailsRepository')
    private readonly detailsRepository: IBarbeariaDetailsRepository,

    @inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService
  ) {}

  async execute(data: GetPerfilInput): Promise<GetPerfilOutput> {
    const perfil = await this.perfilRepository.findById(data.id);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }

    const details = await this.detailsRepository.findByProfileId(data.id);
    const avatarUrl = perfil.avatarUrl
      ? (await this.fileStorage.getSignedUrls([perfil.avatarUrl]))[0]
      : null;

    return { perfil, details, avatarUrl };
  }
}
