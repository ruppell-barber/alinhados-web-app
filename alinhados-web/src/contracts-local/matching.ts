import { z } from 'zod';
import { tipoUsuarioSchema } from './auth';

/**
 * Contratos do Matching / Alinhamento (Sprint 3, Épico E6) — espelham os schemas
 * oficiais que o back exporá em alinhados-contracts (módulo Matching, Wiki C4 1.1.4.4).
 * Linguagem ubíqua: no produto dizemos "Alinhamento" (não "Match"); a tabela do banco
 * é `matches`, então os nomes de coluna (profile_a_id, deu_certo…) ficam iguais ao banco
 * para a migração futura ser um alias, não uma reescrita.
 */

/** Alinhamento — uma linha da tabela `matches`. `deu_certo` = conversão/contratação (RN16). */
export const alinhamentoSchema = z.object({
  id: z.string().uuid(),
  profile_a_id: z.string().uuid(),
  profile_b_id: z.string().uuid(),
  deu_certo: z.boolean(),
  created_at: z.string(), // ISO 8601
});
export type Alinhamento = z.infer<typeof alinhamentoSchema>;

/**
 * Status do alinhamento derivado para a UI (E10 — RF72/RN16). O banco guarda só
 * `deu_certo`; "encerrado" é definido pelo fluxo de conversa/arquivamento (Sprint 4).
 */
export const statusAlinhamentoSchema = z.enum(['ativo', 'deu_certo', 'encerrado']);
export type StatusAlinhamento = z.infer<typeof statusAlinhamentoSchema>;

/**
 * Decisão de visibilidade pós-contratação (Análise de Requisitos, Seção 6.3). É do
 * barbeiro, e o sistema NUNCA remove sozinho — sempre pergunta (conecta com B09/RN05).
 */
export const visibilidadePosContratacaoSchema = z.enum([
  'ficar_visivel', // segue aparecendo no feed
  'sair_do_feed', // fica indisponível, mas mantém a conta
  'arquivar_conta', // encerra a conta
]);
export type VisibilidadePosContratacao = z.infer<typeof visibilidadePosContratacaoSchema>;

/**
 * Marcar "Deu certo — contratação realizada" (RF72). Qualquer parte pode marcar (RN15);
 * a `visibilidade` só é enviada quando quem marca é o barbeiro (Seção 6.3).
 */
export const marcarDeuCertoSchema = z.object({
  matchId: z.string().uuid(),
  visibilidade: visibilidadePosContratacaoSchema.optional(),
});
export type MarcarDeuCertoInput = z.infer<typeof marcarDeuCertoSchema>;

/**
 * Resumo do alinhamento para as telas (overlay B06/E06, lista/histórico E10). Enriquecido
 * com a outra parte, que a API resolve a partir de `profiles` (o front não junta tabelas).
 */
export const contraparteAlinhamentoSchema = z.object({
  id: z.string(),
  nome: z.string().nullable(),
  avatar_url: z.string().nullable(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  tipo: tipoUsuarioSchema,
});
export type ContraparteAlinhamento = z.infer<typeof contraparteAlinhamentoSchema>;

export const resumoAlinhamentoSchema = z.object({
  id: z.string().uuid(),
  contraparte: contraparteAlinhamentoSchema,
  status: statusAlinhamentoSchema,
  deu_certo: z.boolean(),
  created_at: z.string(),
});
export type ResumoAlinhamento = z.infer<typeof resumoAlinhamentoSchema>;
