import 'reflect-metadata';
import { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { UploadPhotoController } from '../../../../../../src/modules/perfil/adapters/api-web/controller/UploadPhotoController';
import { UploadPhotoUseCase } from '../../../../../../src/modules/perfil/application/use-cases/UploadPhotoUseCase';
import { DomainError } from '../../../../../../src/shared/core/domain/DomainError';

function buildResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('UploadPhotoController', () => {
  it('retorna 201 no fluxo feliz com req.file válido', async () => {
    const useCase = {
      execute: vi.fn().mockResolvedValue({
        photo: {
          id: 'photo-1',
          profileId: 'profile-1',
          url: '/uploads/perfil/profile-1/galeria/foto.jpg',
          ordem: undefined,
          isAvatar: false,
        },
        galleryCount: 1,
        galleryMinimumReached: false,
      }),
    };

    const controller = new UploadPhotoController(useCase as unknown as UploadPhotoUseCase);
    const req = {
      body: { isAvatar: 'false' },
      userId: 'profile-1',
      file: {
        originalname: 'foto.jpg',
        mimetype: 'image/jpeg',
        size: 123,
        buffer: Buffer.from('abc'),
      },
    } as unknown as Request;
    const res = buildResponse();

    await controller.create(req, res);

    expect(useCase.execute).toHaveBeenCalledWith({
      profileId: 'profile-1',
      isAvatar: false,
      ordem: undefined,
      file: {
        originalName: 'foto.jpg',
        mimeType: 'image/jpeg',
        size: 123,
        buffer: Buffer.from('abc'),
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('propaga erro HTTP quando o arquivo não vem', async () => {
    const useCase = { execute: vi.fn() };
    const controller = new UploadPhotoController(useCase as unknown as UploadPhotoUseCase);
    const req = {
      body: { isAvatar: 'false' },
      userId: 'profile-1',
      file: null,
    } as unknown as Request;
    const res = buildResponse();

    await expect(controller.create(req, res)).rejects.toMatchObject({
      status: 400,
      code: 'ARQUIVO_NAO_ENVIADO',
    });
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('propaga erro de domínio pro globalErrorHandler (não trata localmente)', async () => {
    const useCase = {
      execute: vi.fn().mockRejectedValue(new DomainError('Apenas imagens são permitidas.')),
    };
    const controller = new UploadPhotoController(useCase as unknown as UploadPhotoUseCase);
    const req = {
      body: { isAvatar: 'false' },
      userId: 'profile-1',
      file: {
        originalname: 'foto.jpg',
        mimetype: 'image/jpeg',
        size: 123,
        buffer: Buffer.from('abc'),
      },
    } as unknown as Request;
    const res = buildResponse();

    await expect(controller.create(req, res)).rejects.toThrow('Apenas imagens são permitidas.');
    expect(res.status).not.toHaveBeenCalled();
  });
});
