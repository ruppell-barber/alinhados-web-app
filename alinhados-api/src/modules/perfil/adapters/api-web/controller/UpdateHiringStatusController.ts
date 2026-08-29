import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { UpdateHiringStatusSchema, UpdateHiringStatusDto } from '@alinhados/contracts';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { UpdateHiringStatusUseCase } from '../../../application/use-cases/UpdateHiringStatusUseCase';

@injectable()
export class UpdateHiringStatusController {
  constructor(
    @inject(UpdateHiringStatusUseCase)
    private readonly updateHiringStatusUseCase: UpdateHiringStatusUseCase
  ) {}

  async update(req: Request, res: Response): Promise<Response> {
    const dto: UpdateHiringStatusDto = UpdateHiringStatusSchema.parse(req.body);

    const result = await this.updateHiringStatusUseCase.execute({
      profileId: req.userId!,
      estaContratando: dto.estaContratando,
    });

    return AppResponse.ok(res, {
      profileId: result.details.profileId,
      estaContratando: result.details.estaContratando,
    });
  }
}
