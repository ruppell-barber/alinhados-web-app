import { Perfil, ProfileStatus } from '../entities/Perfil';
import { BarbeariaDetails } from '../entities/BarbeariaDetails';
import { BarbeiroDetails } from '../entities/BarbeiroDetails';

const GALLERY_MINIMUM = 5;

export interface CompletenessInput {
  perfil: Perfil;
  barbeariaDetails?: BarbeariaDetails | null;
  barbeiroDetails?: BarbeiroDetails | null;
  galleryCount: number;
}

export interface CompletenessResult {
  isComplete: boolean;
  status: ProfileStatus;
}

/**
 * RN01 — completude do perfil e RN06 — esconder do feed enquanto incompleto/pausado.
 */
export class PerfilCompletenessService {
  static evaluate({
    perfil,
    barbeariaDetails = null,
    barbeiroDetails = null,
    galleryCount,
  }: CompletenessInput): CompletenessResult {
    const isComplete = this.checkComplete(perfil, barbeariaDetails, barbeiroDetails, galleryCount);
    const status = this.deriveStatus(perfil, barbeariaDetails, isComplete);

    return { isComplete, status };
  }

  private static checkComplete(
    perfil: Perfil,
    barbeariaDetails: BarbeariaDetails | null,
    barbeiroDetails: BarbeiroDetails | null,
    galleryCount: number
  ): boolean {
    const hasPerfilCore = Boolean(perfil.nome && perfil.cidade && perfil.estado);
    const hasGalleryMinimum = galleryCount >= GALLERY_MINIMUM;

    if (perfil.userType === 'barbeiro') {
      const hasDetailsCore =
        barbeiroDetails !== null &&
        barbeiroDetails.comissaoDesejada !== undefined &&
        barbeiroDetails.taxaOcupacao !== undefined &&
        barbeiroDetails.servicos.length > 0 &&
        barbeiroDetails.valores.length > 0;

      return hasPerfilCore && hasDetailsCore && hasGalleryMinimum;
    }

    const hasDetailsCore =
      barbeariaDetails !== null &&
      Boolean(barbeariaDetails.nomeDecisor) &&
      barbeariaDetails.numCadeiras !== undefined &&
      barbeariaDetails.faturamentoMedio !== undefined &&
      barbeariaDetails.valores.length > 0;

    return hasPerfilCore && hasDetailsCore && hasGalleryMinimum;
  }

  private static deriveStatus(
    perfil: Perfil,
    barbeariaDetails: BarbeariaDetails | null,
    isComplete: boolean
  ): ProfileStatus {
    if (perfil.status === 'banido') {
      return 'banido';
    }

    if (!isComplete) {
      return 'indisponivel';
    }

    if (perfil.userType === 'barbearia') {
      return barbeariaDetails && !barbeariaDetails.estaContratando ? 'pausado' : 'aberto';
    }

    return 'disponivel';
  }
}
