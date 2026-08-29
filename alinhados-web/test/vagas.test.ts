import { beforeEach, describe, expect, it } from 'vitest';
import {
  abrirVaga,
  carregarVagasLocal,
  contarAbertas,
  encerrarVaga,
  reabrirVaga,
  salvarVagasLocal,
  type Vaga,
} from '@/features/perfil/vagas';

describe('gestão de vagas abertas (E09)', () => {
  beforeEach(() => localStorage.clear());

  it('abre múltiplas vagas simultaneamente (RF41/RN12)', () => {
    let vagas: Vaga[] = [];
    vagas = abrirVaga(vagas, 'Cadeira 1 — manhã');
    vagas = abrirVaga(vagas, 'Cadeira 2 — tarde');
    expect(vagas).toHaveLength(2);
    expect(contarAbertas(vagas)).toBe(2);
  });

  it('ignora título vazio', () => {
    expect(abrirVaga([], '   ')).toHaveLength(0);
  });

  it('encerra e reabre individualmente, mantendo o histórico (RF41)', () => {
    let vagas = abrirVaga(abrirVaga([], 'Cadeira 1'), 'Cadeira 2');
    const alvo = vagas[0].id;

    vagas = encerrarVaga(vagas, alvo);
    expect(vagas).toHaveLength(2); // não some, vira histórico
    expect(contarAbertas(vagas)).toBe(1);

    vagas = reabrirVaga(vagas, alvo);
    expect(contarAbertas(vagas)).toBe(2);
  });

  it('persiste e recarrega as vagas (RF39)', () => {
    const vagas = abrirVaga([], 'Cadeira 1');
    salvarVagasLocal('u1', vagas);
    const recarregadas = carregarVagasLocal('u1');
    expect(recarregadas).toHaveLength(1);
    expect(recarregadas[0].titulo).toBe('Cadeira 1');
  });
});
