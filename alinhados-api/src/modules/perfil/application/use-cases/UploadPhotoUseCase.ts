import { inject, injectable } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { DomainError } from '../../../../shared/core/domain/DomainError';
import { Photo } from '../../domain/entities/Photo';
import { PerfilCompletenessService } from '../../domain/services/PerfilCompletenessService';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import { IImageProcessorService } from '../ports/IImageProcessorService';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../ports/IBarbeariaDetailsRepository';
import {
  PerfilNaoEncontradoError,
  LimiteGaleriaAtingidoError,
} from '../../domain/errors/PerfilErrors';

/** RF20: a galeria (fotos não-avatar) tem no máximo 10 fotos. O avatar é único e separado. */
const GALLERY_MAX = 10;

export interface UploadPhotoUseCaseInput {
  profileId: string;
  isAvatar: boolean;
  ordem?: number;
  file: {
    originalName: string;
    mimeType: string;
    size: number;
    buffer: Buffer;
  };
}

export interface UploadPhotoUseCaseOutput {
  photo: Photo;
  /** URL assinada temporária da foto recém-enviada (o `photo.url` guarda só o path). */
  signedUrl: string;
  galleryCount: number;
  galleryMinimumReached: boolean;
}

@injectable()
export class UploadPhotoUseCase
  implements UseCase<UploadPhotoUseCaseInput, UploadPhotoUseCaseOutput>
{
  constructor(
    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository,

    @inject('IFileStorageService')
    private readonly fileStorageService: IFileStorageService,

    @inject('IImageProcessorService')
    private readonly imageProcessorService: IImageProcessorService,

    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeariaDetailsRepository')
    private readonly detailsRepository: IBarbeariaDetailsRepository
  ) {}

  async execute(input: UploadPhotoUseCaseInput): Promise<UploadPhotoUseCaseOutput> {
    if (!input.profileId || input.profileId.trim().length === 0) {
      throw new DomainError('O profileId é obrigatório.');
    }

    if (!input.file) {
      throw new DomainError('O arquivo de foto é obrigatório.');
    }

    if (!input.file.mimeType.startsWith('image/')) {
      throw new DomainError('Apenas imagens são permitidas.');
    }

    if (input.file.mimeType.startsWith('video/')) {
      throw new DomainError('Vídeos não são permitidos para esta operação.');
    }

    const perfil = await this.perfilRepository.findById(input.profileId);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }

    // RF20: galeria com no máximo 10 fotos (o avatar é separado e substitui o anterior). Checa antes
    // de processar/subir a imagem para não gastar trabalho nem ultrapassar o limite.
    if (!input.isAvatar) {
      const galeriaAtual = await this.photoRepository.countGalleryByProfileId(input.profileId);
      if (galeriaAtual >= GALLERY_MAX) {
        throw new LimiteGaleriaAtingidoError();
      }
    }

    const processedImage = await this.imageProcessorService.process({
      buffer: input.file.buffer,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 82,
    });

    const safeFileName = this.buildFileName(input);
    const folder = `perfil/${input.profileId}/${input.isAvatar ? 'avatar' : 'galeria'}`;

    const storedFile = await this.fileStorageService.upload({
      folder,
      fileName: safeFileName,
      buffer: processedImage.buffer,
      mimeType: processedImage.mimeType,
    });

    const photo = Photo.create({
      profileId: input.profileId,
      url: storedFile.storagePath,
      ordem: input.ordem,
      isAvatar: input.isAvatar,
    });

    if (input.isAvatar) {
      await this.photoRepository.deleteAvatarByProfileId(input.profileId);
    }

    await this.photoRepository.save(photo);

    const [details, galleryCount] = await Promise.all([
      this.detailsRepository.findByProfileId(input.profileId),
      this.photoRepository.countGalleryByProfileId(input.profileId),
    ]);

    const { isComplete, status } = PerfilCompletenessService.evaluate({
      perfil,
      barbeariaDetails: details,
      galleryCount,
    });
    if (input.isAvatar) {
      perfil.changeAvatarUrl(photo.url);
    }
    perfil.setCompleteness(isComplete, status);
    await this.perfilRepository.save(perfil);

    const signedUrl = await this.fileStorageService.getSignedUrl(photo.url);

    return {
      photo,
      signedUrl,
      galleryCount,
      galleryMinimumReached: galleryCount >= 5,
    };
  }

  private buildFileName(input: UploadPhotoUseCaseInput): string {
    const sanitizedOriginalName = input.file.originalName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '');

    const baseName = sanitizedOriginalName.replace(/\.[^/.]+$/, '');

    return `${Date.now()}-${baseName}.jpg`;
  }
}
