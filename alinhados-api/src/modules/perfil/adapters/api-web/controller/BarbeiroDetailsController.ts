import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import {
  CreateBarbeiroDetailsSchema,
  CreateBarbeiroDetailsDto,
} from '@alinhados/contracts';
import { CreateOrUpdateBarbeiroDetailsUseCase } from '../../../application/use-cases/CreateOrUpdateBarbeiroDetailsUseCase';

@injectable()
export class BarbeiroDetailsController {
  constructor(
    @inject(CreateOrUpdateBarbeiroDetailsUseCase)
    private readonly useCase: CreateOrUpdateBarbeiroDetailsUseCase
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto: CreateBarbeiroDetailsDto = CreateBarbeiroDetailsSchema.parse(req.body);
    const result = await this.useCase.execute({
      profileId: req.userId!,
      ...dto,
    });

    return AppResponse.created(res, {
      profileId: result.details.profileId,
      apelidoProfissional: result.details.apelidoProfissional,
      anosExperiencia: result.details.anosExperiencia,
      servicos: result.details.servicos,
      cursosFormacao: result.details.cursosFormacao,
      comissaoDesejada: result.details.comissaoDesejada,
      faturamentoMensal: result.details.faturamentoMensal,
      taxaOcupacao: result.details.taxaOcupacao,
      recordeMeta: result.details.recordeMeta,
      valores: result.details.valores,
      barbeariaAtual: result.details.barbeariaAtual,
      estaDesempregado: result.details.estaDesempregado,
    });
  }
}
