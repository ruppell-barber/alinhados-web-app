import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { DeletePhotoParamsDto, DeletePhotoParamsSchema } from '@alinhados/contracts';
import { DeletePhotoUseCase } from '../../../application/use-cases/DeletePhotoUseCase';

@injectable()
export class DeletePhotoController {
  constructor(
    @inject(DeletePhotoUseCase)
    private readonly deletePhotoUseCase: DeletePhotoUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const params: DeletePhotoParamsDto = DeletePhotoParamsSchema.parse(req.params);

    const output = await this.deletePhotoUseCase.execute({
      profileId: req.userId!,
      photoId: params.photoId,
    });

    return AppResponse.ok(res, {
      message: 'Foto removida com sucesso.',
      ...output,
    });
  }
}
