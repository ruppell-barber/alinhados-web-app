import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';
import { ProfileStatusSchema } from './PerfilCommonSchema';

export const UpdatePerfilSchema = registry.register(
  'UpdatePerfilSchema',
  z.object({
    nome: z.string().min(2).optional().openapi({
      example: 'Barbearia do João',
      description: 'Nome público do perfil.',
    }),
    cidade: z.string().optional().openapi({
      example: 'São Paulo',
      description: 'Cidade do perfil.',
    }),
    estado: z.string().optional().openapi({
      example: 'SP',
      description: 'Estado (UF) do perfil.',
    }),
    bio: z.string().optional().openapi({
      example: 'Cortes modernos, barba e atendimento premium.',
      description: 'Descrição curta opcional do perfil.',
    }),
  })
);

export type UpdatePerfilDto = z.infer<typeof UpdatePerfilSchema>;

const UpdatePerfilResponseSchema = registry.register(
  'UpdatePerfilResponseSchema',
  successEnvelope(
    z.object({
      id: z.string().uuid(),
      nome: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      isComplete: z.boolean(),
      status: ProfileStatusSchema,
    })
  )
);

registry.registerPath({
  method: 'patch',
  path: '/perfil/me',
  description: 'Atualiza os dados do perfil autenticado',
  tags: ['Perfil'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdatePerfilSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Perfil atualizado com sucesso',
      content: {
        'application/json': {
          schema: UpdatePerfilResponseSchema,
        },
      },
    },
    400: validationErrorResponse(),
    401: errorResponse('Token ausente ou sessão inválida', {
      code: 'SESSAO_INVALIDA',
      message: 'Sessão inválida ou expirada.',
    }),
    404: errorResponse('Perfil autenticado não encontrado', {
      code: 'PERFIL_NAO_ENCONTRADO',
      message: 'Perfil não encontrado.',
    }),
  },
});
