import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

const refreshBaseShape = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token obrigatório.' }).openapi({ example: 'v1.M2Y0...' }),
});

registry.register('RefreshRequest', refreshBaseShape);

const refreshDataShape = registry.register(
  'RefreshData',
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/refresh',
  summary: 'Renova o access token usando o refresh token',
  tags: ['Identidade'],
  request: {
    body: {
      content: { 'application/json': { schema: refreshBaseShape } },
    },
  },
  responses: {
    200: successResponse('Tokens renovados com sucesso', refreshDataShape),
    400: validationErrorResponse(),
    401: errorResponse('Refresh token inválido ou expirado', {
      code: 'SESSAO_INVALIDA',
      message: 'Refresh token inválido ou expirado.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});

export const RefreshSchema = refreshBaseShape;

export type RefreshDto = z.infer<typeof RefreshSchema>;
