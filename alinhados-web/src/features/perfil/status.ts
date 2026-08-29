import type { StatusPerfil } from '@/contracts-local';

/**
 * Status de disponibilidade do barbeiro (B09 — RF24) e regras de aparição
 * no feed (RN05/RN06). O enum vem de profiles.status (Wiki 1.2);
 * 'pausado' é exclusivo da barbearia (E08).
 */
export const STATUS_BARBEIRO: { valor: StatusPerfil; titulo: string; descricao: string }[] = [
  {
    valor: 'disponivel',
    titulo: 'Disponível',
    descricao: 'Procurando ativamente — apareço no feed das barbearias.',
  },
  {
    valor: 'aberto',
    titulo: 'Aberto a propostas',
    descricao: 'Estou empregado, mas escuto boas oportunidades.',
  },
  {
    valor: 'indisponivel',
    titulo: 'Não disponível',
    descricao: 'Saio do feed — ninguém me encontra até eu voltar.',
  },
];

/** RN05/RN06: quem aparece no feed. */
export function apareceNoFeed(status: StatusPerfil): boolean {
  return status !== 'indisponivel' && status !== 'pausado';
}

function chave(usuarioId: string) {
  return `alinhados.status.${usuarioId}`;
}

export function carregarStatusLocal(usuarioId: string): StatusPerfil {
  const bruto = localStorage.getItem(chave(usuarioId));
  if (bruto === 'disponivel' || bruto === 'aberto' || bruto === 'indisponivel' || bruto === 'pausado') {
    return bruto;
  }
  return 'disponivel';
}

export function salvarStatusLocal(usuarioId: string, status: StatusPerfil) {
  localStorage.setItem(chave(usuarioId), status);
}
