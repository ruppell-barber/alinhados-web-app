import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UploadPhotoUseCase,
  UploadPhotoUseCaseInput,
} from '../../../../src/modules/perfil/application/use-cases/UploadPhotoUseCase';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';
import { IFileStorageService } from '../../../../src/shared/storage/IFileStorageService';
import { IImageProcessorService } from '../../../../src/modules/perfil/application/ports/IImageProcessorService';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeariaDetailsRepository';

function buildUseCase() {
  const photoRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByProfileId: vi.fn(),
    countGalleryByProfileId: vi.fn(),
    deleteById: vi.fn(),
    deleteAvatarByProfileId: vi.fn(),
  };

  const fileStorageService = {
    upload: vi.fn(),
    getSignedUrl: vi.fn().mockResolvedValue('https://signed/url'),
    getSignedUrls: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
  };

  const imageProcessorService = {
    process: vi.fn(),
  };

  const perfilRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(Perfil.create({ userType: 'barbearia' }, 'profile-1')),
    updateStatus: vi.fn(),
  };

  const detailsRepository = {
    findByProfileId: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
  };

  const useCase = new UploadPhotoUseCase(
    photoRepository as unknown as IPhotoRepository,
    fileStorageService as unknown as IFileStorageService,
    imageProcessorService as unknown as IImageProcessorService,
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeariaDetailsRepository
  );

  return { useCase, photoRepository, fileStorageService, imageProcessorService, perfilRepository };
}

function buildInput(overrides?: Partial<UploadPhotoUseCaseInput>): UploadPhotoUseCaseInput {
  return {
    profileId: 'profile-1',
    isAvatar: false,
    file: {
      originalName: 'foto.jpg',
      mimeType: 'image/jpeg',
      size: 123,
      buffer: Buffer.from('abc'),
    },
    ...overrides,
  };
}

describe('UploadPhotoUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('faz upload com sucesso de uma foto da galeria', async () => {
    const { useCase, photoRepository, fileStorageService, imageProcessorService } = buildUseCase();

    imageProcessorService.process.mockResolvedValue({
      buffer: Buffer.from('processed'),
      mimeType: 'image/jpeg',
      sizeBytes: 321,
      width: 800,
      height: 600,
    });
    fileStorageService.upload.mockResolvedValue({
      storagePath: 'uploads/perfil/profile-1/galeria/test.jpg',
      publicUrl: '/uploads/perfil/profile-1/galeria/test.jpg',
    });
    photoRepository.countGalleryByProfileId.mockResolvedValue(1);

    const result = await useCase.execute(buildInput());

    expect(result.photo.profileId).toBe('profile-1');
    expect(result.photo.isAvatar).toBe(false);
    expect(result.galleryMinimumReached).toBe(false);
    expect(photoRepository.save).toHaveBeenCalledTimes(1);
    expect(photoRepository.deleteAvatarByProfileId).not.toHaveBeenCalled();
  });

  it('retorna galleryMinimumReached=true quando a galeria chega a 5 fotos (RF29)', async () => {
    const { useCase, photoRepository, fileStorageService, imageProcessorService } = buildUseCase();

    imageProcessorService.process.mockResolvedValue({
      buffer: Buffer.from('processed'),
      mimeType: 'image/jpeg',
      sizeBytes: 321,
    });
    fileStorageService.upload.mockResolvedValue({
      storagePath: 'x',
      publicUrl: '/x',
    });
    photoRepository.countGalleryByProfileId.mockResolvedValue(5);

    const result = await useCase.execute(buildInput());

    expect(result.galleryMinimumReached).toBe(true);
  });

  it('substitui o avatar e sincroniza a URL no perfil', async () => {
    const {
      useCase,
      photoRepository,
      fileStorageService,
      imageProcessorService,
      perfilRepository,
    } = buildUseCase();

    imageProcessorService.process.mockResolvedValue({
      buffer: Buffer.from('processed'),
      mimeType: 'image/jpeg',
      sizeBytes: 321,
    });
    fileStorageService.upload.mockResolvedValue({ storagePath: 'x', publicUrl: '/x' });
    photoRepository.countGalleryByProfileId.mockResolvedValue(0);

    await useCase.execute(buildInput({ isAvatar: true }));

    expect(photoRepository.deleteAvatarByProfileId).toHaveBeenCalledWith('profile-1');
    expect(perfilRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ avatarUrl: 'x' })
    );
  });

  it('rejeita profileId vazio', async () => {
    const { useCase } = buildUseCase();

    await expect(useCase.execute(buildInput({ profileId: '   ' }))).rejects.toThrow(
      'O profileId é obrigatório.'
    );
  });

  it('rejeita ausência de file', async () => {
    const { useCase } = buildUseCase();

    await expect(
      useCase.execute(buildInput({ file: undefined as unknown as UploadPhotoUseCaseInput['file'] }))
    ).rejects.toThrow(
      'O arquivo de foto é obrigatório.'
    );
  });

  it('rejeita mimeType não iniciado por image/', async () => {
    const { useCase } = buildUseCase();

    await expect(
      useCase.execute(buildInput({ file: { ...buildInput().file, mimeType: 'application/pdf' } }))
    ).rejects.toThrow('Apenas imagens são permitidas.');
  });

  it('rejeita quando o perfil não existe', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(buildInput())).rejects.toThrow('Perfil não encontrado.');
  });

  it('propaga erro do IImageProcessorService', async () => {
    const { useCase, imageProcessorService } = buildUseCase();

    imageProcessorService.process.mockRejectedValue(new Error('falha no processamento'));

    await expect(useCase.execute(buildInput())).rejects.toThrow('falha no processamento');
  });

  it('propaga erro do IFileStorageService', async () => {
    const { useCase, fileStorageService, imageProcessorService } = buildUseCase();

    imageProcessorService.process.mockResolvedValue({
      buffer: Buffer.from('processed'),
      mimeType: 'image/jpeg',
      sizeBytes: 321,
    });
    fileStorageService.upload.mockRejectedValue(new Error('falha no storage'));

    await expect(useCase.execute(buildInput())).rejects.toThrow('falha no storage');
  });

  it('rejeita upload de galeria quando já há 10 fotos (RF20)', async () => {
    const { useCase, photoRepository, imageProcessorService } = buildUseCase();
    photoRepository.countGalleryByProfileId.mockResolvedValue(10);

    await expect(useCase.execute(buildInput())).rejects.toMatchObject({
      code: 'LIMITE_GALERIA_ATINGIDO',
      kind: 'business',
    });
    // Checa o limite antes de processar/subir a imagem.
    expect(imageProcessorService.process).not.toHaveBeenCalled();
  });

  it('permite trocar o avatar mesmo com a galeria cheia (o avatar é separado)', async () => {
    const { useCase, photoRepository, fileStorageService, imageProcessorService } = buildUseCase();
    photoRepository.countGalleryByProfileId.mockResolvedValue(10);
    imageProcessorService.process.mockResolvedValue({
      buffer: Buffer.from('processed'),
      mimeType: 'image/jpeg',
      sizeBytes: 321,
    });
    fileStorageService.upload.mockResolvedValue({ storagePath: 'x' });

    await expect(useCase.execute(buildInput({ isAvatar: true }))).resolves.toBeTruthy();
  });
});
