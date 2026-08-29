import { describe, expect, it } from 'vitest';
import {
  adicionarFotos,
  MAX_FOTOS_PORTFOLIO,
  moverFoto,
  removerFoto,
} from '@/features/perfil/portfolio';

const foto = (n: number) => `data:image/jpeg;base64,foto${n}`;

describe('portfólio (B03)', () => {
  it('limita o portfólio a 10 fotos (RF20)', () => {
    const atuais = Array.from({ length: 8 }, (_, i) => foto(i));
    const novas = [foto(8), foto(9), foto(10), foto(11)];
    const resultado = adicionarFotos(atuais, novas);
    expect(resultado.fotos).toHaveLength(MAX_FOTOS_PORTFOLIO);
    expect(resultado.recusadas).toBe(2);
  });

  it('aceita todas quando há vaga', () => {
    const resultado = adicionarFotos([foto(0)], [foto(1), foto(2)]);
    expect(resultado.fotos).toHaveLength(3);
    expect(resultado.recusadas).toBe(0);
  });

  it('remove foto pelo índice', () => {
    const fotos = [foto(0), foto(1), foto(2)];
    expect(removerFoto(fotos, 1)).toEqual([foto(0), foto(2)]);
  });

  it('reordena fotos (mover para frente e para trás)', () => {
    const fotos = [foto(0), foto(1), foto(2)];
    expect(moverFoto(fotos, 0, 2)).toEqual([foto(1), foto(2), foto(0)]);
    expect(moverFoto(fotos, 2, 0)).toEqual([foto(2), foto(0), foto(1)]);
  });

  it('ignora movimentos inválidos sem quebrar', () => {
    const fotos = [foto(0), foto(1)];
    expect(moverFoto(fotos, 0, 0)).toEqual(fotos);
    expect(moverFoto(fotos, -1, 1)).toEqual(fotos);
    expect(moverFoto(fotos, 0, 5)).toEqual(fotos);
  });
});
