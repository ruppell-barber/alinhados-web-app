import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IDiscoveryRepository, PerfilBarbearia } from '../ports/IDiscoveryRepository';
import { IFileStorageService } from '../../../../shared/storage/IFileStorageService';
import {
  ViewerNaoEncontradoError,
  AcessoAoPerfilNegadoError,
  PerfilNaoEncontradoError,
} from '../../domain/errors/DiscoveryErrors';

export interface VerPerfilBarbeariaInput {
  viewerId: string;
  barbeariaId: string;
}

export interface VerPerfilBarbeariaOutput {
  perfil: PerfilBarbearia;
}

/**
 * Perfil completo de uma barbearia (B12/RF62) — read-only, não dispara swipe. Exclusivo do barbeiro
 * (RN02): só a contraparte vê o perfil, para não vazar condições/comissão a barbearias concorrentes.
 * Espelha o E12.
 */
@injectable()
export class VerPerfilBarbeariaUseCase
  implements UseCase<VerPerfilBarbeariaInput, VerPerfilBarbeariaOutput>
{
  constructor(
    @inject('IDiscoveryRepository') private readonly discoveryRepository: IDiscoveryRepository,
    @inject('IFileStorageService') private readonly fileStorage: IFileStorageService
  ) {}

  async execute(input: VerPerfilBarbeariaInput): Promise<VerPerfilBarbeariaOutput> {
    const viewer = await this.discoveryRepository.obterViewer(input.viewerId);
    if (!viewer) {
      throw new ViewerNaoEncontradoError();
    }

    // RN02: quem vê barbearia é o barbeiro.
    if (viewer.user_type !== 'barbeiro') {
      throw new AcessoAoPerfilNegadoError();
    }

    const perfil = await this.discoveryRepository.obterPerfilBarbearia(input.barbeariaId);
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
