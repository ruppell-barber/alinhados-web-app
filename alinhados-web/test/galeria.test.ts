import { describe, expect, it } from 'vitest';
import { galeriaEstaCompleta, MIN_FOTOS_GALERIA, MAX_FOTOS_GALERIA } from '@/features/perfil/galeria';
import { adicionarFotos } from '@/features/perfil/portfolio';

const foto = (n: number) => `data:image/jpeg;base64,foto${n}`;
const fotos = (n: number) => Array.from({ length: n }, (_, i) => foto(i));

describe('galeria da barbearia (E03)', () => {
  it(`só é completa com pelo menos ${MIN_FOTOS_GALERIA} fotos (RF29/RF44)`, () => {
    expect(galeriaEstaCompleta(fotos(MIN_FOTOS_GALERIA - 1))).toBe(false);
    expect(galeriaEstaCompleta(fotos(MIN_FOTOS_GALERIA))).toBe(true);
  });

  it(`compartilha o limite máximo de ${MAX_FOTOS_GALERIA} com o módulo de upload da B03`, () => {
    const resultado = adicionarFotos(fotos(MAX_FOTOS_GALERIA - 1), [foto(98), foto(99)]);
    expect(resultado.fotos).toHaveLength(MAX_FOTOS_GALERIA);
    expect(resultado.recusadas).toBe(1);
  });
});
