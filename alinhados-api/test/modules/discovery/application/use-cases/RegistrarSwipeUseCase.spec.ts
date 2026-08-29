import { describe, it, expect, vi } from 'vitest';
import { RegistrarSwipeUseCase } from '../../../../../src/modules/discovery/application/use-cases/RegistrarSwipeUseCase';
import { IDiscoveryRepository, ViewerInfo, SwipeRegistrado } from '../../../../../src/modules/discovery/application/ports/IDiscoveryRepository';
import {
  ViewerNaoEncontradoError,
  PerfilAvaliadoNaoEncontradoError,
  SwipeInvalidoError,
} from '../../../../../src/modules/discovery/domain/errors/DiscoveryErrors';

const barbearia: ViewerInfo = {
  id: 'barbearia-1',
  user_type: 'barbearia',
  cidade: 'São Paulo',
  estado: 'SP',
};

const barbeiro: ViewerInfo = {
  id: 'barbeiro-1',
  user_type: 'barbeiro',
  cidade: 'São Paulo',
  estado: 'SP',
};

const swipeRegistrado: SwipeRegistrado = {
  id: 'swipe-1',
  swiperId: barbearia.id,
  swipedId: barbeiro.id,
  direction: 'like',
  createdAt: new Date('2026-07-28T12:00:00.000Z'),
};

function makeRepo(overrides: Partial<IDiscoveryRepository> = {}): IDiscoveryRepository {
  return {
    obterViewer: vi.fn(async (id: string) => {
      if (id === barbearia.id) return barbearia;
      if (id === barbeiro.id) return barbeiro;
      return null;
    }),
    buscarFeedBarbeiros: vi.fn().mockResolvedValue([]),
    buscarFeedBarbearias: vi.fn().mockResolvedValue([]),
    buscarSwipe: vi.fn().mockResolvedValue(null),
    registrarSwipe: vi.fn().mockResolvedValue(swipeRegistrado),
    obterPerfilBarbeiro: vi.fn().mockResolvedValue(null),
    obterPerfilBarbearia: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('RegistrarSwipeUseCase', () => {
  it('registra um like com sucesso', async () => {
    const repo = makeRepo();
    const useCase = new RegistrarSwipeUseCase(repo);

    const result = await useCase.execute({
      swiperId: barbearia.id,
      swipedId: barbeiro.id,
      direction: 'like',
    });

    expect(repo.registrarSwipe).toHaveBeenCalledWith({
      swiperId: barbearia.id,
      swipedId: barbeiro.id,
      direction: 'like',
    });
    expect(result).toEqual(swipeRegistrado);
  });

  it('registra um dislike com sucesso', async () => {
    const dislike = { ...swipeRegistrado, direction: 'dislike' as const };
    const repo = makeRepo({ registrarSwipe: vi.fn().mockResolvedValue(dislike) });
    const useCase = new RegistrarSwipeUseCase(repo);

    const result = await useCase.execute({
      swiperId: barbearia.id,
      swipedId: barbeiro.id,
      direction: 'dislike',
    });

    expect(result).toEqual(dislike);
  });

  it('lança ViewerNaoEncontradoError quando o swiper não existe', async () => {
    const repo = makeRepo();
    const useCase = new RegistrarSwipeUseCase(repo);

    await expect(
      useCase.execute({ swiperId: 'inexistente', swipedId: barbeiro.id, direction: 'like' })
    ).rejects.toBeInstanceOf(ViewerNaoEncontradoError);
    expect(repo.registrarSwipe).not.toHaveBeenCalled();
  });

  it('lança PerfilAvaliadoNaoEncontradoError quando o swiped não existe', async () => {
    const repo = makeRepo();
    const useCase = new RegistrarSwipeUseCase(repo);

    await expect(
      useCase.execute({ swiperId: barbearia.id, swipedId: 'inexistente', direction: 'like' })
    ).rejects.toBeInstanceOf(PerfilAvaliadoNaoEncontradoError);
    expect(repo.registrarSwipe).not.toHaveBeenCalled();
  });

  it('lança SwipeInvalidoError em auto-swipe', async () => {
    const repo = makeRepo();
    const useCase = new RegistrarSwipeUseCase(repo);

    await expect(
      useCase.execute({ swiperId: barbearia.id, swipedId: barbearia.id, direction: 'like' })
    ).rejects.toBeInstanceOf(SwipeInvalidoError);
    expect(repo.registrarSwipe).not.toHaveBeenCalled();
  });

  it('lança SwipeInvalidoError quando swiper e swiped são do mesmo user_type', async () => {
    const outraBarbearia: ViewerInfo = { ...barbearia, id: 'barbearia-2' };
    const repo = makeRepo({
      obterViewer: vi.fn(async (id: string) => {
        if (id === barbearia.id) return barbearia;
        if (id === outraBarbearia.id) return outraBarbearia;
        return null;
      }),
    });
    const useCase = new RegistrarSwipeUseCase(repo);

    await expect(
      useCase.execute({ swiperId: barbearia.id, swipedId: outraBarbearia.id, direction: 'like' })
    ).rejects.toBeInstanceOf(SwipeInvalidoError);
    expect(repo.registrarSwipe).not.toHaveBeenCalled();
  });

  it('é idempotente: se já existe swipe para o par, retorna o existente sem duplicar', async () => {
    const repo = makeRepo({ buscarSwipe: vi.fn().mockResolvedValue(swipeRegistrado) });
    const useCase = new RegistrarSwipeUseCase(repo);

    const result = await useCase.execute({
      swiperId: barbearia.id,
      swipedId: barbeiro.id,
      direction: 'dislike', // tentativa de "mudar de ideia" — RN14: não desfaz, não duplica
    });

    expect(result).toEqual(swipeRegistrado);
    expect(repo.registrarSwipe).not.toHaveBeenCalled();
  });
});
