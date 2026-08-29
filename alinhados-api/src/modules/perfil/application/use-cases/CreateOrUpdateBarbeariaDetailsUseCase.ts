import { inject, injectable } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { IBarbeariaDetailsRepository } from '../ports/IBarbeariaDetailsRepository';
import { IPhotoRepository } from '../ports/IPhotoRepository';
import { IDocumentoProtector } from '../ports/IDocumentoProtector';
import { BarbeariaDetails } from '../../domain/entities/BarbeariaDetails';
import { PerfilCompletenessService } from '../../domain/services/PerfilCompletenessService';
import { Cnpj } from '../../domain/value-objects/Cnpj';
import {
  PerfilNaoEncontradoError,
  PerfilNaoPertenceABarbeariaError,
} from '../../domain/errors/PerfilErrors';

export interface CreateOrUpdateBarbeariaDetailsInput {
  profileId: string;
  nomeDecisor?: string;
  cnpj?: string;
  numCadeiras?: number;
  vagasAbertas?: number;
  comissaoPaga?: number;
  temFixo?: boolean;
  valorFixo?: number;
  temClube?: boolean;
  descricaoClube?: string;
  temPops?: boolean;
  numUnidades?: number;
  eFranquia?: boolean;
  faturamentoMedio?: number;
  valores?: string[];
}

export interface CreateOrUpdateBarbeariaDetailsOutput {
  details: BarbeariaDetails;
}

@injectable()
export class CreateOrUpdateBarbeariaDetailsUseCase
  implements UseCase<CreateOrUpdateBarbeariaDetailsInput, CreateOrUpdateBarbeariaDetailsOutput>
{
  constructor(
    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository,

    @inject('IBarbeariaDetailsRepository')
    private readonly detailsRepository: IBarbeariaDetailsRepository,

    @inject('IPhotoRepository')
    private readonly photoRepository: IPhotoRepository,

    @inject('IDocumentoProtector')
    private readonly documentoProtector: IDocumentoProtector
  ) {}

  async execute(
    data: CreateOrUpdateBarbeariaDetailsInput
  ): Promise<CreateOrUpdateBarbeariaDetailsOutput> {
    const perfil = await this.perfilRepository.findById(data.profileId);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }

    if (perfil.userType !== 'barbearia') {
      throw new PerfilNaoPertenceABarbeariaError();
    }

    const existing = await this.detailsRepository.findByProfileId(data.profileId);

    const valores =
      data.valores !== undefined
        ? data.valores.map((tag) => tag.trim()).filter(Boolean).slice(0, 6)
        : (existing?.valores ?? []);

    const details = BarbeariaDetails.create({
      profileId: data.profileId,
      nomeDecisor: data.nomeDecisor?.trim() || existing?.nomeDecisor,
      cnpjHash: data.cnpj
        ? this.documentoProtector.protect(Cnpj.create(data.cnpj).getValue())
        : existing?.cnpjHash,
      numCadeiras: data.numCadeiras ?? existing?.numCadeiras,
      vagasAbertas: data.vagasAbertas ?? existing?.vagasAbertas,
      comissaoPaga: data.comissaoPaga ?? existing?.comissaoPaga,
      temFixo: data.temFixo ?? existing?.temFixo,
      valorFixo: data.valorFixo ?? existing?.valorFixo,
      temClube: data.temClube ?? existing?.temClube,
      descricaoClube: data.descricaoClube?.trim() || existing?.descricaoClube,
      temPops: data.temPops ?? existing?.temPops,
      numUnidades: data.numUnidades ?? existing?.numUnidades,
      eFranquia: data.eFranquia ?? existing?.eFranquia,
      faturamentoMedio: data.faturamentoMedio ?? existing?.faturamentoMedio,
      valores,
      estaContratando: existing?.estaContratando,
    });

    const galleryCount = await this.photoRepository.countGalleryByProfileId(data.profileId);
    const { isComplete, status } = PerfilCompletenessService.evaluate({
      perfil,
      barbeariaDetails: details,
      galleryCount,
    });
    await this.detailsRepository.saveWithPerfilStatus(details, {
      isComplete,
      status,
    });

    return { details };
  }
}
