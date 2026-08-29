import { LIMITES } from '@/contracts-local';

/**
 * Galeria da barbearia + foto da tabela de serviços (E03 — RF29/RF30).
 * Reutiliza as regras puras do portfólio (adicionarFotos/moverFoto/removerFoto),
 * conforme a nota técnica: mesma pipeline de upload da B03 (serviço único do
 * Épico E4). Persistência local até o serviço existir na API.
 */
export const MIN_FOTOS_GALERIA = LIMITES.MIN_FOTOS_GALERIA;
export const MAX_FOTOS_GALERIA = LIMITES.MAX_FOTOS_PORTFOLIO;

/** RF44/nota técnica: a galeria só conta como completa com o mínimo de 5 fotos. */
export function galeriaEstaCompleta(fotos: string[]): boolean {
  return fotos.length >= MIN_FOTOS_GALERIA;
}

function chaveGaleria(usuarioId: string) {
  return `alinhados.galeria.${usuarioId}`;
}

function chaveTabela(usuarioId: string) {
  return `alinhados.tabela-servicos.${usuarioId}`;
}

export function carregarGaleriaLocal(usuarioId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(chaveGaleria(usuarioId)) ?? '[]') as string[];
  } catch {
    return [];
  }
}

/** Retorna false quando estoura a quota do localStorage (~5MB). */
export function salvarGaleriaLocal(usuarioId: string, fotos: string[]): boolean {
  try {
    localStorage.setItem(chaveGaleria(usuarioId), JSON.stringify(fotos));
    return true;
  } catch {
    return false;
  }
}

export function carregarTabelaServicosLocal(usuarioId: string): string | null {
  return localStorage.getItem(chaveTabela(usuarioId));
}

/** Retorna false quando estoura a quota do localStorage. */
export function salvarTabelaServicosLocal(usuarioId: string, fotoDataUrl: string | null): boolean {
  try {
    if (fotoDataUrl) {
      localStorage.setItem(chaveTabela(usuarioId), fotoDataUrl);
    } else {
      localStorage.removeItem(chaveTabela(usuarioId));
    }
    return true;
  } catch {
    return false;
  }
}
