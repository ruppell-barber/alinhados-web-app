import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { CreateOrUpdateBarbeiroDetailsUseCase } from '../../../../src/modules/perfil/application/use-cases/CreateOrUpdateBarbeiroDetailsUseCase';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeiroDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeiroDetailsRepository';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';
import { IDocumentoProtector } from '../../../../src/modules/perfil/application/ports/IDocumentoProtector';
import { PerfilNaoPertenceAoBarbeiroError, PerfilNaoEncontradoError } from '../../../../src/modules/perfil/domain/errors/PerfilErrors';

function buildUseCase() {
  const perfilRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };
  const detailsRepository = {
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
  const documentoProtector = {
    protect: vi.fn((value: string) => `protected:${value}`),
  };

  const useCase = new CreateOrUpdateBarbeiroDetailsUseCase(
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeiroDetailsRepository,
    photoRepository as unknown as IPhotoRepository,
    documentoProtector as IDocumentoProtector
  );

  return { useCase, perfilRepository, detailsRepository, photoRepository, documentoProtector };
}

describe('CreateOrUpdateBarbeiroDetailsUseCase', () => {
  it('cria os detalhes de um barbeiro e persiste com status derivado', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(Perfil.create({ userType: 'barbeiro' }, 'profile-1'));

    const { details } = await useCase.execute({
      profileId: 'profile-1',
      comissaoDesejada: 50,
      taxaOcupacao: 80,
      servicos: ['corte', ' barba '],
      valores: [' pontualidade '],
    });

    expect(details.comissaoDesejada).toBe(50);
    expect(details.servicos).toEqual(['corte', 'barba']);
    expect(details.valores).toEqual(['pontualidade']);
    expect(detailsRepository.saveWithPerfilStatus).toHaveBeenCalledTimes(1);
  });

  it('protege o CPF antes de persistir', async () => {
    const { useCase, perfilRepository, documentoProtector } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(Perfil.create({ userType: 'barbeiro' }, 'profile-1'));

    const { details } = await useCase.execute({ profileId: 'profile-1', cpf: '529.982.247-25' });

    expect(documentoProtector.protect).toHaveBeenCalledWith('52998224725');
    expect(details.cpfHash).toBe('protected:52998224725');
  });

  it('lança PerfilNaoEncontradoError quando o perfil não existe', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ profileId: 'x' })).rejects.toBeInstanceOf(
      PerfilNaoEncontradoError
    );
  });

  it('lança PerfilNaoPertenceAoBarbeiroError quando o perfil é uma barbearia', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    await expect(useCase.execute({ profileId: 'profile-1' })).rejects.toBeInstanceOf(
      PerfilNaoPertenceAoBarbeiroError
    );
  });
});
