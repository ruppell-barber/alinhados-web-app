import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successEnvelope } from './appResponse';

export const ListPhotosQuerySchema = registry.register(
  'ListPhotosQuerySchema',
  z.object({
    profileId: z.string().uuid('profileId deve ser um UUID válido.'),
  })
);

export type ListPhotosQueryDto = z.infer<typeof ListPhotosQuerySchema>;

const ListPhotosResponseSchema = registry.register(
  'ListPhotosResponseSchema',
  successEnvelope(
    z.object({
      items: z.array(
        z.object({
          id: z.string().uuid(),
          profileId: z.string().uuid(),
          url: z.string(),
          ordem: z.number().optional(),
          isAvatar: z.boolean(),
          createdAt: z.string(),
        })
      ),
      total: z.number(),
    })
  )
);

registry.registerPath({
  method: 'get',
  path: '/perfil/fotos',
  description: 'Lista as fotos de um perfil',
  tags: ['Perfil Fotos'],
  request: {
    query: ListPhotosQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de fotos retornada com sucesso',
      content: {
        'application/json': {
          schema: ListPhotosResponseSchema,
        },
      },
    },
  },
});
