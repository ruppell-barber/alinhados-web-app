import { injectable, inject } from 'tsyringe';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../ports/IBarbeariaDetailsRepository';
import { IBarbeiroDetailsRepository } from '../ports/IBarbeiroDetailsRepository';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { Perfil } from '../../domain/entities/Perfil';
import { PerfilCompletenessService } from '../../domain/services/PerfilCompletenessService';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { PerfilNaoEncontradoError } from '../../domain/errors/PerfilErrors';

export interface UpdatePerfilInput {
  id: string;
  nome?: string;
  cidade?: string;
  estado?: string;
  bio?: string;
}

export interface UpdatePerfilOutput {
  perfil: Perfil;
}

@injectable()
export class UpdatePerfilUseCase implements UseCase<UpdatePerfilInput, UpdatePerfilOutput> {
  constructor(
    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeariaDetailsRepository')
    private readonly detailsRepository: IBarbeariaDetailsRepository,

    @inject('IBarbeiroDetailsRepository')
    private readonly barbeiroDetailsRepository: IBarbeiroDetailsRepository,

    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository
  ) {}

  async execute(data: UpdatePerfilInput): Promise<UpdatePerfilOutput> {
    const current = await this.perfilRepository.findById(data.id);
    if (!current) {
      throw new PerfilNaoEncontradoError();
    }

    if (data.nome !== undefined) current.changeNome(data.nome);
    if (data.cidade !== undefined) current.changeCidade(data.cidade);
    if (data.estado !== undefined) current.changeEstado(data.estado);
    if (data.bio !== undefined) current.changeBio(data.bio);
    const [barbeariaDetails, barbeiroDetails, galleryCount] = await Promise.all([
      this.detailsRepository.findByProfileId(current.id),
      this.barbeiroDetailsRepository.findByProfileId(current.id),
      this.photoRepository.countGalleryByProfileId(current.id),
    ]);

    const { isComplete, status } = PerfilCompletenessService.evaluate({
      perfil: current,
      barbeariaDetails,
      barbeiroDetails,
      galleryCount,
    });
    current.setCompleteness(isComplete, status);

    await this.perfilRepository.save(current);

    return { perfil: current };
  }
}
