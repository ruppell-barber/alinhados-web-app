/**
 * Gestão de vagas abertas da barbearia (E09 — RF39/RF41, RN12).
 * A contagem de abertas é insumo do Alinhamento (E6) para permitir
 * múltiplos matches simultâneos. Persistência local até a API existir;
 * o total aberto espelha barbearia_details.vagas_abertas (Wiki 1.2).
 */
export interface Vaga {
  id: string;
  titulo: string;
  aberta: boolean;
  criadaEm: string;
}

export function abrirVaga(vagas: Vaga[], titulo: string): Vaga[] {
  const limpo = titulo.trim();
  if (!limpo) return vagas;
  return [
    ...vagas,
    { id: crypto.randomUUID(), titulo: limpo, aberta: true, criadaEm: new Date().toISOString() },
  ];
}

/** RF41 — encerrar individualmente (a vaga fica no histórico, não some). */
export function encerrarVaga(vagas: Vaga[], id: string): Vaga[] {
  return vagas.map((vaga) => (vaga.id === id ? { ...vaga, aberta: false } : vaga));
}

export function reabrirVaga(vagas: Vaga[], id: string): Vaga[] {
  return vagas.map((vaga) => (vaga.id === id ? { ...vaga, aberta: true } : vaga));
}

/** RF39 — número de vagas ativas (insumo do feed e do Alinhamento, RN12). */
export function contarAbertas(vagas: Vaga[]): number {
  return vagas.filter((vaga) => vaga.aberta).length;
}

function chave(usuarioId: string) {
  return `alinhados.vagas.${usuarioId}`;
}

export function carregarVagasLocal(usuarioId: string): Vaga[] {
  try {
    return JSON.parse(localStorage.getItem(chave(usuarioId)) ?? '[]') as Vaga[];
  } catch {
    return [];
  }
}

export function salvarVagasLocal(usuarioId: string, vagas: Vaga[]) {
  localStorage.setItem(chave(usuarioId), JSON.stringify(vagas));
}
