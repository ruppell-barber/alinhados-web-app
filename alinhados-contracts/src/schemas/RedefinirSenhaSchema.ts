import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

const redefinirSenhaBaseShape = z.object({
  token: z
    .string()
    .min(1, { message: 'Token de recuperação obrigatório.' })
    .openapi({ example: 'a1b2c3...', description: 'Token de recuperação recebido no e-mail (token_hash).' }),
  novaSenha: z
    .string()
    .min(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
    .openapi({ example: 'NovaSenhaForte123!' }),
});

registry.register('RedefinirSenhaRequest', redefinirSenhaBaseShape);

const redefinirSenhaDataShape = registry.register(
  'RedefinirSenhaData',
  z.object({
    message: z.string().openapi({ example: 'Senha redefinida com sucesso.' }),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/redefinir-senha',
  summary: 'Redefine a senha usando o token de recuperação',
  description:
    'Valida o token de recuperação e grava a nova senha. As sessões anteriores são invalidadas ' +
    'na troca de senha.',
  tags: ['Identidade'],
  request: {
    body: {
      content: { 'application/json': { schema: redefinirSenhaBaseShape } },
    },
  },
  responses: {
    200: successResponse('Senha redefinida com sucesso', redefinirSenhaDataShape),
    400: validationErrorResponse(),
    401: errorResponse('Token de recuperação inválido ou expirado', {
      code: 'TOKEN_RECUPERACAO_INVALIDO',
      message: 'Token de recuperação inválido ou expirado.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});

export const RedefinirSenhaSchema = redefinirSenhaBaseShape;

export type RedefinirSenhaDto = z.infer<typeof RedefinirSenhaSchema>;
