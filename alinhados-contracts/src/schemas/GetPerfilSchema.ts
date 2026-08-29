import { z } from 'zod';
import { registry } from '../registry/openApi';
import { successEnvelope } from './appResponse';
import { ProfileStatusSchema, UserTypeSchema } from './PerfilCommonSchema';

const BarbeariaDetailsResponseSchema = z.object({
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
});

const GetPerfilResponseSchema = registry.register(
  'GetPerfilResponseSchema',
  successEnvelope(
    z.object({
      id: z.string().uuid(),
      userType: UserTypeSchema,
      nome: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      pais: z.string(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      isComplete: z.boolean(),
      status: ProfileStatusSchema,
      createdAt: z.string(),
      updatedAt: z.string(),
      details: BarbeariaDetailsResponseSchema.nullable(),
    })
  )
);

registry.registerPath({
  method: 'get',
  path: '/perfil/{id}',
  description: 'Busca um perfil de barbearia pelo id, incluindo os detalhes cadastrados',
  tags: ['Perfil'],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Identificador do perfil.' }),
    }),
  },
  responses: {
    200: {
      description: 'Perfil encontrado',
      content: {
        'application/json': {
          schema: GetPerfilResponseSchema,
        },
      },
    },
    404: {
      description: 'Perfil não encontrado',
    },
  },
});
