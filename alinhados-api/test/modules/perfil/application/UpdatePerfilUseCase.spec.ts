import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdatePerfilUseCase } from '../../../../src/modules/perfil/application/use-cases/UpdatePerfilUseCase';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeariaDetailsRepository';
import { IBarbeiroDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeiroDetailsRepository';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';

function buildUseCase() {
  const perfilRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };

  const detailsRepository = {
    findByProfileId: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
  };

  const barbeiroDetailsRepository = {
    findByProfileId: vi.fn().mockResolvedValue(null),
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

  const useCase = new UpdatePerfilUseCase(
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeariaDetailsRepository,
    barbeiroDetailsRepository as unknown as IBarbeiroDetailsRepository,
    photoRepository as unknown as IPhotoRepository
  );

  return { useCase, perfilRepository, detailsRepository, barbeiroDetailsRepository, photoRepository };
}

describe('UpdatePerfilUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita quando o perfil não existe', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id', bio: 'nova bio' })).rejects.toThrow(
      'Perfil não encontrado.'
    );
  });

  it('atualiza somente a bio sem apagar o nome existente', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    const current = Perfil.create({ userType: 'barbearia', nome: 'Barbearia do João', bio: 'antiga' }, 'id-1');
    perfilRepository.findById.mockResolvedValue(current);

    const result = await useCase.execute({ id: 'id-1', bio: 'bio nova' });

    expect(result.perfil.nome).toBe('Barbearia do João');
    expect(result.perfil.bio).toBe('bio nova');
  });

  it('atualiza cidade e estado', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    const current = Perfil.create({ userType: 'barbearia', nome: 'Barbearia do João' }, 'id-1');
    perfilRepository.findById.mockResolvedValue(current);

    const result = await useCase.execute({ id: 'id-1', cidade: 'São Paulo', estado: 'SP' });

    expect(result.perfil.cidade).toBe('São Paulo');
    expect(result.perfil.estado).toBe('SP');
  });

  it('preserva o createdAt original ao atualizar', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    const current = Perfil.create({ userType: 'barbearia' }, 'id-1');
    const originalCreatedAt = current.createdAt;
    perfilRepository.findById.mockResolvedValue(current);

    const result = await useCase.execute({ id: 'id-1', bio: 'nova bio' });

    expect(result.perfil.createdAt).toEqual(originalCreatedAt);
  });

  it('recalcula a completude (RN01) e persiste o perfil já com o status novo', async () => {
    const { useCase, perfilRepository, photoRepository } = buildUseCase();
    const current = Perfil.create({ userType: 'barbeiro', nome: 'Pedro' }, 'id-1');
    perfilRepository.findById.mockResolvedValue(current);
    photoRepository.countGalleryByProfileId.mockResolvedValue(0);

    const result = await useCase.execute({ id: 'id-1', cidade: 'São Paulo', estado: 'SP' });

    // Barbeiro sem detalhes (comissão/taxa/serviços/valores) e sem galeria não está completo (B02/RN01).
    expect(result.perfil.isComplete).toBe(false);
    expect(result.perfil.status).toBe('indisponivel');
    expect(perfilRepository.save).toHaveBeenCalledWith(current);
  });
});
