import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { ListPhotosQueryDto, ListPhotosQuerySchema } from '@alinhados/contracts';
import { ListPhotosUseCase } from '../../../application/use-cases/ListPhotosUseCase';

@injectable()
export class ListPhotosController {
  constructor(
    @inject(ListPhotosUseCase)
    private readonly listPhotosUseCase: ListPhotosUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const query: ListPhotosQueryDto = ListPhotosQuerySchema.parse(req.query);

    const output = await this.listPhotosUseCase.execute({
      profileId: query.profileId,
    });

    return AppResponse.ok(res, {
      items: output.items.map((photo) => ({
        id: photo.id,
        profileId: photo.profileId,
        url: photo.url,
        ordem: photo.ordem,
        isAvatar: photo.isAvatar,
        createdAt: photo.createdAt,
      })),
      total: output.total,
    });
  }
}
