import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import {
  CreateBarbeariaDetailsSchema,
  CreateBarbeariaDetailsDto,
} from '@alinhados/contracts';
import { CreateOrUpdateBarbeariaDetailsUseCase } from '../../../application/use-cases/CreateOrUpdateBarbeariaDetailsUseCase';

@injectable()
export class BarbeariaDetailsController {
  constructor(
    @inject(CreateOrUpdateBarbeariaDetailsUseCase)
    private readonly useCase: CreateOrUpdateBarbeariaDetailsUseCase
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto: CreateBarbeariaDetailsDto = CreateBarbeariaDetailsSchema.parse(req.body);
    const result = await this.useCase.execute({
      profileId: req.userId!,
      ...dto,
    });

    return AppResponse.created(res, {
      profileId: result.details.profileId,
      nomeDecisor: result.details.nomeDecisor,
      numCadeiras: result.details.numCadeiras,
      vagasAbertas: result.details.vagasAbertas,
      comissaoPaga: result.details.comissaoPaga,
      temFixo: result.details.temFixo,
      valorFixo: result.details.valorFixo,
      temClube: result.details.temClube,
      descricaoClube: result.details.descricaoClube,
      temPops: result.details.temPops,
      numUnidades: result.details.numUnidades,
      eFranquia: result.details.eFranquia,
      faturamentoMedio: result.details.faturamentoMedio,
      valores: result.details.valores,
      estaContratando: result.details.estaContratando,
    });
  }
}
