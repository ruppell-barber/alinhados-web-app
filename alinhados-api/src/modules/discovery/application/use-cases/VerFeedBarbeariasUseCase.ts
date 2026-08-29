import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IDiscoveryRepository, CardBarbearia } from '../ports/IDiscoveryRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import { ViewerNaoEncontradoError, AcessoAoFeedNegadoError } from '../../domain/errors/DiscoveryErrors';

export interface VerFeedBarbeariasInput {
  viewerId: string;
  page: number;
  pageSize: number;
}

export interface VerFeedBarbeariasOutput {
  cards: CardBarbearia[];
  page: number;
  pageSize: number;
}

/**
 * Feed de barbearias compatíveis — exclusivo do barbeiro (B04). Espelho do feed de barbeiros (E04),
 * invertendo o lado (RN02) e reaproveitando o mesmo repositório/motor de query.
 */
@injectable()
export class VerFeedBarbeariasUseCase
  implements UseCase<VerFeedBarbeariasInput, VerFeedBarbeariasOutput>
{
  constructor(
    @inject('IDiscoveryRepository') private readonly discoveryRepository: IDiscoveryRepository,
    @inject('IFileStorageService') private readonly fileStorage: IFileStorageService
  ) {}

  async execute(input: VerFeedBarbeariasInput): Promise<VerFeedBarbeariasOutput> {
    const viewer = await this.discoveryRepository.obterViewer(input.viewerId);
    if (!viewer) {
      throw new ViewerNaoEncontradoError();
    }

    // RN02: quem vê barbearias é o barbeiro. Barbearia deve usar o feed de barbeiros (E04).
    if (viewer.user_type !== 'barbeiro') {
      throw new AcessoAoFeedNegadoError();
    }

    const cards = await this.discoveryRepository.buscarFeedBarbearias(viewer, {
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
