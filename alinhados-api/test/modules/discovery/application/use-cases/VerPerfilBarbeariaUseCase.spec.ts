import { describe, it, expect, vi } from 'vitest';
import { VerPerfilBarbeariaUseCase } from '../../../../../src/modules/discovery/application/use-cases/VerPerfilBarbeariaUseCase';
import {
  IDiscoveryRepository,
  ViewerInfo,
  PerfilBarbearia,
} from '../../../../../src/modules/discovery/application/ports/IDiscoveryRepository';
import {
  ViewerNaoEncontradoError,
  AcessoAoPerfilNegadoError,
  PerfilNaoEncontradoError,
} from '../../../../../src/modules/discovery/domain/errors/DiscoveryErrors';

import { IFileStorageService } from '../../../../../src/shared/storage/IFileStorageService';

const fileStorage = {
  upload: vi.fn(),
  getSignedUrl: vi.fn(async (p: string) => p),
  getSignedUrls: vi.fn(async (paths: string[]) => paths),
  delete: vi.fn(),
} as unknown as IFileStorageService;

const viewerBarbeiro: ViewerInfo = {
  id: 'barbeiro-1',
  user_type: 'barbeiro',
  cidade: 'São Paulo',
  estado: 'SP',
};

const perfil: PerfilBarbearia = {
  id: 'barbearia-1',
  nome: 'Barbearia do Zé',
  avatar_url: null,
  cidade: 'São Paulo',
  estado: 'SP',
  nome_decisor: 'José',
  num_cadeiras: 4,
  vagas_abertas: 2,
  comissao_paga: 50,
  tem_fixo: true,
  valor_fixo: 1500,
  tem_clube: true,
  descricao_clube: null,
  tem_pops: false,
  num_unidades: 1,
  e_franquia: false,
  faturamento_medio: 40000,
  valores: ['pontualidade'],
  esta_contratando: true,
  fotos: [{ url: 'https://x/1.jpg', ordem: 1, is_avatar: false }],
};

function makeRepo(overrides: Partial<IDiscoveryRepository> = {}): IDiscoveryRepository {
  return {
    obterViewer: vi.fn().mockResolvedValue(viewerBarbeiro),
    buscarFeedBarbeiros: vi.fn().mockResolvedValue([]),
    buscarFeedBarbearias: vi.fn().mockResolvedValue([]),
    obterPerfilBarbeiro: vi.fn().mockResolvedValue(null),
    obterPerfilBarbearia: vi.fn().mockResolvedValue(perfil),
    buscarSwipe: vi.fn().mockResolvedValue(null),
    registrarSwipe: vi.fn(),
    ...overrides,
  };
}

describe('VerPerfilBarbeariaUseCase', () => {
  it('retorna o perfil da barbearia para um barbeiro', async () => {
    const repo = makeRepo();
    const useCase = new VerPerfilBarbeariaUseCase(repo, fileStorage);

    const result = await useCase.execute({ viewerId: 'barbeiro-1', barbeariaId: 'barbearia-1' });

    expect(repo.obterPerfilBarbearia).toHaveBeenCalledWith('barbearia-1');
    expect(result).toEqual({ perfil });
  });

  it('lança ViewerNaoEncontradoError quando o viewer não existe', async () => {
    const repo = makeRepo({ obterViewer: vi.fn().mockResolvedValue(null) });
    const useCase = new VerPerfilBarbeariaUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'x', barbeariaId: 'barbearia-1' })
    ).rejects.toBeInstanceOf(ViewerNaoEncontradoError);
    expect(repo.obterPerfilBarbearia).not.toHaveBeenCalled();
  });

  it('lança AcessoAoPerfilNegadoError quando o viewer é uma barbearia (RN02)', async () => {
    const repo = makeRepo({
      obterViewer: vi.fn().mockResolvedValue({ ...viewerBarbeiro, user_type: 'barbearia' }),
    });
    const useCase = new VerPerfilBarbeariaUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'barbearia-9', barbeariaId: 'barbearia-1' })
    ).rejects.toBeInstanceOf(AcessoAoPerfilNegadoError);
    expect(repo.obterPerfilBarbearia).not.toHaveBeenCalled();
  });

  it('lança PerfilNaoEncontradoError quando a barbearia não existe', async () => {
    const repo = makeRepo({ obterPerfilBarbearia: vi.fn().mockResolvedValue(null) });
    const useCase = new VerPerfilBarbeariaUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'barbeiro-1', barbeariaId: 'inexistente' })
    ).rejects.toBeInstanceOf(PerfilNaoEncontradoError);
  });
});
