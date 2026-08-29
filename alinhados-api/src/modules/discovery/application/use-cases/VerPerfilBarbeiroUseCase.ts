import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IDiscoveryRepository, PerfilBarbeiro } from '../ports/IDiscoveryRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import {
  ViewerNaoEncontradoError,
  AcessoAoPerfilNegadoError,
  PerfilNaoEncontradoError,
} from '../../domain/errors/DiscoveryErrors';

export interface VerPerfilBarbeiroInput {
  viewerId: string;
  barbeiroId: string;
}

export interface VerPerfilBarbeiroOutput {
  perfil: PerfilBarbeiro;
}

/**
 * Perfil completo de um barbeiro (E12/RF62) — read-only, não dispara swipe. Exclusivo da barbearia
 * (RN02): só a contraparte vê o perfil, para não vazar faturamento/comissão a barbeiros concorrentes.
 * Espelha o B12.
 */
@injectable()
export class VerPerfilBarbeiroUseCase
  implements UseCase<VerPerfilBarbeiroInput, VerPerfilBarbeiroOutput>
{
  constructor(
    @inject('IDiscoveryRepository') private readonly discoveryRepository: IDiscoveryRepository,
    @inject('IFileStorageService') private readonly fileStorage: IFileStorageService
  ) {}

  async execute(input: VerPerfilBarbeiroInput): Promise<VerPerfilBarbeiroOutput> {
    const viewer = await this.discoveryRepository.obterViewer(input.viewerId);
    if (!viewer) {
      throw new ViewerNaoEncontradoError();
    }

    // RN02: quem vê barbeiro é a barbearia.
    if (viewer.user_type !== 'barbearia') {
      throw new AcessoAoPerfilNegadoError();
    }

    const perfil = await this.discoveryRepository.obterPerfilBarbeiro(input.barbeiroId);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }

    // avatar_url e fotos guardam o path; troca por signed URL na resposta (fotos que falharem saem).
    if (perfil.avatar_url) {
      perfil.avatar_url = (await this.fileStorage.getSignedUrls([perfil.avatar_url]))[0];
    }
    if (perfil.fotos.length > 0) {
      const assinadas = await this.fileStorage.getSignedUrls(perfil.fotos.map((f) => f.url));
      perfil.fotos = perfil.fotos.flatMap((f, i) => {
        const url = assinadas[i];
        return url ? [{ ...f, url }] : [];
      });
    }

    return { perfil };
  }
}
