import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { UploadPhotoDto } from '@alinhados/contracts';
import { UploadPhotoSchema } from '@alinhados/contracts';
import { HttpError } from '../../../../../shared/infra/http/HttpError';
import { UploadPhotoUseCase } from '../../../application/use-cases/UploadPhotoUseCase';

@injectable()
export class UploadPhotoController {
  constructor(
    @inject(UploadPhotoUseCase)
    private readonly uploadPhotoUseCase: UploadPhotoUseCase
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto: UploadPhotoDto = UploadPhotoSchema.parse(req.body);

    if (!req.file) {
      throw new HttpError(400, 'ARQUIVO_NAO_ENVIADO', 'Arquivo não enviado.');
    }

    const output = await this.uploadPhotoUseCase.execute({
      profileId: req.userId!,
      isAvatar: dto.isAvatar,
      ordem: dto.ordem,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      },
    });

    return AppResponse.created(res, {
      message: 'Foto enviada com sucesso.',
      id: output.photo.id,
      profileId: output.photo.profileId,
      url: output.signedUrl,
      ordem: output.photo.ordem,
      isAvatar: output.photo.isAvatar,
      galleryCount: output.galleryCount,
      galleryMinimumReached: output.galleryMinimumReached,
    });
  }
}
