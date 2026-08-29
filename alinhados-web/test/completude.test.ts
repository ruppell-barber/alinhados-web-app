import { describe, expect, it } from 'vitest';
import { calcularCompletude } from '@/features/perfil/completude';

describe('calcularCompletude (RF22)', () => {
  it('retorna 0 para um perfil vazio e sem foto', () => {
    expect(calcularCompletude({}, false)).toBe(0);
  });

  it('retorna 100 para um perfil totalmente preenchido', () => {
    const completude = calcularCompletude(
      {
        nome: 'Gabriel Lima',
        bio: 'Fade e navalhado.',
        cidade: 'Barreiros',
        estado: 'PE',
        anos_experiencia: 5,
        servicos: ['Degradê'],
        cursos_formacao: ['Visagismo'],
        valores: ['Pontualidade'],
        comissao_desejada: 50,
        taxa_ocupacao: 80,
      },
      true,
    );
    expect(completude).toBe(100);
  });

  it('cresce conforme os campos são preenchidos', () => {
    const soFoto = calcularCompletude({}, true);
    const fotoENome = calcularCompletude({ nome: 'Gabriel' }, true);
    expect(soFoto).toBeGreaterThan(0);
    expect(fotoENome).toBeGreaterThan(soFoto);
    expect(fotoENome).toBeLessThan(100);
  });

  it('não conta cidade sem estado (endereço incompleto)', () => {
    const semEstado = calcularCompletude({ cidade: 'Recife' }, false);
    expect(semEstado).toBe(0);
  });
});
