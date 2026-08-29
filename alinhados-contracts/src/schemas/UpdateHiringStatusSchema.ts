import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';

export const UpdateHiringStatusSchema = registry.register(
  'UpdateHiringStatusSchema',
  z.object({
    estaContratando: z.boolean().openapi({
      example: false,
      description:
        'Indica se a barbearia está contratando (false = pausa a aparição no feed de barbeiros).',
    }),
  })
);

export type UpdateHiringStatusDto = z.infer<typeof UpdateHiringStatusSchema>;

const UpdateHiringStatusResponseSchema = registry.register(
  'UpdateHiringStatusResponseSchema',
  successEnvelope(
    z.object({
      profileId: z.string().uuid(),
      estaContratando: z.boolean(),
    })
  )
);

registry.registerPath({
  method: 'patch',
  path: '/perfil/me/hiring-status',
  description:
    'Marca ou reverte o status "Parei de contratar" da barbearia. Enquanto pausado, a barbearia deixa de aparecer no feed de descoberta dos barbeiros (RF40, RN06).',
  tags: ['Perfil'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateHiringStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Status de contratação atualizado com sucesso',
      content: {
        'application/json': {
          schema: UpdateHiringStatusResponseSchema,
        },
      },
    },
    400: validationErrorResponse(),
    401: errorResponse('Token ausente ou sessão inválida'),
    403: errorResponse('O perfil autenticado não é uma barbearia', {
      code: 'PERFIL_NAO_E_BARBEARIA',
      message: 'Esta operação é permitida apenas para perfis de barbearia.',
    }),
    404: errorResponse('Perfil ou detalhes da barbearia não encontrados'),
  },
});
