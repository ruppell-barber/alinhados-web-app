import type { PerfilBarbeariaInput, PerfilBarbeiroInput } from '@/contracts-local';

/**
 * Persistência local do perfil até o endpoint de Perfil existir na
 * alinhados-api (PerfilController + StorageGateway — Wiki C4 1.1.4.2).
 * A foto é guardada como data URL comprimida para caber no localStorage.
 */
export interface PerfilSalvo {
  dados: PerfilBarbeiroInput;
  fotoDataUrl: string;
  salvoEm: string;
}

function chave(usuarioId: string) {
  return `alinhados.perfil.${usuarioId}`;
}

export function salvarPerfilLocal(usuarioId: string, perfil: Omit<PerfilSalvo, 'salvoEm'>) {
  localStorage.setItem(
    chave(usuarioId),
    JSON.stringify({ ...perfil, salvoEm: new Date().toISOString() } satisfies PerfilSalvo),
  );
}

export function carregarPerfilLocal(usuarioId: string): PerfilSalvo | null {
  const bruto = localStorage.getItem(chave(usuarioId));
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as PerfilSalvo;
  } catch {
    return null;
  }
}

/** Perfil da barbearia (E01) — mesma estratégia local do perfil do barbeiro. */
export interface PerfilBarbeariaSalvo {
  dados: PerfilBarbeariaInput;
  fotoDataUrl: string;
  salvoEm: string;
}

function chaveBarbearia(usuarioId: string) {
  return `alinhados.perfil-barbearia.${usuarioId}`;
}

export function salvarPerfilBarbeariaLocal(
  usuarioId: string,
  perfil: Omit<PerfilBarbeariaSalvo, 'salvoEm'>,
) {
  localStorage.setItem(
    chaveBarbearia(usuarioId),
    JSON.stringify({ ...perfil, salvoEm: new Date().toISOString() } satisfies PerfilBarbeariaSalvo),
  );
}

export function carregarPerfilBarbeariaLocal(usuarioId: string): PerfilBarbeariaSalvo | null {
  const bruto = localStorage.getItem(chaveBarbearia(usuarioId));
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as PerfilBarbeariaSalvo;
  } catch {
    return null;
  }
}

/** Redimensiona a foto para no máx. 512px e converte em JPEG data URL (~100KB). */
export async function fotoParaDataUrl(arquivo: File, maxLado = 512): Promise<string> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * escala));
  canvas.height = Math.max(1, Math.round(bitmap.height * escala));
  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('Canvas indisponível neste navegador.');
  contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}
