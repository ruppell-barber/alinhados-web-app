import type { TipoUsuario } from '@/contracts-local';
import { calcularCompletude } from './completude';
import { calcularCompletudeBarbearia } from './completude-barbearia';
import { carregarPerfilBarbeariaLocal, carregarPerfilLocal } from './perfil-storage';
import { carregarGaleriaLocal, carregarTabelaServicosLocal, galeriaEstaCompleta } from './galeria';

export interface StatusInteracao {
  podeInteragir: boolean;
  completude: number;
}

/**
 * RN01 — completude mínima para INTERAGIR. O usuário pode logar e VER o feed sem o perfil
 * completo, mas só demonstra interesse (like/dislike/match) com o perfil 100% completo.
 * Ancorado no Wiki: "completude mínima (RN01)" e "perfil completo e seguro, pronto para o feed".
 * Reaproveita os mesmos critérios do indicador de completude (RF22) — fonte única da verdade.
 */
export function verificarInteracao(usuarioId: string, tipo: TipoUsuario): StatusInteracao {
  if (tipo === 'barbeiro') {
    const perfil = carregarPerfilLocal(usuarioId);
    if (!perfil) return { podeInteragir: false, completude: 0 };
    const completude = calcularCompletude(perfil.dados, Boolean(perfil.fotoDataUrl));
    return { podeInteragir: completude === 100, completude };
  }

  const perfil = carregarPerfilBarbeariaLocal(usuarioId);
  if (!perfil) return { podeInteragir: false, completude: 0 };
  const completude = calcularCompletudeBarbearia(
    perfil.dados,
    Boolean(perfil.fotoDataUrl),
    galeriaEstaCompleta(carregarGaleriaLocal(usuarioId)),
    Boolean(carregarTabelaServicosLocal(usuarioId)),
  );
  return { podeInteragir: completude === 100, completude };
}
