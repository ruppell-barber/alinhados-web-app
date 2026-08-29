import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetPerfilUseCase } from '../../../../src/modules/perfil/application/use-cases/GetPerfilUseCase';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { BarbeariaDetails } from '../../../../src/modules/perfil/domain/entities/BarbeariaDetails';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeariaDetailsRepository';
import { IFileStorageService } from '../../../../src/shared/storage/IFileStorageService';

function buildUseCase() {
  const perfilRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };

  const detailsRepository = {
    findByProfileId: vi.fn(),
    save: vi.fn(),
  };

  const fileStorage = {
    upload: vi.fn(),
    getSignedUrl: vi.fn(),
    getSignedUrls: vi.fn(async (paths: string[]) => paths),
    delete: vi.fn(),
  };

  const useCase = new GetPerfilUseCase(
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeariaDetailsRepository,
    fileStorage as unknown as IFileStorageService
  );

  return { useCase, perfilRepository, detailsRepository, fileStorage };
}

describe('GetPerfilUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita quando o perfil não existe', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id' })).rejects.toThrow('Perfil não encontrado.');
  });

  it('retorna o perfil com details=null quando ainda não há detalhes cadastrados', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia', nome: 'Barbearia do João' }, 'id-1')
    );
    detailsRepository.findByProfileId.mockResolvedValue(null);

    const result = await useCase.execute({ id: 'id-1' });

    expect(result.perfil.nome).toBe('Barbearia do João');
    expect(result.details).toBeNull();
  });

  it('retorna o perfil junto com os detalhes quando existentes', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia', nome: 'Barbearia do João' }, 'id-1')
    );
    detailsRepository.findByProfileId.mockResolvedValue(
      BarbeariaDetails.create({
        profileId: 'id-1',
        nomeDecisor: 'João da Silva',
        valores: [],
      })
    );

    const result = await useCase.execute({ id: 'id-1' });

    expect(result.details?.nomeDecisor).toBe('João da Silva');
  });
});
