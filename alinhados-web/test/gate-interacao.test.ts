import { beforeEach, describe, expect, it } from 'vitest';
import type { PerfilBarbeiroInput } from '@/contracts-local';
import { verificarInteracao } from '@/features/perfil/gate-interacao';
import { salvarPerfilLocal } from '@/features/perfil/perfil-storage';

const U = 'u-barbeiro';

// Perfil 100% completo (bate os 10 critérios de calcularCompletude).
const COMPLETO: PerfilBarbeiroInput = {
  nome: 'Barbeiro Teste',
  bio: 'Barbeiro de teste.',
  cidade: 'São Paulo',
  estado: 'SP',
  apelido_profissional: 'Teste',
  anos_experiencia: 6,
  servicos: ['Degradê', 'Barba'],
  cursos_formacao: ['Visagismo'],
  comissao_desejada: 50,
  faturamento_mensal: 6000,
  taxa_ocupacao: 50,
  recorde_meta: 'R$ 10 mil num mês',
  valores: ['Pontualidade', 'Organização'],
  barbearia_atual: null,
  esta_desempregado: true,
};

describe('gate de interação (RN01) — ver pode, interagir só com perfil completo', () => {
  beforeEach(() => localStorage.clear());

  it('sem perfil salvo: NÃO pode interagir', () => {
    const r = verificarInteracao(U, 'barbeiro');
    expect(r.podeInteragir).toBe(false);
    expect(r.completude).toBe(0);
  });

  it('perfil 100% completo: PODE interagir', () => {
    salvarPerfilLocal(U, { dados: COMPLETO, fotoDataUrl: 'data:image/png;base64,x' });
    const r = verificarInteracao(U, 'barbeiro');
    expect(r.completude).toBe(100);
    expect(r.podeInteragir).toBe(true);
  });

  it('perfil incompleto (sem serviços e sem ocupação): NÃO pode interagir', () => {
    salvarPerfilLocal(U, {
      dados: { ...COMPLETO, servicos: [], taxa_ocupacao: 0 },
      fotoDataUrl: 'data:image/png;base64,x',
    });
    const r = verificarInteracao(U, 'barbeiro');
    expect(r.podeInteragir).toBe(false);
    expect(r.completude).toBeLessThan(100);
  });
});
