import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeletePhotoUseCase } from '../../../../src/modules/perfil/application/use-cases/DeletePhotoUseCase';
import { Photo } from '../../../../src/modules/perfil/domain/entities/Photo';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeariaDetailsRepository';
import { IFileStorageService } from '../../../../src/shared/storage/IFileStorageService';

function buildUseCase() {
  const photoRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByProfileId: vi.fn(),
    countGalleryByProfileId: vi.fn().mockResolvedValue(0),
    deleteById: vi.fn(),
    deleteAvatarByProfileId: vi.fn(),
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

  const fileStorage = {
    upload: vi.fn(),
    getSignedUrl: vi.fn(),
    getSignedUrls: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  const useCase = new DeletePhotoUseCase(
    photoRepository as unknown as IPhotoRepository,
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeariaDetailsRepository,
    fileStorage as unknown as IFileStorageService
  );

  return { useCase, photoRepository, perfilRepository, fileStorage };
}

describe('DeletePhotoUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita profileId ou photoId vazios', async () => {
    const { useCase } = buildUseCase();

    await expect(useCase.execute({ profileId: '', photoId: 'photo-1' })).rejects.toThrow(
      'profileId é obrigatório.'
    );
    await expect(useCase.execute({ profileId: 'profile-1', photoId: '' })).rejects.toThrow(
      'photoId é obrigatório.'
    );
  });

  it('rejeita quando a foto não existe', async () => {
    const { useCase, photoRepository } = buildUseCase();
    photoRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ profileId: 'profile-1', photoId: 'missing' })
    ).rejects.toThrow('Foto não encontrada.');
  });

  it('rejeita quando a foto não pertence ao perfil autenticado', async () => {
    const { useCase, photoRepository } = buildUseCase();
    photoRepository.findById.mockResolvedValue(
      Photo.create({ profileId: 'outro-perfil', url: '/a.jpg' }, 'photo-1')
    );

    await expect(
      useCase.execute({ profileId: 'profile-1', photoId: 'photo-1' })
    ).rejects.toMatchObject({
      code: 'FOTO_NAO_PERTENCE_AO_PERFIL',
      kind: 'permission',
    });
  });

  it('remove a foto e recalcula a completude do perfil', async () => {
    const { useCase, photoRepository, perfilRepository } = buildUseCase();
    photoRepository.findById.mockResolvedValue(
      Photo.create({ profileId: 'profile-1', url: '/a.jpg' }, 'photo-1')
    );

    const result = await useCase.execute({ profileId: 'profile-1', photoId: 'photo-1' });

    expect(result.deleted).toBe(true);
    expect(photoRepository.deleteById).toHaveBeenCalledWith('photo-1');
    expect(perfilRepository.save).toHaveBeenCalledTimes(1);
  });
});
