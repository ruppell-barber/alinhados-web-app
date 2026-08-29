import { z } from 'zod';
import { registry } from '../registry/openApi';

/**
 * Helpers do envelope padrão de resposta da API (classe `AppResponse` na `alinhados-api`).
 *
 * Sucesso: `{ success: true, data, meta }`
 * Erro:    `{ success: false, error: { code, message }, meta }`
 * Erro de validação (400): igual ao erro, mas com `error.issues` (lista de erros do Zod).
 *
 * Documentar o envelope real aqui garante que o Swagger reflita o que a API devolve.
 */

export const ResponseMetaSchema = registry.register(
  'ResponseMeta',
  z.object({
    path: z.string().openapi({ example: '/identidade/login', description: 'Rota que originou a resposta' }),
    timestamp: z.string().openapi({ example: '2026-07-09T12:00:00.000Z', description: 'Momento da resposta (ISO 8601)' }),
  })
);

/**
 * Erro padrão — **sem** `issues`. Formato de toda resposta de erro EXCETO validação de payload:
 * 401, 403, 404, 409, 422, 500, 503.
 */
export const ErrorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string().openapi({ example: 'CREDENCIAIS_INVALIDAS', description: 'Código estável do erro' }),
      message: z.string().openapi({ example: 'Credenciais inválidas.', description: 'Mensagem segura para o cliente' }),
    }),
    meta: ResponseMetaSchema,
  })
);

/** Uma issue de validação do Zod (subconjunto representativo dos campos). */
const ValidationIssueSchema = z.object({
  code: z.string().openapi({ example: 'invalid_string' }),
  path: z
    .array(z.union([z.string(), z.number()]))
    .openapi({ example: ['email'], description: 'Caminho do campo inválido' }),
  message: z.string().openapi({ example: 'E-mail inválido' }),
});

/**
 * Erro de **validação de payload (400)** — o ÚNICO que traz `error.issues`
 * (lista de erros do Zod, um objeto por campo inválido).
 */
export const ValidationErrorResponseSchema = registry.register(
  'ValidationErrorResponse',
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string().openapi({ example: 'Dados enviados na requisição são inválidos' }),
      issues: z.array(ValidationIssueSchema).openapi({ description: 'Erros de validação do Zod, um por campo' }),
    }),
    meta: ResponseMetaSchema,
  })
);

/** Monta o schema de um envelope de sucesso a partir do schema de `data`. */
export function successEnvelope<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: ResponseMetaSchema,
  });
}

/** Resposta de sucesso (JSON) com o envelope padrão. */
export function successResponse<T extends z.ZodTypeAny>(description: string, dataSchema: T) {
  return {
    description,
    content: { 'application/json': { schema: successEnvelope(dataSchema) } },
  };
}

/**
 * Resposta de erro comum, **sem** `issues` (401/403/404/409/422/500/503).
 *
 * Passe `example: { code, message }` com os valores REAIS daquele status — assim o Swagger
 * mostra o exemplo certo por resposta, em vez de repetir um exemplo genérico do schema
 * compartilhado em todos os status.
 */
export function errorResponse(description: string, example?: { code: string; message: string }) {
  const media: { schema: typeof ErrorResponseSchema; example?: unknown } = {
    schema: ErrorResponseSchema,
  };

  if (example) {
    media.example = {
      success: false,
      error: { code: example.code, message: example.message },
      meta: { path: '/identidade/login', timestamp: '2026-07-09T12:00:00.000Z' },
    };
  }

  return {
    description,
    content: { 'application/json': media },
  };
}

/** Resposta de erro de **validação (400)**, com `issues`. */
export function validationErrorResponse(description = 'Payload inválido — erros de validação Zod em `error.issues`') {
  return {
    description,
    content: { 'application/json': { schema: ValidationErrorResponseSchema } },
  };
}
