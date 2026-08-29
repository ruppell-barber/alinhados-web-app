import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../ports/IBarbeariaDetailsRepository';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { BarbeariaDetails } from '../../domain/entities/BarbeariaDetails';
import { PerfilCompletenessService } from '../../domain/services/PerfilCompletenessService';
import {
  DetalhesBarbeariaNaoEncontradosError,
  PerfilNaoEncontradoError,
  PerfilNaoPertenceABarbeariaError,
} from '../../domain/errors/PerfilErrors';

export interface UpdateHiringStatusInput {
  profileId: string;
  estaContratando: boolean;
}

export interface UpdateHiringStatusOutput {
  details: BarbeariaDetails;
}

@injectable()
export class UpdateHiringStatusUseCase
  implements UseCase<UpdateHiringStatusInput, UpdateHiringStatusOutput>
{
  constructor(
    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeariaDetailsRepository')
    private readonly detailsRepository: IBarbeariaDetailsRepository,

    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository
  ) {}

  async execute(data: UpdateHiringStatusInput): Promise<UpdateHiringStatusOutput> {
    const perfil = await this.perfilRepository.findById(data.profileId);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }

    if (perfil.userType !== 'barbearia') {
      throw new PerfilNaoPertenceABarbeariaError();
    }

    const details = await this.detailsRepository.findByProfileId(data.profileId);
    if (!details) {
      throw new DetalhesBarbeariaNaoEncontradosError();
    }

    if (data.estaContratando) {
      details.resumeHiring();
    } else {
      details.pauseHiring();
    }

    const galleryCount = await this.photoRepository.countGalleryByProfileId(data.profileId);
    const { isComplete, status } = PerfilCompletenessService.evaluate({
      perfil,
      barbeariaDetails: details,
      galleryCount,
    });
    await this.detailsRepository.saveWithPerfilStatus(details, {
      isComplete,
      status,
    });

    return { details };
  }
}
