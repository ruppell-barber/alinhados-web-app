import { inject, injectable } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeiroDetailsRepository } from '../ports/IBarbeiroDetailsRepository';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { IDocumentoProtector } from '../ports/IDocumentoProtector';
import { BarbeiroDetails } from '../../domain/entities/BarbeiroDetails';
import { PerfilCompletenessService } from '../../domain/services/PerfilCompletenessService';
import { Cpf } from '../../domain/value-objects/Cpf';
import {
  PerfilNaoEncontradoError,
  PerfilNaoPertenceAoBarbeiroError,
} from '../../domain/errors/PerfilErrors';

export interface CreateOrUpdateBarbeiroDetailsInput {
  profileId: string;
  apelidoProfissional?: string;
  cpf?: string;
  anosExperiencia?: number;
  servicos?: string[];
  cursosFormacao?: string;
  comissaoDesejada?: number;
  faturamentoMensal?: number;
  taxaOcupacao?: number;
  recordeMeta?: string;
  valores?: string[];
  barbeariaAtual?: string;
  estaDesempregado?: boolean;
}

export interface CreateOrUpdateBarbeiroDetailsOutput {
  details: BarbeiroDetails;
}

@injectable()
export class CreateOrUpdateBarbeiroDetailsUseCase
  implements UseCase<CreateOrUpdateBarbeiroDetailsInput, CreateOrUpdateBarbeiroDetailsOutput>
{
  constructor(
    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeiroDetailsRepository')
    private readonly detailsRepository: IBarbeiroDetailsRepository,

    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository,

    @inject('IDocumentoProtector')
    private readonly documentoProtector: IDocumentoProtector
  ) {}

  async execute(
    data: CreateOrUpdateBarbeiroDetailsInput
  ): Promise<CreateOrUpdateBarbeiroDetailsOutput> {
    const perfil = await this.perfilRepository.findById(data.profileId);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }

    if (perfil.userType !== 'barbeiro') {
      throw new PerfilNaoPertenceAoBarbeiroError();
    }

    const existing = await this.detailsRepository.findByProfileId(data.profileId);

    const servicos =
      data.servicos !== undefined
        ? data.servicos.map((s) => s.trim()).filter(Boolean).slice(0, 12)
        : (existing?.servicos ?? []);

    const valores =
      data.valores !== undefined
        ? data.valores.map((tag) => tag.trim()).filter(Boolean).slice(0, 6)
        : (existing?.valores ?? []);

    const details = BarbeiroDetails.create({
      profileId: data.profileId,
      apelidoProfissional: data.apelidoProfissional?.trim() || existing?.apelidoProfissional,
      cpfHash: data.cpf
        ? this.documentoProtector.protect(Cpf.create(data.cpf).getValue())
        : existing?.cpfHash,
      anosExperiencia: data.anosExperiencia ?? existing?.anosExperiencia,
      servicos,
      cursosFormacao: data.cursosFormacao?.trim() || existing?.cursosFormacao,
      comissaoDesejada: data.comissaoDesejada ?? existing?.comissaoDesejada,
      faturamentoMensal: data.faturamentoMensal ?? existing?.faturamentoMensal,
      taxaOcupacao: data.taxaOcupacao ?? existing?.taxaOcupacao,
      recordeMeta: data.recordeMeta?.trim() || existing?.recordeMeta,
      valores,
      barbeariaAtual: data.barbeariaAtual?.trim() || existing?.barbeariaAtual,
      estaDesempregado: data.estaDesempregado ?? existing?.estaDesempregado,
    });

    const galleryCount = await this.photoRepository.countGalleryByProfileId(data.profileId);
    const { isComplete, status } = PerfilCompletenessService.evaluate({
      perfil,
      barbeiroDetails: details,
      galleryCount,
    });
    await this.detailsRepository.saveWithPerfilStatus(details, {
      isComplete,
      status,
    });

    return { details };
  }
}
