import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';

export const DeletePhotoParamsSchema = registry.register(
  'DeletePhotoParamsSchema',
  z.object({
    photoId: z.string().uuid('photoId deve ser um UUID válido.'),
  })
);

export type DeletePhotoParamsDto = z.infer<typeof DeletePhotoParamsSchema>;

const DeletePhotoResponseSchema = registry.register(
  'DeletePhotoResponseSchema',
  successEnvelope(
    z.object({
      message: z.string(),
      photoId: z.string().uuid(),
      profileId: z.string().uuid(),
      deleted: z.boolean(),
    })
  )
);

registry.registerPath({
  method: 'delete',
  path: '/perfil/fotos/{photoId}',
  description: 'Remove uma foto de um perfil',
  tags: ['Perfil Fotos'],
  security: [{ bearerAuth: [] }],
  request: {
    params: DeletePhotoParamsSchema,
  },
  responses: {
    200: {
      description: 'Foto removida com sucesso',
      content: {
        'application/json': {
          schema: DeletePhotoResponseSchema,
        },
      },
    },
    400: validationErrorResponse('Identificador da foto inválido'),
    401: errorResponse('Token ausente ou sessão inválida'),
    403: errorResponse('A foto não pertence ao perfil autenticado', {
      code: 'FOTO_NAO_PERTENCE_AO_PERFIL',
      message: 'A foto não pertence ao perfil autenticado.',
    }),
    404: errorResponse('Foto não encontrada', {
      code: 'FOTO_NAO_ENCONTRADA',
      message: 'Foto não encontrada.',
    }),
  },
});
