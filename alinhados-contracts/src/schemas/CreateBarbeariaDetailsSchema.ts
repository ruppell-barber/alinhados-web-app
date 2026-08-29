import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';

const CreateBarbeariaDetailsObjectSchema = z.object({
  nomeDecisor: z
    .string()
    .min(3, 'O nome do decisor deve ter no mínimo 3 caracteres.')
    .optional()
    .openapi({
      example: 'João da Silva',
      description: 'Nome do decisor/responsável pela barbearia.',
    }),
  cnpj: z.string().optional().openapi({
    example: '12345678000199',
    description:
      'CNPJ da barbearia. É validado e protegido por criptografia antes da persistência; nunca é retornado pela API.',
  }),
  numCadeiras: z.number().int().positive().optional().openapi({
    example: 4,
    description: 'Quantidade de cadeiras da barbearia.',
  }),
  vagasAbertas: z.number().int().min(0).optional().openapi({
    example: 2,
    description: 'Quantidade de vagas abertas simultâneas (RF39/RF41).',
  }),
  comissaoPaga: z.number().int().min(40).max(60).optional().openapi({
    example: 50,
    description: 'Percentual de comissão paga ao barbeiro (RF34, faixa 40–60%).',
  }),
  temFixo: z.boolean().optional().openapi({
    example: false,
    description: 'Indica se a barbearia oferece um fixo de segurança (RF35).',
  }),
  valorFixo: z.number().positive().optional().openapi({
    example: 1500,
    description: 'Valor do fixo de segurança — obrigatório quando temFixo=true (RF35).',
  }),
  temClube: z.boolean().optional().openapi({
    example: false,
    description: 'Indica se a barbearia possui clube de assinatura.',
  }),
  descricaoClube: z.string().optional().openapi({
    description: 'Detalhes do clube de assinatura, quando aplicável.',
  }),
  temPops: z.boolean().optional().openapi({
    example: false,
    description: 'Indica se os POPs (procedimentos operacionais padrão) estão definidos.',
  }),
  numUnidades: z.number().int().positive().optional().openapi({
    example: 1,
    description: 'Quantidade de unidades da barbearia.',
  }),
  eFranquia: z.boolean().optional().openapi({
    example: false,
    description: 'Indica se a barbearia é uma franquia.',
  }),
  faturamentoMedio: z.number().nonnegative().optional().openapi({
    example: 15000,
    description: 'Faturamento médio mensal da barbearia.',
  }),
  valores: z
    .array(z.string())
    .max(6, 'É permitido no máximo 6 valores/tags.')
    .optional()
    .openapi({
      example: ['Atendimento premium', 'Cortes modernos'],
      description: 'Valores/tags que representam a barbearia (máximo 6).',
    }),
});

export const CreateBarbeariaDetailsSchema = registry.register(
  'CreateBarbeariaDetailsSchema',
  CreateBarbeariaDetailsObjectSchema.refine(
    (data) => !data.temFixo || (data.valorFixo !== undefined && data.valorFixo > 0),
    {
      message: 'O valor do fixo de segurança é obrigatório quando temFixo está ativado.',
      path: ['valorFixo'],
    }
  )
);

export type CreateBarbeariaDetailsDto = z.infer<typeof CreateBarbeariaDetailsSchema>;

const CreateBarbeariaDetailsResponseSchema = registry.register(
  'CreateBarbeariaDetailsResponseSchema',
  successEnvelope(
    z.object({
      profileId: z.string().uuid(),
      nomeDecisor: z.string().optional(),
      numCadeiras: z.number().optional(),
      vagasAbertas: z.number(),
      comissaoPaga: z.number().optional(),
      temFixo: z.boolean(),
      valorFixo: z.number().optional(),
      temClube: z.boolean(),
      descricaoClube: z.string().optional(),
      temPops: z.boolean(),
      numUnidades: z.number(),
      eFranquia: z.boolean(),
      faturamentoMedio: z.number().optional(),
      valores: z.array(z.string()),
      estaContratando: z.boolean(),
    })
  )
);

registry.registerPath({
  method: 'post',
  path: '/perfil/me/barbearia-details',
  description: 'Cria ou atualiza os detalhes da barbearia autenticada',
  tags: ['Perfil'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateBarbeariaDetailsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Detalhes da barbearia criados/atualizados com sucesso',
      content: {
        'application/json': {
          schema: CreateBarbeariaDetailsResponseSchema,
        },
      },
    },
    400: validationErrorResponse(),
    401: errorResponse('Token ausente ou sessão inválida'),
    403: errorResponse('O perfil autenticado não é uma barbearia', {
      code: 'PERFIL_NAO_E_BARBEARIA',
      message: 'Esta operação é permitida apenas para perfis de barbearia.',
    }),
    404: errorResponse('Perfil autenticado não encontrado', {
      code: 'PERFIL_NAO_ENCONTRADO',
      message: 'Perfil não encontrado.',
    }),
    422: errorResponse('CNPJ ou regra de negócio inválida', {
      code: 'CNPJ_INVALIDO',
      message: 'CNPJ inválido.',
    }),
  },
});
