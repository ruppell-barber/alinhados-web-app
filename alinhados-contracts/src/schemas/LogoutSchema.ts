import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse } from './appResponse';

const logoutDataShape = registry.register(
  'LogoutData',
  z.object({
    message: z.string().openapi({ example: 'Sessão encerrada com sucesso.' }),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/logout',
  summary: 'Encerra a sessão do usuário autenticado',
  tags: ['Identidade'],
  parameters: [
    {
      in: 'header',
      name: 'Authorization',
      required: true,
      schema: { type: 'string', example: 'Bearer <access_token>' },
    },
  ],
  responses: {
    200: successResponse('Sessão encerrada com sucesso', logoutDataShape),
    401: errorResponse('Token não fornecido ou sessão inválida', {
      code: 'AUTHORIZATION_HEADER_MISSING',
      message: 'Token de acesso não fornecido.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});
