import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successResponse, errorResponse, validationErrorResponse } from './appResponse';
import { FotoPerfilSchema } from './PerfilBarbeiroSchema';

/**
 * Perfil completo da barbearia (B12/RF62) — visão read-only para o barbeiro decidir antes do like.
 * Expõe as condições públicas (comissão, fixo, clube, valores, vagas) + galeria. NÃO expõe o
 * documento (`cnpj_hash`).
 */
export const PerfilBarbeariaSchema = registry.register(
  'PerfilBarbearia',
  z.object({
    id: z.string().openapi({ example: '10f6a375-73e1-4fbb-9ec2-31262406c581' }),
    nome: z.string().nullable().openapi({ example: 'Barbearia do Zé' }),
    avatar_url: z.string().nullable().openapi({ example: 'https://.../logo.jpg' }),
    cidade: z.string().nullable().openapi({ example: 'São Paulo' }),
    estado: z.string().nullable().openapi({ example: 'SP' }),
    nome_decisor: z.string().nullable().openapi({ example: 'José' }),
    num_cadeiras: z.number().nullable().openapi({ example: 4 }),
    vagas_abertas: z.number().nullable().openapi({ example: 2 }),
    comissao_paga: z.number().nullable().openapi({ example: 50, description: 'Comissão paga ao barbeiro (%)' }),
    tem_fixo: z.boolean().openapi({ example: true }),
    valor_fixo: z.number().nullable().openapi({ example: 1500, description: 'Fixo de segurança (quando houver)' }),
    tem_clube: z.boolean().openapi({ example: true }),
    descricao_clube: z.string().nullable().openapi({ example: 'Clube de assinatura mensal' }),
    tem_pops: z.boolean().openapi({ example: false }),
    num_unidades: z.number().nullable().openapi({ example: 1 }),
    e_franquia: z.boolean().openapi({ example: false }),
    faturamento_medio: z.number().nullable().openapi({ example: 40000 }),
    valores: z.array(z.string()).openapi({ example: ['pontualidade', 'ambiente familiar'] }),
    esta_contratando: z.boolean().openapi({ example: true }),
    fotos: z.array(FotoPerfilSchema),
  })
);

const PerfilBarbeariaDataSchema = registry.register(
  'PerfilBarbeariaData',
  z.object({ perfil: PerfilBarbeariaSchema })
);

registry.registerPath({
  method: 'get',
  path: '/discovery/barbearias/{id}',
  summary: 'Perfil completo de uma barbearia (exclusivo do barbeiro)',
  description:
    'Retorna o perfil completo de uma barbearia para o barbeiro autenticado decidir antes do like ' +
    '(RF62). Read-only — não dispara swipe. Exclusivo de contas barbeiro (RN02): uma barbearia recebe ' +
    '403, para não vazar condições/comissão a concorrentes.',
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
      schema: { type: 'string', format: 'uuid', example: '10f6a375-73e1-4fbb-9ec2-31262406c581' },
    },
  ],
  responses: {
    200: successResponse('Perfil retornado', PerfilBarbeariaDataSchema),
    400: validationErrorResponse('id inválido (não é UUID)'),
    401: errorResponse('Não autenticado (AUTHORIZATION_HEADER_MISSING sem Bearer, ou SESSAO_INVALIDA com token inválido)', {
      code: 'SESSAO_INVALIDA',
      message: 'Sessão inválida ou expirada.',
    }),
    403: errorResponse('Perfil exclusivo do barbeiro — barbearia não acessa (RN02)', {
      code: 'PERFIL_ACESSO_NEGADO',
      message: 'Este perfil não está disponível para o seu tipo de conta.',
    }),
    404: errorResponse('Barbearia não encontrada (ou viewer sem perfil)', {
      code: 'PERFIL_NAO_ENCONTRADO',
      message: 'Perfil não encontrado.',
    }),
    503: errorResponse('Provedor de autenticação indisponível', {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Provedor de autenticação indisponível.',
    }),
  },
});
