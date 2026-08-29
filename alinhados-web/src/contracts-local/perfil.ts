import { z } from 'zod';
import { tipoUsuarioSchema } from './auth';

/** profiles.status — visibilidade no feed (RN05/RN06) — Wiki 1.2 */
export const statusPerfilSchema = z.enum(['disponivel', 'aberto', 'indisponivel', 'pausado']);
export type StatusPerfil = z.infer<typeof statusPerfilSchema>;

export const UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

/** Limites vindos do schema de dados (Wiki 1.2) e das regras de negócio */
export const LIMITES = {
  COMISSAO_MIN: 40, // RF14
  COMISSAO_MAX: 60, // RF14
  OCUPACAO_MIN: 0, // RF16
  OCUPACAO_MAX: 100, // RF16
  MAX_VALORES: 6, // RN07
  MAX_FOTOS_PORTFOLIO: 10, // B03 (RF20) — máximo também usado na galeria da barbearia
  MIN_FOTOS_GALERIA: 5, // E03 (RF29/RF44) — mínimo para a galeria contar na completude
} as const;

/** Campos comuns do perfil — tabela profiles (Wiki 1.2) */
export const perfilBaseSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome.').max(120, 'Nome muito longo.'),
  bio: z
    .string()
    .max(500, 'A minibio pode ter no máximo 500 caracteres.')
    .optional()
    .or(z.literal('')),
  cidade: z.string().min(2, 'Informe sua cidade.'),
  estado: z.enum(UFS, { message: 'Selecione seu estado.' }),
});

/** tabela barbeiro_details (Wiki 1.2) + RF14/RF15/RF16/RF25/RN07 */
export const barbeiroDetalhesSchema = z.object({
  apelido_profissional: z.string().max(60).optional().or(z.literal('')),
  anos_experiencia: z
    .number({ message: 'Informe seu tempo de mercado.' })
    .int('Use anos inteiros.')
    .min(0, 'Não pode ser negativo.')
    .max(70, 'Confira o valor informado.'),
  servicos: z.array(z.string().min(1)).min(1, 'Adicione pelo menos um serviço.'),
  cursos_formacao: z.array(z.string().min(1)),
  comissao_desejada: z
    .number()
    .min(LIMITES.COMISSAO_MIN, `Comissão mínima: ${LIMITES.COMISSAO_MIN}%.`)
    .max(LIMITES.COMISSAO_MAX, `Comissão máxima: ${LIMITES.COMISSAO_MAX}%.`),
  faturamento_mensal: z
    .number()
    .positive('Se preencher, o faturamento precisa ser maior que zero.')
    .optional(),
  taxa_ocupacao: z
    .number()
    .min(LIMITES.OCUPACAO_MIN)
    .max(LIMITES.OCUPACAO_MAX, 'A taxa de ocupação vai de 0 a 100%.'),
  recorde_meta: z.string().max(200).optional().or(z.literal('')),
  valores: z
    .array(z.string().min(1))
    .max(LIMITES.MAX_VALORES, `Escolha no máximo ${LIMITES.MAX_VALORES} valores.`),
  barbearia_atual: z.string().max(120).nullable().optional(),
  esta_desempregado: z.boolean(),
});

/** Formulário completo do perfil do barbeiro (B01 + B02) */
export const perfilBarbeiroSchema = perfilBaseSchema.extend(barbeiroDetalhesSchema.shape);
export type PerfilBarbeiroInput = z.infer<typeof perfilBarbeiroSchema>;

/**
 * tabela barbearia_details (Wiki 1.2) + RF27–RF41.
 * Validações condicionais (nota técnica E02): valor só quando "tem fixo",
 * detalhes só quando "tem clube".
 */
export const barbeariaDetalhesSchema = z.object({
  nome_decisor: z.string().min(2, 'Informe o nome de quem decide as contratações.').max(120),
  num_cadeiras: z
    .number({ message: 'Informe o número de cadeiras.' })
    .int('Use um número inteiro.')
    .min(1, 'A barbearia precisa de pelo menos 1 cadeira.')
    .max(200, 'Confira o valor informado.'),
  num_unidades: z
    .number({ message: 'Informe o número de unidades.' })
    .int('Use um número inteiro.')
    .min(1, 'Pelo menos 1 unidade.')
    .max(500, 'Confira o valor informado.'),
  e_franquia: z.boolean(),
  comissao_paga: z
    .number()
    .min(LIMITES.COMISSAO_MIN, `Comissão mínima: ${LIMITES.COMISSAO_MIN}%.`)
    .max(LIMITES.COMISSAO_MAX, `Comissão máxima: ${LIMITES.COMISSAO_MAX}%.`), // RF34
  tem_fixo: z.boolean(), // RF35
  valor_fixo: z.number().positive('O fixo precisa ser maior que zero.').optional(),
  tem_clube: z.boolean(), // RF33
  descricao_clube: z.string().max(300).optional().or(z.literal('')),
  tem_pops: z.boolean(), // RF36
  faturamento_medio: z
    .number()
    .positive('Se preencher, o faturamento precisa ser maior que zero.')
    .optional(),
  valores: z
    .array(z.string().min(1))
    .max(LIMITES.MAX_VALORES, `Escolha no máximo ${LIMITES.MAX_VALORES} valores.`), // RN07
  esta_contratando: z.boolean(), // RF40 (E08)
  vagas_abertas: z.number().int().min(0).optional(), // RF39 (E09)
});

/** Formulário completo do perfil da barbearia (E01 + E02). Nome oficial na nota técnica: BarbeariaProfileDTO. */
export const perfilBarbeariaSchema = perfilBaseSchema
  .extend(barbeariaDetalhesSchema.shape)
  .superRefine((dados, ctx) => {
    if (dados.tem_fixo && (dados.valor_fixo === undefined || dados.valor_fixo <= 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['valor_fixo'],
        message: 'Informe o valor do fixo de segurança.', // RF35 — condicional
      });
    }
    if (dados.tem_clube && (!dados.descricao_clube || dados.descricao_clube.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        path: ['descricao_clube'],
        message: 'Descreva como funciona o clube de assinatura.', // RF33 — condicional
      });
    }
  });
export type PerfilBarbeariaInput = z.infer<typeof perfilBarbeariaSchema>;
/** Alias com o nome usado na nota técnica da E01. */
export type BarbeariaProfileDTO = PerfilBarbeariaInput;

export const perfilResumoSchema = perfilBaseSchema.extend({
  id: z.string().uuid(),
  user_type: tipoUsuarioSchema,
  avatar_url: z.string().url().nullable(),
  is_complete: z.boolean(),
  status: statusPerfilSchema,
});
export type PerfilResumo = z.infer<typeof perfilResumoSchema>;
