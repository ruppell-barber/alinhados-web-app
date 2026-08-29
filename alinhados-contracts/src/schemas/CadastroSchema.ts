import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

const cadastroBaseShape = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }).openapi({ example: 'barbeiro@exemplo.com' }),
  senha: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres.' }).openapi({ example: 'SenhaForte123!' }),
  user_type: z.enum(['barbeiro', 'barbearia']).openapi({ example: 'barbeiro' }),
});

registry.register('CadastroRequest', cadastroBaseShape);

const cadastroDataShape = registry.register(
  'CadastroData',
  z.object({
    usuario: z.object({
      id: z.string(),
      email: z.string(),
      user_type: z.enum(['barbeiro', 'barbearia']),
    }),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/cadastrar',
  summary: 'Cadastra novo barbeiro ou barbearia',
  tags: ['Identidade'],
  request: {
    body: {
      content: { 'application/json': { schema: cadastroBaseShape } },
    },
  },
  responses: {
    201: successResponse('Cadastro realizado com sucesso', cadastroDataShape),
    400: validationErrorResponse(),
    409: errorResponse('Já existe uma conta com este e-mail', {
      code: 'CONTA_JA_EXISTE',
      message: 'Já existe uma conta com este e-mail.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    }),
  },
});

export const CadastroSchema = cadastroBaseShape;

export type CadastroDto = z.infer<typeof CadastroSchema>;
