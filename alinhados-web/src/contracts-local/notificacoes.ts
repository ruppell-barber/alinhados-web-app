import { z } from 'zod';

/**
 * Contratos de Notificações (Sprint 3, Épico E8) — espelham o módulo Notificações do
 * back (Wiki C4 1.1.4.6: EnviarNotificacao para alinhamento/mensagem/perfil incompleto,
 * ListarInApp). Cobre a exibição in-app (NF01). O push no dispositivo (FCM/Expo) é do back.
 */

export const tipoNotificacaoSchema = z.enum(['alinhamento', 'mensagem', 'perfil_incompleto']);
export type TipoNotificacao = z.infer<typeof tipoNotificacaoSchema>;

/** Notificação in-app (RF69/RF70 · NF01). `match_id` habilita o deep-link para a conversa. */
export const notificacaoSchema = z.object({
  id: z.string().uuid(),
  tipo: tipoNotificacaoSchema,
  titulo: z.string(),
  corpo: z.string(),
  match_id: z.string().uuid().nullable(),
  lida: z.boolean(),
  created_at: z.string(), // ISO 8601
});
export type Notificacao = z.infer<typeof notificacaoSchema>;
