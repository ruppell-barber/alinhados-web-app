import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

const alterarSenhaBaseShape = z.object({
  senhaAtual: z
    .string()
    .min(1, { message: 'Senha atual obrigatória.' })
    .openapi({ example: 'SenhaAtual123!' }),
  novaSenha: z
    .string()
    .min(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
    .openapi({ example: 'NovaSenhaForte123!' }),
});

registry.register('AlterarSenhaRequest', alterarSenhaBaseShape);

const alterarSenhaDataShape = registry.register(
  'AlterarSenhaData',
  z.object({
    message: z.string().openapi({ example: 'Senha alterada com sucesso.' }),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/alterar-senha',
  summary: 'Altera a senha do usuário autenticado',
  description:
    'Requer o usuário autenticado (Bearer) e a senha atual. A senha atual é reconferida antes de ' +
    'gravar a nova (defesa contra sessão roubada).',
  tags: ['Identidade'],
  parameters: [
    {
      in: 'header',
      name: 'Authorization',
      required: true,
      schema: { type: 'string', example: 'Bearer <access_token>' },
    },
  ],
  request: {
    body: {
      content: { 'application/json': { schema: alterarSenhaBaseShape } },
    },
  },
  responses: {
    200: successResponse('Senha alterada com sucesso', alterarSenhaDataShape),
    400: validationErrorResponse(),
    401: errorResponse('Não autenticado ou senha atual incorreta (AUTHORIZATION_HEADER_MISSING, SESSAO_INVALIDA ou SENHA_ATUAL_INCORRETA)', {
      code: 'SENHA_ATUAL_INCORRETA',
      message: 'Senha atual incorreta.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});

export const AlterarSenhaSchema = alterarSenhaBaseShape;

export type AlterarSenhaDto = z.infer<typeof AlterarSenhaSchema>;
