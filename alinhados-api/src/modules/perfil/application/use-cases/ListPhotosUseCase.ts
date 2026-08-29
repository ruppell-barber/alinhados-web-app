import { inject, injectable } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { DomainError } from '../../../../shared/core/domain/DomainError';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';

export interface ListPhotosInput {
  profileId: string;
}

/** Projeção de foto para a resposta — `url` já é a signed URL temporária (o banco guarda o path). */
export interface PhotoView {
  id: string;
  profileId: string;
  url: string | null;
  ordem?: number;
  isAvatar: boolean;
  createdAt: Date;
}

export interface ListPhotosOutput {
  items: PhotoView[];
  total: number;
}

@injectable()
export class ListPhotosUseCase implements UseCase<ListPhotosInput, ListPhotosOutput> {
  constructor(
    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository,

    @inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService
  ) {}

  async execute(data: ListPhotosInput): Promise<ListPhotosOutput> {
    if (!data.profileId || data.profileId.trim().length === 0) {
      throw new DomainError('profileId é obrigatório.');
    }

    const photos = await this.photoRepository.findByProfileId(data.profileId);
    const signedUrls = await this.fileStorage.getSignedUrls(photos.map((p) => p.url));

    const items: PhotoView[] = photos.map((photo, index) => ({
      id: photo.id,
      profileId: photo.profileId,
      url: signedUrls[index],
      ordem: photo.ordem,
      isAvatar: photo.isAvatar,
      createdAt: photo.createdAt,
    }));

    return { items, total: items.length };
  }
}
