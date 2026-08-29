import type { PerfilBarbeiroInput } from '@/contracts-local';

/**
 * Indicador de completude do perfil (RF22).
 * Cada critério preenchido soma 1; o resultado é o percentual sobre o total.
 * RN01: perfis completos ganham visibilidade no feed.
 */
export function calcularCompletude(
  dados: Partial<PerfilBarbeiroInput>,
  temFoto: boolean,
): number {
  const criterios: boolean[] = [
    temFoto, // RF21 — foto obrigatória
    Boolean(dados.nome && dados.nome.trim().length >= 2),
    Boolean(dados.bio && dados.bio.trim().length > 0),
    Boolean(dados.cidade && dados.cidade.trim().length >= 2 && dados.estado),
    dados.anos_experiencia !== undefined && dados.anos_experiencia >= 0,
    Boolean(dados.servicos && dados.servicos.length > 0),
    Boolean(dados.cursos_formacao && dados.cursos_formacao.length > 0),
    Boolean(dados.valores && dados.valores.length > 0),
    dados.comissao_desejada !== undefined,
    dados.taxa_ocupacao !== undefined && dados.taxa_ocupacao > 0,
  ];

  const preenchidos = criterios.filter(Boolean).length;
  return Math.round((preenchidos / criterios.length) * 100);
}
