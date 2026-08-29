import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IDiscoveryRepository, CardBarbeiro } from '../ports/IDiscoveryRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import { ViewerNaoEncontradoError, AcessoAoFeedNegadoError } from '../../domain/errors/DiscoveryErrors';

export interface VerFeedBarbeirosInput {
  viewerId: string;
  page: number;
  pageSize: number;
}

export interface VerFeedBarbeirosOutput {
  cards: CardBarbeiro[];
  page: number;
  pageSize: number;
}

/**
 * Feed de barbeiros compatíveis — exclusivo da barbearia (E04). O feed de barbearias (visto pelo
 * barbeiro) é a B04, num use case próprio, reaproveitando o mesmo repositório/motor de query.
 */
@injectable()
export class VerFeedBarbeirosUseCase
  implements UseCase<VerFeedBarbeirosInput, VerFeedBarbeirosOutput>
{
  constructor(
    @inject('IDiscoveryRepository') private readonly discoveryRepository: IDiscoveryRepository,
    @inject('IFileStorageService') private readonly fileStorage: IFileStorageService
  ) {}

  async execute(input: VerFeedBarbeirosInput): Promise<VerFeedBarbeirosOutput> {
    const viewer = await this.discoveryRepository.obterViewer(input.viewerId);
    if (!viewer) {
      throw new ViewerNaoEncontradoError();
    }

    // RN02: quem vê barbeiros é a barbearia. Barbeiro deve usar o feed de barbearias (B04).
    if (viewer.user_type !== 'barbearia') {
      throw new AcessoAoFeedNegadoError();
    }

    const cards = await this.discoveryRepository.buscarFeedBarbeiros(viewer, {
      page: input.page,
      pageSize: input.pageSize,
    });

    // avatar_url guarda o path; troca por signed URL temporária na resposta (cards sem avatar ficam null).
    const comAvatar = cards.filter((c) => c.avatar_url);
    const assinadas = await this.fileStorage.getSignedUrls(comAvatar.map((c) => c.avatar_url as string));
    comAvatar.forEach((c, i) => {
      c.avatar_url = assinadas[i];
    });

    return { cards, page: input.page, pageSize: input.pageSize };
  }
}
