import type {
  ContraparteAlinhamento,
  MarcarDeuCertoInput,
  ResumoAlinhamento,
} from '@/contracts-local';

/**
 * Porta do Matching / Alinhamento (Sprint 3 · Épico E6). Hoje resolvida pelo mock; quando
 * a API existir, entra um adapter real por env (padrão AuthGateway/DiscoveryGateway).
 *
 * O motor de match é do back (detecta o like mútuo e cria a linha em `matches`). No front
 * só refletimos o resultado: mostramos o overlay, listamos e marcamos "Deu certo".
 */
export interface MatchingGateway {
  /**
   * Chamado logo após um `like`. Se a outra parte já tinha curtido (reciprocidade — RF64/RN09),
   * cria o alinhamento (idempotente por par — RN13 permite vários, um por contraparte) e
   * retorna o resumo para o overlay "Alinhamento Encontrado!". Sem reciprocidade, retorna null.
   */
  avaliarAposLike(
    usuarioId: string,
    contraparte: ContraparteAlinhamento,
  ): Promise<ResumoAlinhamento | null>;
  /** Alinhamentos do usuário, mais recentes primeiro (E10 · RF65). */
  listar(usuarioId: string): Promise<ResumoAlinhamento[]>;
  /** Um alinhamento por id (alvo do deep-link e do detalhe). */
  buscar(usuarioId: string, id: string): Promise<ResumoAlinhamento | null>;
  /** Marca "Deu certo — contratação" (RF72 · RN15/RN16). Idempotente: não conta conversão duplicada. */
  marcarDeuCerto(usuarioId: string, input: MarcarDeuCertoInput): Promise<ResumoAlinhamento | null>;
}
