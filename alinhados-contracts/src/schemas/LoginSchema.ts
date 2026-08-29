import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

const loginBaseShape = z.object({
  email: z.string().email({ message: 'E-mail inválido' }).openapi({ example: 'barbeiro@exemplo.com' }),
  senha: z.string().min(1, { message: 'Senha obrigatória' }).openapi({ example: 'SenhaForte123!' }),
});

registry.register('LoginRequest', loginBaseShape);

// Formato do `data` retornado no sucesso (envelope AppResponse)
const loginDataShape = registry.register(
  'LoginData',
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    usuario: z.object({
      id: z.string(),
      email: z.string(),
      user_type: z.enum(['barbeiro', 'barbearia']),
      is_complete: z.boolean(),
    }),
  })
);

registry.registerPath({
  method: 'post',
  path: '/identidade/login',
  summary: 'Autentica barbeiro ou barbearia',
  tags: ['Identidade'],
  request: {
    body: {
      content: { 'application/json': { schema: loginBaseShape } },
    },
  },
  responses: {
    200: successResponse('Login realizado — retorna access/refresh token e dados do usuário', loginDataShape),
    400: validationErrorResponse(),
    401: errorResponse('Credenciais inválidas', {
      code: 'CREDENCIAIS_INVALIDAS',
      message: 'Credenciais inválidas.',
    }),
    403: errorResponse('Conta suspensa/banida', {
      code: 'CONTA_SUSPENSA',
      message: 'Conta suspensa. Entre em contato com o suporte.',
    }),
    409: errorResponse('Perfil ausente após autenticação — inconsistência de estado', {
      code: 'CONTA_SEM_PERFIL',
      message: 'Perfil não encontrado. Entre em contato com o suporte.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});

export const LoginSchema = loginBaseShape;

export type LoginDto = z.infer<typeof LoginSchema>;
