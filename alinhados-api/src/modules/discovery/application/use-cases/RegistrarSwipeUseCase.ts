import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IDiscoveryRepository, SwipeRegistrado } from '../ports/IDiscoveryRepository';
import {
  ViewerNaoEncontradoError,
  PerfilAvaliadoNaoEncontradoError,
  SwipeInvalidoError,
} from '../../domain/errors/DiscoveryErrors';

export interface RegistrarSwipeInput {
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'dislike';
}

export type RegistrarSwipeOutput = SwipeRegistrado;

/**
 * Registro de like/dislike no feed (RF57). Irreversível na V1 (RF61, RN14): se o par já tiver um
 * swipe registrado, devolve o registro original sem alterar a direção nem duplicar a linha —
 * é assim que a idempotência/irreversibilidade se expressa aqui.
 */
@injectable()
export class RegistrarSwipeUseCase implements UseCase<RegistrarSwipeInput, RegistrarSwipeOutput> {
  constructor(
    @inject('IDiscoveryRepository') private readonly discoveryRepository: IDiscoveryRepository
  ) {}

  async execute(input: RegistrarSwipeInput): Promise<RegistrarSwipeOutput> {
    const swiper = await this.discoveryRepository.obterViewer(input.swiperId);
    if (!swiper) {
      throw new ViewerNaoEncontradoError();
    }

    const swiped = await this.discoveryRepository.obterViewer(input.swipedId);
    if (!swiped) {
      throw new PerfilAvaliadoNaoEncontradoError();
    }

    // RN02 espelhado: o feed só apresenta o lado oposto, então um swipe fora dessa relação
    // (auto-swipe ou mesmo user_type) não corresponde a nenhum card real e corromperia a base
    // que o Épico E6 usa para detectar match.
    if (swiper.id === swiped.id || swiper.user_type === swiped.user_type) {
      throw new SwipeInvalidoError();
    }

    const swipeExistente = await this.discoveryRepository.buscarSwipe(input.swiperId, input.swipedId);
    if (swipeExistente) {
      return swipeExistente;
    }

    return this.discoveryRepository.registrarSwipe(input);
  }
}
