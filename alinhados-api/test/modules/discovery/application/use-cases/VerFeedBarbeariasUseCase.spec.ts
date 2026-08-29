import { describe, it, expect, vi } from 'vitest';
import { VerFeedBarbeariasUseCase } from '../../../../../src/modules/discovery/application/use-cases/VerFeedBarbeariasUseCase';
import {
  IDiscoveryRepository,
  ViewerInfo,
  CardBarbearia,
} from '../../../../../src/modules/discovery/application/ports/IDiscoveryRepository';
import {
  ViewerNaoEncontradoError,
  AcessoAoFeedNegadoError,
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

const card: CardBarbearia = {
  id: 'barbearia-1',
  nome: 'Barbearia do Zé',
  avatar_url: null,
  cidade: 'São Paulo',
  estado: 'SP',
  num_cadeiras: 4,
  comissao_paga: 50,
  tem_fixo: true,
  valor_fixo: 1500,
  valores: ['pontualidade'],
};

function makeRepo(overrides: Partial<IDiscoveryRepository> = {}): IDiscoveryRepository {
  return {
    obterViewer: vi.fn().mockResolvedValue(viewerBarbeiro),
    buscarFeedBarbeiros: vi.fn().mockResolvedValue([]),
    buscarFeedBarbearias: vi.fn().mockResolvedValue([card]),
    obterPerfilBarbeiro: vi.fn().mockResolvedValue(null),
    obterPerfilBarbearia: vi.fn().mockResolvedValue(null),
    buscarSwipe: vi.fn().mockResolvedValue(null),
    registrarSwipe: vi.fn(),
    ...overrides,
  };
}

describe('VerFeedBarbeariasUseCase', () => {
  it('retorna o feed de barbearias para um barbeiro', async () => {
    const repo = makeRepo();
    const useCase = new VerFeedBarbeariasUseCase(repo, fileStorage);

    const result = await useCase.execute({ viewerId: 'barbeiro-1', page: 1, pageSize: 20 });

    expect(repo.buscarFeedBarbearias).toHaveBeenCalledWith(viewerBarbeiro, { page: 1, pageSize: 20 });
    expect(result).toEqual({ cards: [card], page: 1, pageSize: 20 });
  });

  it('lança ViewerNaoEncontradoError quando o perfil do viewer não existe', async () => {
    const repo = makeRepo({ obterViewer: vi.fn().mockResolvedValue(null) });
    const useCase = new VerFeedBarbeariasUseCase(repo, fileStorage);

    await expect(useCase.execute({ viewerId: 'x', page: 1, pageSize: 20 })).rejects.toBeInstanceOf(
      ViewerNaoEncontradoError
    );
    expect(repo.buscarFeedBarbearias).not.toHaveBeenCalled();
  });

  it('lança AcessoAoFeedNegadoError quando o viewer é uma barbearia (feed exclusivo do barbeiro)', async () => {
    const repo = makeRepo({
      obterViewer: vi.fn().mockResolvedValue({ ...viewerBarbeiro, user_type: 'barbearia' }),
    });
    const useCase = new VerFeedBarbeariasUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'barbearia-9', page: 1, pageSize: 20 })
    ).rejects.toBeInstanceOf(AcessoAoFeedNegadoError);
    expect(repo.buscarFeedBarbearias).not.toHaveBeenCalled();
  });
});
