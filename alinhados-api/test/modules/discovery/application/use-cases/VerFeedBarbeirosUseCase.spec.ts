import { describe, it, expect, vi } from 'vitest';
import { VerFeedBarbeirosUseCase } from '../../../../../src/modules/discovery/application/use-cases/VerFeedBarbeirosUseCase';
import {
  IDiscoveryRepository,
  ViewerInfo,
  CardBarbeiro,
} from '../../../../../src/modules/discovery/application/ports/IDiscoveryRepository';
import {
  ViewerNaoEncontradoError,
  AcessoAoFeedNegadoError,
} from '../../../../../src/modules/discovery/domain/errors/DiscoveryErrors';
import { IFileStorageService } from '../../../../../src/shared/storage/IFileStorageService';

const fileStorage = {
  upload: vi.fn(),
  getSignedUrl: vi.fn(async (p: string) => `signed:${p}`),
  getSignedUrls: vi.fn(async (paths: string[]) => paths.map((p) => `signed:${p}`)),
  delete: vi.fn(),
} as unknown as IFileStorageService;

const viewerBarbearia: ViewerInfo = {
  id: 'barbearia-1',
  user_type: 'barbearia',
  cidade: 'São Paulo',
  estado: 'SP',
};

const card: CardBarbeiro = {
  id: 'barbeiro-1',
  nome: 'João',
  avatar_url: null,
  cidade: 'São Paulo',
  estado: 'SP',
  servicos: ['corte'],
  valores: ['higiene'],
  taxa_ocupacao: 80,
  comissao_desejada: 50,
  esta_desempregado: false,
};

function makeRepo(overrides: Partial<IDiscoveryRepository> = {}): IDiscoveryRepository {
  return {
    obterViewer: vi.fn().mockResolvedValue(viewerBarbearia),
    buscarFeedBarbeiros: vi.fn().mockResolvedValue([card]),
    buscarFeedBarbearias: vi.fn().mockResolvedValue([]),
    obterPerfilBarbeiro: vi.fn().mockResolvedValue(null),
    obterPerfilBarbearia: vi.fn().mockResolvedValue(null),
    buscarSwipe: vi.fn().mockResolvedValue(null),
    registrarSwipe: vi.fn(),
    ...overrides,
  };
}

describe('VerFeedBarbeirosUseCase', () => {
  it('retorna o feed de barbeiros para uma barbearia', async () => {
    const repo = makeRepo();
    const useCase = new VerFeedBarbeirosUseCase(repo, fileStorage);

    const result = await useCase.execute({ viewerId: 'barbearia-1', page: 1, pageSize: 20 });

    expect(repo.buscarFeedBarbeiros).toHaveBeenCalledWith(viewerBarbearia, { page: 1, pageSize: 20 });
    expect(result).toEqual({ cards: [card], page: 1, pageSize: 20 });
  });

  it('lança ViewerNaoEncontradoError quando o perfil do viewer não existe', async () => {
    const repo = makeRepo({ obterViewer: vi.fn().mockResolvedValue(null) });
    const useCase = new VerFeedBarbeirosUseCase(repo, fileStorage);

    await expect(useCase.execute({ viewerId: 'x', page: 1, pageSize: 20 })).rejects.toBeInstanceOf(
      ViewerNaoEncontradoError
    );
    expect(repo.buscarFeedBarbeiros).not.toHaveBeenCalled();
  });

  it('lança AcessoAoFeedNegadoError quando o viewer é um barbeiro (feed exclusivo da barbearia)', async () => {
    const repo = makeRepo({
      obterViewer: vi.fn().mockResolvedValue({ ...viewerBarbearia, user_type: 'barbeiro' }),
    });
    const useCase = new VerFeedBarbeirosUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'barbeiro-9', page: 1, pageSize: 20 })
    ).rejects.toBeInstanceOf(AcessoAoFeedNegadoError);
    expect(repo.buscarFeedBarbeiros).not.toHaveBeenCalled();
  });
});
