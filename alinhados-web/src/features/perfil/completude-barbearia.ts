import type { PerfilBarbeariaInput } from '@/contracts-local';

/**
 * Completude do perfil da barbearia (RN01 — E01).
 * A galeria (mín. 5 fotos) e a tabela de serviços vêm da E03 e entram
 * no cálculo (nota técnica: "mínimo de 5 validado antes de marcar a
 * galeria como completa; entra na completude de E01").
 */
export function calcularCompletudeBarbearia(
  dados: Partial<PerfilBarbeariaInput>,
  temFoto: boolean,
  galeriaCompleta: boolean,
  temTabelaServicos: boolean,
): number {
  const criterios: boolean[] = [
    temFoto,
    Boolean(dados.nome && dados.nome.trim().length >= 2),
    Boolean(dados.nome_decisor && dados.nome_decisor.trim().length >= 2),
    Boolean(dados.cidade && dados.cidade.trim().length >= 2 && dados.estado),
    Boolean(dados.bio && dados.bio.trim().length > 0),
    dados.num_cadeiras !== undefined && dados.num_cadeiras >= 1,
    dados.num_unidades !== undefined && dados.num_unidades >= 1,
    Boolean(dados.valores && dados.valores.length > 0),
    dados.comissao_paga !== undefined,
    galeriaCompleta, // E03 — mín. 5 fotos
    temTabelaServicos, // E03 — RF30
  ];

  const preenchidos = criterios.filter(Boolean).length;
  return Math.round((preenchidos / criterios.length) * 100);
}
