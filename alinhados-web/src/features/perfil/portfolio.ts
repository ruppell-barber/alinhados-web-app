import { LIMITES } from '@/contracts-local';

/**
 * Portfólio de fotos do barbeiro (B03 — RF20: até 10 fotos).
 * Persistência local até o serviço de upload compartilhado (Épico E4)
 * existir na alinhados-api; fotos guardadas como data URL comprimida.
 */
export const MAX_FOTOS_PORTFOLIO = LIMITES.MAX_FOTOS_PORTFOLIO;

export function adicionarFotos(
  atuais: string[],
  novas: string[],
): { fotos: string[]; recusadas: number } {
  const vagas = MAX_FOTOS_PORTFOLIO - atuais.length;
  const aceitas = novas.slice(0, Math.max(0, vagas));
  return { fotos: [...atuais, ...aceitas], recusadas: novas.length - aceitas.length };
}

export function removerFoto(fotos: string[], indice: number): string[] {
  return fotos.filter((_, i) => i !== indice);
}

/** Move a foto de uma posição para outra (reordenação — B03). */
export function moverFoto(fotos: string[], de: number, para: number): string[] {
  if (de === para || de < 0 || de >= fotos.length || para < 0 || para >= fotos.length) {
    return fotos;
  }
  const copia = [...fotos];
  const [movida] = copia.splice(de, 1);
  copia.splice(para, 0, movida);
  return copia;
}

function chave(usuarioId: string) {
  return `alinhados.portfolio.${usuarioId}`;
}

export function carregarPortfolioLocal(usuarioId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(chave(usuarioId)) ?? '[]') as string[];
  } catch {
    return [];
  }
}

/** Retorna false quando estoura a quota do localStorage (~5MB). */
export function salvarPortfolioLocal(usuarioId: string, fotos: string[]): boolean {
  try {
    localStorage.setItem(chave(usuarioId), JSON.stringify(fotos));
    return true;
  } catch {
    return false;
  }
}
