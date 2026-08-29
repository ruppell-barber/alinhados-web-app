import type {
  CardBarbeiro,
  CardBarbearia,
  PerfilBarbeariaPublico,
  PerfilBarbeiroPublico,
} from '@/contracts-local';
import type { BarbeiroSeed } from './seed';

/**
 * Regras puras do feed (E04/B04) — sem I/O, para testar isoladas.
 * RN03 (proximidade), RN04 (não repetir já-vistos) e as projeções card (RF58/RF59).
 */

/** RN03: mesma cidade primeiro, depois mesmo estado (fallback), depois o resto. Ordenação estável. */
export function ordenarPorProximidade<T extends { cidade: string | null; estado: string | null }>(
  itens: T[],
  ref: { cidade?: string | null; estado?: string | null },
): T[] {
  const rank = (i: T) => {
    if (ref.cidade && i.cidade === ref.cidade) return 0;
    if (ref.estado && i.estado === ref.estado) return 1;
    return 2;
  };
  return itens
    .map((item, indice) => ({ item, indice, r: rank(item) }))
    .sort((a, b) => a.r - b.r || a.indice - b.indice)
    .map(({ item }) => item);
}

/** RN04: remove quem o usuário já avaliou (like/dislike). */
export function excluirVistos<T extends { id: string }>(itens: T[], vistos: Set<string>): T[] {
  return itens.filter((i) => !vistos.has(i.id));
}

/** Projeção do card do barbeiro (RF58) — expõe só os campos públicos do feed. */
export function cardBarbeiroDe(p: BarbeiroSeed): CardBarbeiro {
  return {
    id: p.id,
    nome: p.nome,
    avatar_url: p.avatar_url,
    cidade: p.cidade,
    estado: p.estado,
    servicos: p.servicos,
    valores: p.valores,
    taxa_ocupacao: p.taxa_ocupacao,
    comissao_desejada: p.comissao_desejada,
    esta_desempregado: p.esta_desempregado,
  };
}

/** Perfil público do barbeiro (RF62) — o card + os campos de detalhe, sem o interno `disponivel`. */
export function perfilBarbeiroPublicoDe(p: BarbeiroSeed): PerfilBarbeiroPublico {
  return {
    ...cardBarbeiroDe(p),
    apelido_profissional: p.apelido_profissional,
    anos_experiencia: p.anos_experiencia,
    cursos_formacao: p.cursos_formacao,
    faturamento_mensal: p.faturamento_mensal,
    fotos: p.fotos,
  };
}

/** Projeção do card da barbearia (RF59). */
export function cardBarbeariaDe(p: PerfilBarbeariaPublico): CardBarbearia {
  return {
    id: p.id,
    nome: p.nome,
    avatar_url: p.avatar_url,
    cidade: p.cidade,
    estado: p.estado,
    num_cadeiras: p.num_cadeiras,
    comissao_paga: p.comissao_paga,
    tem_fixo: p.tem_fixo,
    valor_fixo: p.valor_fixo,
    valores: p.valores,
  };
}
