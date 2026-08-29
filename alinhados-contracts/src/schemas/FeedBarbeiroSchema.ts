import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

// A paginação compartilhada dos feeds (E04/B04) mora em `FeedSchema` (exportada pelo index). Este
// arquivo fica só com o que é específico do lado barbeiro: o card e o path `/discovery/barbeiros`.

/**
 * Card de barbeiro exibido no feed da barbearia (RF58).
 *
 * Todo card retornado é de um barbeiro com status `disponivel` — o feed nunca traz outros status
 * (RN05), então o status não vem no card (seria constante). A "disponibilidade" da RF58 é o
 * `esta_desempregado`: desempregado (disponível imediatamente) vs. empregado, mas aberto a propostas
 * (B09).
 */
export const CardBarbeiroSchema = registry.register(
  'CardBarbeiro',
  z.object({
    id: z.string().openapi({ example: '2f6b8f1e-8b3e-4a0a-9a6e-1c2d3e4f5a6b' }),
    nome: z.string().nullable().openapi({ example: 'João da Silva' }),
    avatar_url: z.string().nullable().openapi({ example: 'https://.../avatar.jpg' }),
    cidade: z.string().nullable().openapi({ example: 'São Paulo' }),
    estado: z.string().nullable().openapi({ example: 'SP' }),
    servicos: z.array(z.string()).openapi({ example: ['corte', 'barba'] }),
    valores: z.array(z.string()).openapi({ example: ['pontualidade', 'higiene'] }),
    taxa_ocupacao: z.number().nullable().openapi({ example: 80 }),
    comissao_desejada: z.number().nullable().openapi({ example: 50 }),
    esta_desempregado: z
      .boolean()
      .openapi({ example: true, description: 'Vínculo atual (RF25): true = desempregado; false = empregado, mas aberto a propostas (B09)' }),
  })
);

const FeedBarbeirosDataSchema = registry.register(
  'FeedBarbeirosData',
  z.object({
    cards: z.array(CardBarbeiroSchema),
    page: z.number().openapi({ example: 1 }),
    pageSize: z.number().openapi({ example: 20 }),
  })
);

registry.registerPath({
  method: 'get',
  path: '/discovery/barbeiros',
  summary: 'Feed de barbeiros compatíveis (exclusivo da barbearia)',
  description:
    'Retorna barbeiros compatíveis para a barbearia autenticada: mesmo estado (prioriza a cidade), ' +
    'perfis completos, disponíveis e ainda não avaliados (RF51–RF56, RN01–RN05). Requer Bearer. ' +
    'Exclusivo de contas barbearia — um barbeiro recebe 403.',
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
    200: successResponse('Feed retornado', FeedBarbeirosDataSchema),
    400: validationErrorResponse('Parâmetros de paginação inválidos (page/pageSize)'),
    401: errorResponse('Não autenticado (AUTHORIZATION_HEADER_MISSING sem Bearer, ou SESSAO_INVALIDA com token inválido)', {
      code: 'SESSAO_INVALIDA',
      message: 'Sessão inválida ou expirada.',
    }),
    403: errorResponse('Feed exclusivo da barbearia — barbeiro não acessa', {
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
