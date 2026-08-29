import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateHiringStatusUseCase } from '../../../../src/modules/perfil/application/use-cases/UpdateHiringStatusUseCase';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { BarbeariaDetails } from '../../../../src/modules/perfil/domain/entities/BarbeariaDetails';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeariaDetailsRepository';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';

function buildUseCase() {
  const perfilRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };

  const detailsRepository = {
    findByProfileId: vi.fn(),
    save: vi.fn(),
    saveWithPerfilStatus: vi.fn(),
  };

  const photoRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByProfileId: vi.fn(),
    countGalleryByProfileId: vi.fn().mockResolvedValue(0),
    deleteById: vi.fn(),
    deleteAvatarByProfileId: vi.fn(),
  };

  const useCase = new UpdateHiringStatusUseCase(
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeariaDetailsRepository,
    photoRepository as unknown as IPhotoRepository
  );

  return { useCase, perfilRepository, detailsRepository, photoRepository };
}

function buildDetails(overrides?: Record<string, unknown>) {
  return BarbeariaDetails.create({
    profileId: 'profile-1',
    nomeDecisor: 'João da Silva',
    valores: [],
    ...overrides,
  });
}

describe('UpdateHiringStatusUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita quando o perfil não existe', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ profileId: 'missing-profile', estaContratando: false })
    ).rejects.toThrow('Perfil não encontrado.');
  });

  it('rejeita quando os detalhes da barbearia não existem', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );
    detailsRepository.findByProfileId.mockResolvedValue(null);

    await expect(
      useCase.execute({ profileId: 'profile-1', estaContratando: false })
    ).rejects.toThrow('Detalhes da barbearia não encontrados.');

    expect(detailsRepository.saveWithPerfilStatus).not.toHaveBeenCalled();
  });

  it('rejeita alteração de contratação para perfil de barbeiro', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbeiro' }, 'profile-1')
    );

    await expect(
      useCase.execute({ profileId: 'profile-1', estaContratando: false })
    ).rejects.toMatchObject({
      code: 'PERFIL_NAO_E_BARBEARIA',
      kind: 'permission',
    });
    expect(detailsRepository.findByProfileId).not.toHaveBeenCalled();
  });

  it('pausa a contratação quando estaContratando=false', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );
    detailsRepository.findByProfileId.mockResolvedValue(buildDetails());

    const result = await useCase.execute({ profileId: 'profile-1', estaContratando: false });

    expect(result.details.estaContratando).toBe(false);
    expect(detailsRepository.saveWithPerfilStatus).toHaveBeenCalledTimes(1);
  });

  it('retoma a contratação quando estaContratando=true', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );
    detailsRepository.findByProfileId.mockResolvedValue(
      buildDetails({ estaContratando: false })
    );

    const result = await useCase.execute({ profileId: 'profile-1', estaContratando: true });

    expect(result.details.estaContratando).toBe(true);
  });

  it('RN06 — recalcula o status do perfil para pausado quando para de contratar', async () => {
    const { useCase, perfilRepository, detailsRepository, photoRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create(
        { userType: 'barbearia', nome: 'Barbearia', cidade: 'SP', estado: 'SP' },
        'profile-1'
      )
    );
    detailsRepository.findByProfileId.mockResolvedValue(
      buildDetails({ numCadeiras: 4, faturamentoMedio: 15000, valores: ['Premium'] })
    );
    photoRepository.countGalleryByProfileId.mockResolvedValue(5);

    await useCase.execute({ profileId: 'profile-1', estaContratando: false });

    expect(detailsRepository.saveWithPerfilStatus).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: 'profile-1' }),
      {
      isComplete: true,
      status: 'pausado',
      }
    );
  });
});
