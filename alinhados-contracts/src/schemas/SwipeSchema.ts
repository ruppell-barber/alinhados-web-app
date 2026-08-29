import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';

export const RegistrarSwipeSchema = registry.register(
  'RegistrarSwipeSchema',
  z.object({
    swipedId: z.string().uuid().openapi({
      example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'ID do perfil avaliado (que recebeu o like/dislike).',
    }),
    direction: z.enum(['like', 'dislike']).openapi({
      example: 'like',
      description: 'Direção do swipe: like (interesse) ou dislike (sem interesse).',
    }),
  })
);

export type RegistrarSwipeDto = z.infer<typeof RegistrarSwipeSchema>;

const RegistrarSwipeResponseSchema = registry.register(
  'RegistrarSwipeResponseSchema',
  successEnvelope(
    z.object({
      id: z.string().uuid(),
      swiperId: z.string().uuid(),
      swipedId: z.string().uuid(),
      direction: z.enum(['like', 'dislike']),
      createdAt: z.string().datetime(),
    })
  )
);

registry.registerPath({
  method: 'post',
  path: '/discovery/swipes',
  description:
    'Registra um like ou dislike do perfil autenticado sobre outro perfil do feed (RF57). ' +
    'Operação idempotente e irreversível (RF61, RN14): repetir o swipe no mesmo par retorna ' +
    'o registro original, sem duplicar nem alterar a direção já registrada.',
  tags: ['Discovery'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegistrarSwipeSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Swipe registrado (ou já existente, retornado de forma idempotente)',
      content: {
        'application/json': {
          schema: RegistrarSwipeResponseSchema,
        },
      },
    },
    400: validationErrorResponse(),
    401: errorResponse('Token ausente ou sessão inválida'),
    404: errorResponse('Perfil avaliado não encontrado', {
      code: 'PERFIL_AVALIADO_NAO_ENCONTRADO',
      message: 'O perfil informado não foi encontrado.',
    }),
    422: errorResponse('Swipe inválido (auto-swipe ou perfis do mesmo tipo)', {
      code: 'SWIPE_INVALIDO',
      message: 'Não é possível avaliar o próprio perfil ou perfis do mesmo tipo.',
    }),
  },
});
