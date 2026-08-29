import { z } from 'zod';

/**
 * Contratos do Discovery (Sprint 2) — espelham os schemas oficiais do
 * alinhados-contracts (FeedBarbeiroSchema, FeedBarbeariaSchema, SwipeSchema,
 * PerfilBarbeiroSchema, PerfilBarbeariaSchema). Nomes de campo mantidos iguais
 * ao oficial para a migração futura ser um alias, não uma reescrita.
 */

/** Direção do swipe (RF57). */
export const direcaoSwipeSchema = z.enum(['like', 'dislike']);
export type DirecaoSwipe = z.infer<typeof direcaoSwipeSchema>;

/** Registro de swipe (B05/E05 — RF57). Espelha RegistrarSwipeSchema. */
export const registrarSwipeSchema = z.object({
  swipedId: z.string().uuid(),
  direction: direcaoSwipeSchema,
});
export type RegistrarSwipeInput = z.infer<typeof registrarSwipeSchema>;

/** Paginação do feed (E04/B04). pageSize baixo por causa do RNF01 (feed < 0,75s). */
export const feedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
export type FeedQuery = z.infer<typeof feedQuerySchema>;

/** Foto pública do perfil (tabela `photos`). */
export const fotoPerfilSchema = z.object({
  url: z.string(),
  ordem: z.number().nullable(),
  is_avatar: z.boolean(),
});
export type FotoPerfil = z.infer<typeof fotoPerfilSchema>;

/**
 * Card de barbeiro no feed da barbearia (E04 — RF58). O status não vem no card:
 * todo card já é de barbeiro disponível (RN05 filtrado no servidor).
 */
export const cardBarbeiroSchema = z.object({
  id: z.string(),
  nome: z.string().nullable(),
  avatar_url: z.string().nullable(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  servicos: z.array(z.string()),
  valores: z.array(z.string()),
  taxa_ocupacao: z.number().nullable(),
  comissao_desejada: z.number().nullable(),
  esta_desempregado: z.boolean(),
});
export type CardBarbeiro = z.infer<typeof cardBarbeiroSchema>;

/**
 * Card de barbearia no feed do barbeiro (B04 — RF59). Todo card já é de barbearia
 * contratando (RN06 filtrado no servidor).
 */
export const cardBarbeariaSchema = z.object({
  id: z.string(),
  nome: z.string().nullable(),
  avatar_url: z.string().nullable(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  num_cadeiras: z.number().nullable(),
  comissao_paga: z.number().nullable(),
  tem_fixo: z.boolean(),
  valor_fixo: z.number().nullable(),
  valores: z.array(z.string()),
});
export type CardBarbearia = z.infer<typeof cardBarbeariaSchema>;

/** Perfil completo do barbeiro (E12 — RF62), read-only para a barbearia decidir. */
export const perfilBarbeiroPublicoSchema = cardBarbeiroSchema.extend({
  apelido_profissional: z.string().nullable(),
  anos_experiencia: z.number().nullable(),
  cursos_formacao: z.string().nullable(),
  faturamento_mensal: z.number().nullable(),
  fotos: z.array(fotoPerfilSchema),
});
export type PerfilBarbeiroPublico = z.infer<typeof perfilBarbeiroPublicoSchema>;

/** Perfil completo da barbearia (B12 — RF62), read-only para o barbeiro decidir. */
export const perfilBarbeariaPublicoSchema = cardBarbeariaSchema.extend({
  nome_decisor: z.string().nullable(),
  vagas_abertas: z.number().nullable(),
  tem_clube: z.boolean(),
  descricao_clube: z.string().nullable(),
  tem_pops: z.boolean(),
  num_unidades: z.number().nullable(),
  e_franquia: z.boolean(),
  faturamento_medio: z.number().nullable(),
  esta_contratando: z.boolean(),
  fotos: z.array(fotoPerfilSchema),
});
export type PerfilBarbeariaPublico = z.infer<typeof perfilBarbeariaPublicoSchema>;
