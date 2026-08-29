import { z } from 'zod';
import { registry } from '../registry/openApi';
import {
  errorResponse,
  successEnvelope,
  validationErrorResponse,
} from './appResponse';

const CreateBarbeiroDetailsObjectSchema = z.object({
  apelidoProfissional: z
    .string()
    .min(3, 'O apelido profissional deve ter no mínimo 3 caracteres.')
    .optional()
    .openapi({
      example: 'João Navalha',
      description: 'Apelido/nome profissional do barbeiro.',
    }),
  cpf: z.string().optional().openapi({
    example: '52998224725',
    description:
      'CPF do barbeiro. É validado e protegido por criptografia antes da persistência; nunca é retornado pela API.',
  }),
  anosExperiencia: z.number().int().min(0).optional().openapi({
    example: 8,
    description: 'Anos de experiência do barbeiro.',
  }),
  servicos: z
    .array(z.string())
    .max(12, 'É permitido no máximo 12 serviços.')
    .optional()
    .openapi({
      example: ['corte', 'barba', 'pigmentação'],
      description: 'Serviços que o barbeiro oferece (máximo 12).',
    }),
  cursosFormacao: z.string().optional().openapi({
    description: 'Cursos e formações do barbeiro.',
  }),
  comissaoDesejada: z.number().int().min(40).max(60).optional().openapi({
    example: 50,
    description: 'Percentual de comissão desejada pelo barbeiro (RF14, faixa 40–60% — Wiki §1.2).',
  }),
  faturamentoMensal: z.number().nonnegative().optional().openapi({
    example: 6000,
    description: 'Faturamento mensal médio do barbeiro (RF15). Público por RN08.',
  }),
  taxaOcupacao: z.number().int().min(0).max(100).optional().openapi({
    example: 80,
    description: 'Taxa de ocupação atual do barbeiro (RF16, slider 0–100%). Pública por RN08.',
  }),
  recordeMeta: z.string().optional().openapi({
    example: 'R$ 12.000 em dezembro',
    description: 'Recorde de faturamento/meta batida pelo barbeiro.',
  }),
  valores: z
    .array(z.string())
    .max(6, 'É permitido no máximo 6 valores/tags.')
    .optional()
    .openapi({
      example: ['pontualidade', 'higiene'],
      description: 'Valores/tags que representam o barbeiro (máximo 6).',
    }),
  barbeariaAtual: z.string().optional().openapi({
    example: 'Barbearia X',
    description: 'Barbearia em que o barbeiro trabalha atualmente, se houver.',
  }),
  estaDesempregado: z.boolean().optional().openapi({
    example: false,
    description:
      'Vínculo atual (RF25): true = desempregado; false = empregado, mas aberto a propostas (B09).',
  }),
});

export const CreateBarbeiroDetailsSchema = registry.register(
  'CreateBarbeiroDetailsSchema',
  CreateBarbeiroDetailsObjectSchema
);

export type CreateBarbeiroDetailsDto = z.infer<typeof CreateBarbeiroDetailsSchema>;

const CreateBarbeiroDetailsResponseSchema = registry.register(
  'CreateBarbeiroDetailsResponseSchema',
  successEnvelope(
    z.object({
      profileId: z.string().uuid(),
      apelidoProfissional: z.string().optional(),
      anosExperiencia: z.number().optional(),
      servicos: z.array(z.string()),
      cursosFormacao: z.string().optional(),
      comissaoDesejada: z.number().optional(),
      faturamentoMensal: z.number().optional(),
      taxaOcupacao: z.number().optional(),
      recordeMeta: z.string().optional(),
      valores: z.array(z.string()),
      barbeariaAtual: z.string().optional(),
      estaDesempregado: z.boolean(),
    })
  )
);

registry.registerPath({
  method: 'post',
  path: '/perfil/me/barbeiro-details',
  description: 'Cria ou atualiza os detalhes do barbeiro autenticado (comissão, ocupação, etc.)',
  tags: ['Perfil'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateBarbeiroDetailsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Detalhes do barbeiro criados/atualizados com sucesso',
      content: {
        'application/json': {
          schema: CreateBarbeiroDetailsResponseSchema,
        },
      },
    },
    400: validationErrorResponse(),
    401: errorResponse('Token ausente ou sessão inválida'),
    403: errorResponse('O perfil autenticado não é um barbeiro', {
      code: 'PERFIL_NAO_E_BARBEIRO',
      message: 'Esta operação é permitida apenas para perfis de barbeiro.',
    }),
    404: errorResponse('Perfil autenticado não encontrado', {
      code: 'PERFIL_NAO_ENCONTRADO',
      message: 'Perfil não encontrado.',
    }),
    422: errorResponse('CPF ou regra de negócio inválida', {
      code: 'CPF_INVALIDO',
      message: 'CPF inválido.',
    }),
  },
});
