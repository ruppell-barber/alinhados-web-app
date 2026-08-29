import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

// A paginação compartilhada dos feeds (E04/B04) mora em `FeedSchema` (exportada pelo index). Este
// arquivo fica só com o que é específico do lado barbearia: o card e o path `/discovery/barbearias`.

/**
 * Card de barbearia exibido no feed do barbeiro (RF59).
 *
 * Todo card retornado é de uma barbearia com status `aberto` (contratando) — o feed nunca traz outros
 * status (RN06), então o status não vem no card (seria constante). O "fixo de segurança" é o par
 * `tem_fixo` (se existe) + `valor_fixo` (o valor, quando houver).
 */
export const CardBarbeariaSchema = registry.register(
  'CardBarbearia',
  z.object({
    id: z.string().openapi({ example: '2f6b8f1e-8b3e-4a0a-9a6e-1c2d3e4f5a6b' }),
    nome: z.string().nullable().openapi({ example: 'Barbearia do Zé' }),
    avatar_url: z.string().nullable().openapi({ example: 'https://.../logo.jpg' }),
    cidade: z.string().nullable().openapi({ example: 'São Paulo' }),
    estado: z.string().nullable().openapi({ example: 'SP' }),
    num_cadeiras: z.number().nullable().openapi({ example: 4, description: 'Número de cadeiras/estações' }),
    comissao_paga: z.number().nullable().openapi({ example: 50, description: 'Comissão paga ao barbeiro (%)' }),
    tem_fixo: z.boolean().openapi({ example: true, description: 'Oferece fixo de segurança' }),
    valor_fixo: z.number().nullable().openapi({ example: 1500, description: 'Valor do fixo de segurança (quando houver)' }),
    valores: z.array(z.string()).openapi({ example: ['pontualidade', 'ambiente familiar'] }),
  })
);

const FeedBarbeariasDataSchema = registry.register(
  'FeedBarbeariasData',
  z.object({
    cards: z.array(CardBarbeariaSchema),
    page: z.number().openapi({ example: 1 }),
    pageSize: z.number().openapi({ example: 20 }),
  })
);

registry.registerPath({
  method: 'get',
  path: '/discovery/barbearias',
  summary: 'Feed de barbearias compatíveis (exclusivo do barbeiro)',
  description:
    'Retorna barbearias compatíveis para o barbeiro autenticado: mesmo estado (prioriza a cidade), ' +
    'perfis completos, contratando e ainda não avaliados (RF51–RF56, RN01–RN06). Requer Bearer. ' +
    'Exclusivo de contas barbeiro — uma barbearia recebe 403.',
  tags: ['Discovery'],
  parameters: [
    {
      in: 'header',
      name: 'Authorization',
      required: true,
      schema: { type: 'string', example: 'Bearer <access_token>' },
    },
    { in: 'query', name: 'page', required: false, schema: { type: 'integer', example: 1 } },
    { in: 'query', name: 'pageSize', required: false, schema: { type: 'integer', example: 20 } },
  ],
  responses: {
    200: successResponse('Feed retornado', FeedBarbeariasDataSchema),
    400: validationErrorResponse('Parâmetros de paginação inválidos (page/pageSize)'),
    401: errorResponse('Não autenticado (AUTHORIZATION_HEADER_MISSING sem Bearer, ou SESSAO_INVALIDA com token inválido)', {
      code: 'SESSAO_INVALIDA',
      message: 'Sessão inválida ou expirada.',
    }),
    403: errorResponse('Feed exclusivo do barbeiro — barbearia não acessa', {
      code: 'FEED_ACESSO_NEGADO',
      message: 'Este feed não está disponível para o seu tipo de conta.',
    }),
    404: errorResponse('Perfil do viewer não encontrado', {
      code: 'VIEWER_NAO_ENCONTRADO',
      message: 'Perfil do usuário não encontrado.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});
