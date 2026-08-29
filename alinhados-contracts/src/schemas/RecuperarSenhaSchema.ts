import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

const recuperarSenhaBaseShape = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }).openapi({ example: 'barbeiro@exemplo.com' }),
});

registry.register('RecuperarSenhaRequest', recuperarSenhaBaseShape);

const recuperarSenhaDataShape = registry.register(
  'RecuperarSenhaData',
  z.object({
    message: z
      .string()
      .openapi({ example: 'Se o e-mail estiver cadastrado, enviamos um link de recuperação.' }),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/recuperar-senha',
  summary: 'Solicita recuperação de senha por e-mail',
  description:
    'Dispara o e-mail com link/token de recuperação (TTL curto). Por segurança (anti-enumeração), ' +
    'responde sempre 200 — mesmo que o e-mail não exista. O rate-limit é aplicado pelo provedor de Auth.',
  tags: ['Identidade'],
  request: {
    body: {
      content: { 'application/json': { schema: recuperarSenhaBaseShape } },
    },
  },
  responses: {
    200: successResponse('Solicitação recebida — se o e-mail existir, o link foi enviado', recuperarSenhaDataShape),
    400: validationErrorResponse(),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});

export const RecuperarSenhaSchema = recuperarSenhaBaseShape;

export type RecuperarSenhaDto = z.infer<typeof RecuperarSenhaSchema>;
