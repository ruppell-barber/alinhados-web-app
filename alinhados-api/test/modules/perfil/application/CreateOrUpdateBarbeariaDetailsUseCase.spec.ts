import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateOrUpdateBarbeariaDetailsUseCase } from '../../../../src/modules/perfil/application/use-cases/CreateOrUpdateBarbeariaDetailsUseCase';
import { Perfil } from '../../../../src/modules/perfil/domain/entities/Perfil';
import { BarbeariaDetails } from '../../../../src/modules/perfil/domain/entities/BarbeariaDetails';
import { IPerfilRepository } from '../../../../src/modules/perfil/application/ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../../../../src/modules/perfil/application/ports/IBarbeariaDetailsRepository';
import { IPhotoRepository } from '../../../../src/modules/perfil/application/ports/IPhotoRepository';
import { IDocumentoProtector } from '../../../../src/modules/perfil/application/ports/IDocumentoProtector';

function buildUseCase() {
  const perfilRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };

  const detailsRepository = {
    findByProfileId: vi.fn().mockResolvedValue(null),
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

  const documentoProtector = {
    protect: vi.fn((value: string) => `protected:${value}`),
  };

  const useCase = new CreateOrUpdateBarbeariaDetailsUseCase(
    perfilRepository as unknown as IPerfilRepository,
    detailsRepository as unknown as IBarbeariaDetailsRepository,
    photoRepository as unknown as IPhotoRepository,
    documentoProtector as IDocumentoProtector
  );

  return {
    useCase,
    perfilRepository,
    detailsRepository,
    photoRepository,
    documentoProtector,
  };
}

function buildInput(overrides?: Record<string, unknown>) {
  return {
    profileId: 'profile-1',
    nomeDecisor: 'João da Silva',
    valores: ['Premium', ' Moderno '],
    ...overrides,
  };
}

describe('CreateOrUpdateBarbeariaDetailsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejeita quando o perfil referenciado não existe', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(buildInput())).rejects.toThrow('Perfil não encontrado.');
  });

  it('cria os detalhes com os campos normalizados', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    const result = await useCase.execute(buildInput());

    expect(result.details.profileId).toBe('profile-1');
    expect(result.details.valores).toEqual(['Premium', 'Moderno']);
    expect(detailsRepository.saveWithPerfilStatus).toHaveBeenCalledTimes(1);
  });

  it('rejeita detalhes de barbearia para um perfil de barbeiro', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbeiro' }, 'profile-1')
    );

    await expect(useCase.execute(buildInput())).rejects.toMatchObject({
      code: 'PERFIL_NAO_E_BARBEARIA',
      kind: 'permission',
    });
    expect(detailsRepository.saveWithPerfilStatus).not.toHaveBeenCalled();
  });

  it('limita valores a 6 mesmo se vier mais do que isso', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    const result = await useCase.execute(
      buildInput({ valores: ['1', '2', '3', '4', '5', '6', '7', '8'] })
    );

    expect(result.details.valores).toHaveLength(6);
  });

  it('RF27 — reaproveita os detalhes existentes em vez de recriar do zero', async () => {
    const { useCase, perfilRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );
    detailsRepository.findByProfileId.mockResolvedValue(
      BarbeariaDetails.create({
        profileId: 'profile-1',
        nomeDecisor: 'João da Silva',
        numCadeiras: 4,
        valores: ['Premium'],
      })
    );

    const result = await useCase.execute(
      buildInput({ nomeDecisor: undefined, numCadeiras: undefined, vagasAbertas: 2 })
    );

    expect(result.details.nomeDecisor).toBe('João da Silva');
    expect(result.details.numCadeiras).toBe(4);
    expect(result.details.vagasAbertas).toBe(2);
  });

  it('LGPD/RNF03 — criptografa o cnpj em vez de persistir em texto puro', async () => {
    const { useCase, perfilRepository, detailsRepository, documentoProtector } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    const result = await useCase.execute(buildInput({ cnpj: '11.222.333/0001-81' }));

    expect(documentoProtector.protect).toHaveBeenCalledWith('11222333000181');
    expect(result.details.cnpjHash).toBe('protected:11222333000181');
    expect(detailsRepository.saveWithPerfilStatus).toHaveBeenCalledTimes(1);
  });

  it('rejeita CNPJ inválido antes de chamar a proteção', async () => {
    const { useCase, perfilRepository, documentoProtector } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    await expect(
      useCase.execute(buildInput({ cnpj: '11.111.111/1111-11' }))
    ).rejects.toMatchObject({ code: 'CNPJ_INVALIDO' });
    expect(documentoProtector.protect).not.toHaveBeenCalled();
  });

  it('E02 — aceita comissaoPaga e temFixo/valorFixo', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    const result = await useCase.execute(
      buildInput({ comissaoPaga: 55, temFixo: true, valorFixo: 1200 })
    );

    expect(result.details.comissaoPaga).toBe(55);
    expect(result.details.temFixo).toBe(true);
    expect(result.details.valorFixo).toBe(1200);
  });

  it('E02 — rejeita comissaoPaga fora da faixa 40-60', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    await expect(useCase.execute(buildInput({ comissaoPaga: 90 }))).rejects.toThrow(
      'A comissão paga deve estar entre 40% e 60%.'
    );
  });

  it('E09 — aceita vagasAbertas', async () => {
    const { useCase, perfilRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia' }, 'profile-1')
    );

    const result = await useCase.execute(buildInput({ vagasAbertas: 3 }));

    expect(result.details.vagasAbertas).toBe(3);
  });

  it('recalcula e persiste a completude do perfil (RN01) após salvar', async () => {
    const { useCase, perfilRepository, photoRepository, detailsRepository } = buildUseCase();
    perfilRepository.findById.mockResolvedValue(
      Perfil.create({ userType: 'barbearia', nome: 'Barbearia', cidade: 'SP', estado: 'SP' }, 'profile-1')
    );
    photoRepository.countGalleryByProfileId.mockResolvedValue(5);

    await useCase.execute(buildInput({ numCadeiras: 4, faturamentoMedio: 15000 }));

    expect(detailsRepository.saveWithPerfilStatus).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: 'profile-1' }),
      {
        isComplete: true,
        status: 'aberto',
      }
    );
  });
});
