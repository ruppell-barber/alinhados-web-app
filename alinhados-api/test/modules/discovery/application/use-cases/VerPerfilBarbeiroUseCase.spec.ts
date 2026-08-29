import { describe, it, expect, vi } from 'vitest';
import { VerPerfilBarbeiroUseCase } from '../../../../../src/modules/discovery/application/use-cases/VerPerfilBarbeiroUseCase';
import {
  IDiscoveryRepository,
  ViewerInfo,
  PerfilBarbeiro,
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

const viewerBarbearia: ViewerInfo = {
  id: 'barbearia-1',
  user_type: 'barbearia',
  cidade: 'São Paulo',
  estado: 'SP',
};

const perfil: PerfilBarbeiro = {
  id: 'barbeiro-1',
  nome: 'João',
  avatar_url: null,
  cidade: 'São Paulo',
  estado: 'SP',
  apelido_profissional: 'João Navalha',
  anos_experiencia: 8,
  servicos: ['corte'],
  cursos_formacao: null,
  comissao_desejada: 50,
  faturamento_mensal: 6000,
  taxa_ocupacao: 80,
  recorde_meta: null,
  valores: ['higiene'],
  barbearia_atual: null,
  esta_desempregado: true,
  fotos: [{ url: 'https://x/1.jpg', ordem: 1, is_avatar: false }],
};

function makeRepo(overrides: Partial<IDiscoveryRepository> = {}): IDiscoveryRepository {
  return {
    obterViewer: vi.fn().mockResolvedValue(viewerBarbearia),
    buscarFeedBarbeiros: vi.fn().mockResolvedValue([]),
    buscarFeedBarbearias: vi.fn().mockResolvedValue([]),
    obterPerfilBarbeiro: vi.fn().mockResolvedValue(perfil),
    obterPerfilBarbearia: vi.fn().mockResolvedValue(null),
    buscarSwipe: vi.fn().mockResolvedValue(null),
    registrarSwipe: vi.fn(),
    ...overrides,
  };
}

describe('VerPerfilBarbeiroUseCase', () => {
  it('retorna o perfil do barbeiro para uma barbearia', async () => {
    const repo = makeRepo();
    const useCase = new VerPerfilBarbeiroUseCase(repo, fileStorage);

    const result = await useCase.execute({ viewerId: 'barbearia-1', barbeiroId: 'barbeiro-1' });

    expect(repo.obterPerfilBarbeiro).toHaveBeenCalledWith('barbeiro-1');
    expect(result).toEqual({ perfil });
  });

  it('lança ViewerNaoEncontradoError quando o viewer não existe', async () => {
    const repo = makeRepo({ obterViewer: vi.fn().mockResolvedValue(null) });
    const useCase = new VerPerfilBarbeiroUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'x', barbeiroId: 'barbeiro-1' })
    ).rejects.toBeInstanceOf(ViewerNaoEncontradoError);
    expect(repo.obterPerfilBarbeiro).not.toHaveBeenCalled();
  });

  it('lança AcessoAoPerfilNegadoError quando o viewer é um barbeiro (RN02)', async () => {
    const repo = makeRepo({
      obterViewer: vi.fn().mockResolvedValue({ ...viewerBarbearia, user_type: 'barbeiro' }),
    });
    const useCase = new VerPerfilBarbeiroUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'barbeiro-9', barbeiroId: 'barbeiro-1' })
    ).rejects.toBeInstanceOf(AcessoAoPerfilNegadoError);
    expect(repo.obterPerfilBarbeiro).not.toHaveBeenCalled();
  });

  it('lança PerfilNaoEncontradoError quando o barbeiro não existe', async () => {
    const repo = makeRepo({ obterPerfilBarbeiro: vi.fn().mockResolvedValue(null) });
    const useCase = new VerPerfilBarbeiroUseCase(repo, fileStorage);

    await expect(
      useCase.execute({ viewerId: 'barbearia-1', barbeiroId: 'inexistente' })
    ).rejects.toBeInstanceOf(PerfilNaoEncontradoError);
  });
});
