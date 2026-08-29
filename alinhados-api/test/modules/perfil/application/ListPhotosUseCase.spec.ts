import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListPhotosUseCase } from '../../../../src/modules/perfil/application/use-cases/ListPhotosUseCase';
import { Photo } from '../../../../src/modules/perfil/domain/entities/Photo';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';
import { IFileStorageService } from '../../../../src/shared/storage/IFileStorageService';

function buildUseCase() {
  const photoRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByProfileId: vi.fn(),
    countGalleryByProfileId: vi.fn(),
    deleteById: vi.fn(),
    deleteAvatarByProfileId: vi.fn(),
  };

  const fileStorage = {
    upload: vi.fn(),
    getSignedUrl: vi.fn(),
    getSignedUrls: vi.fn(async (paths: string[]) => paths),
    delete: vi.fn(),
  };

  const useCase = new ListPhotosUseCase(
    photoRepository as unknown as IPhotoRepository,
    fileStorage as unknown as IFileStorageService
  );

  return { useCase, photoRepository, fileStorage };
}

describe('ListPhotosUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita profileId vazio', async () => {
    const { useCase } = buildUseCase();

    await expect(useCase.execute({ profileId: '' })).rejects.toThrow('profileId é obrigatório.');
  });

  it('lista as fotos do perfil com o total', async () => {
    const { useCase, photoRepository } = buildUseCase();
    photoRepository.findByProfileId.mockResolvedValue([
      Photo.create({ profileId: 'profile-1', url: '/a.jpg' }, 'photo-1'),
      Photo.create({ profileId: 'profile-1', url: '/b.jpg', isAvatar: true }, 'photo-2'),
    ]);

    const result = await useCase.execute({ profileId: 'profile-1' });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
  });
});
