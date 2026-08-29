import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';

/** Param de rota compartilhado pelos perfis do Discovery (E12/B12): o id do alvo. */
export const PerfilIdParamSchema = z.object({
  id: z.string().uuid({ message: 'id deve ser um UUID' }),
});

export type PerfilIdParamDto = z.infer<typeof PerfilIdParamSchema>;

/** Foto do portfólio/galeria (tabela `photos`) — compartilhada por E12 e B12. */
export const FotoPerfilSchema = registry.register(
  'FotoPerfil',
  z.object({
    url: z.string().openapi({ example: 'https://.../foto1.jpg' }),
    ordem: z.number().nullable().openapi({ example: 1 }),
    is_avatar: z.boolean().openapi({ example: false }),
  })
);

/**
 * Perfil completo do barbeiro (E12/RF62) — visão read-only para a barbearia decidir antes do like.
 * Expõe `faturamento_mensal` e `taxa_ocupacao` (públicos para a contraparte por RN08). NÃO expõe o
 * documento (`cpf_hash`).
 */
export const PerfilBarbeiroSchema = registry.register(
  'PerfilBarbeiro',
  z.object({
    id: z.string().openapi({ example: '2f6b8f1e-8b3e-4a0a-9a6e-1c2d3e4f5a6b' }),
    nome: z.string().nullable().openapi({ example: 'João da Silva' }),
    avatar_url: z.string().nullable().openapi({ example: 'https://.../avatar.jpg' }),
    cidade: z.string().nullable().openapi({ example: 'São Paulo' }),
    estado: z.string().nullable().openapi({ example: 'SP' }),
    apelido_profissional: z.string().nullable().openapi({ example: 'João Navalha' }),
    anos_experiencia: z.number().nullable().openapi({ example: 8 }),
    servicos: z.array(z.string()).openapi({ example: ['corte', 'barba'] }),
    cursos_formacao: z.string().nullable().openapi({ example: 'Curso avançado de barbearia' }),
    comissao_desejada: z.number().nullable().openapi({ example: 50 }),
    faturamento_mensal: z.number().nullable().openapi({ example: 6000, description: 'Público para a barbearia (RN08)' }),
    taxa_ocupacao: z.number().nullable().openapi({ example: 80, description: 'Público para a barbearia (RN08)' }),
    recorde_meta: z.string().nullable().openapi({ example: 'R$ 12.000 em dezembro' }),
    valores: z.array(z.string()).openapi({ example: ['pontualidade', 'higiene'] }),
    barbearia_atual: z.string().nullable().openapi({ example: 'Barbearia X' }),
    esta_desempregado: z.boolean().openapi({ example: false }),
    fotos: z.array(FotoPerfilSchema),
  })
);

const PerfilBarbeiroDataSchema = registry.register(
  'PerfilBarbeiroData',
  z.object({ perfil: PerfilBarbeiroSchema })
);

registry.registerPath({
  method: 'get',
  path: '/discovery/barbeiros/{id}',
  summary: 'Perfil completo de um barbeiro (exclusivo da barbearia)',
  description:
    'Retorna o perfil completo de um barbeiro para a barbearia autenticada decidir antes do like ' +
    '(RF62). Read-only — não dispara swipe. Exclusivo de contas barbearia (RN02): um barbeiro recebe ' +
    '403, para não vazar faturamento/comissão a concorrentes.',
  tags: ['Discovery'],
  parameters: [
    {
      in: 'header',
      name: 'Authorization',
      required: true,
      schema: { type: 'string', example: 'Bearer <access_token>' },
    },
    {
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'string', format: 'uuid', example: '2f6b8f1e-8b3e-4a0a-9a6e-1c2d3e4f5a6b' },
    },
  ],
  responses: {
    200: successResponse('Perfil retornado', PerfilBarbeiroDataSchema),
    400: validationErrorResponse('id inválido (não é UUID)'),
    401: errorResponse('Não autenticado (AUTHORIZATION_HEADER_MISSING sem Bearer, ou SESSAO_INVALIDA com token inválido)', {
      code: 'SESSAO_INVALIDA',
      message: 'Sessão inválida ou expirada.',
    }),
    403: errorResponse('Perfil exclusivo da barbearia — barbeiro não acessa (RN02)', {
      code: 'PERFIL_ACESSO_NEGADO',
      message: 'Este perfil não está disponível para o seu tipo de conta.',
    }),
    404: errorResponse('Barbeiro não encontrado (ou viewer sem perfil)', {
      code: 'PERFIL_NAO_ENCONTRADO',
      message: 'Perfil não encontrado.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});
