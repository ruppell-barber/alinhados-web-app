import { inject, injectable } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { DomainError } from '../../../../shared/core/domain/DomainError';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../ports/IBarbeariaDetailsRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import { PerfilCompletenessService } from '../../domain/services/PerfilCompletenessService';
import {
  FotoNaoEncontradaError,
  FotoNaoPertenceAoPerfilError,
} from '../../domain/errors/PerfilErrors';

export interface DeletePhotoInput {
  profileId: string;
  photoId: string;
}

export interface DeletePhotoOutput {
  photoId: string;
  profileId: string;
  deleted: boolean;
}

@injectable()
export class DeletePhotoUseCase implements UseCase<DeletePhotoInput, DeletePhotoOutput> {
  constructor(
    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository,

    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeariaDetailsRepository')
    private readonly detailsRepository: IBarbeariaDetailsRepository,

    @inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService
  ) {}

  async execute(data: DeletePhotoInput): Promise<DeletePhotoOutput> {
    if (!data.profileId || data.profileId.trim().length === 0) {
      throw new DomainError('profileId é obrigatório.');
    }

    if (!data.photoId || data.photoId.trim().length === 0) {
      throw new DomainError('photoId é obrigatório.');
    }

    const photo = await this.photoRepository.findById(data.photoId);
    if (!photo) {
      throw new FotoNaoEncontradaError();
    }

    if (photo.profileId !== data.profileId) {
      throw new FotoNaoPertenceAoPerfilError();
    }

    await this.photoRepository.deleteById(data.photoId);

    // Remoção do arquivo é best-effort: a foto já saiu do banco (fonte da verdade). Se o storage
    // falhar, sobra um órfão a ser limpo depois — não bloqueia a operação do usuário.
    await this.fileStorage.delete(photo.url).catch(() => undefined);

    const perfil = await this.perfilRepository.findById(data.profileId);
    if (perfil) {
      const [details, galleryCount] = await Promise.all([
        this.detailsRepository.findByProfileId(data.profileId),
        this.photoRepository.countGalleryByProfileId(data.profileId),
      ]);

      const { isComplete, status } = PerfilCompletenessService.evaluate({
        perfil,
        barbeariaDetails: details,
        galleryCount,
      });
      if (photo.isAvatar) {
        perfil.changeAvatarUrl(undefined);
      }
      perfil.setCompleteness(isComplete, status);
      await this.perfilRepository.save(perfil);
    }

    return {
      photoId: data.photoId,
      profileId: data.profileId,
      deleted: true,
    };
  }
}
