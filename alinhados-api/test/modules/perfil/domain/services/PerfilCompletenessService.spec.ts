import { describe, expect, it } from 'vitest';
import { PerfilCompletenessService } from '../../../../../src/modules/perfil/domain/services/PerfilCompletenessService';
import { Perfil } from '../../../../../src/modules/perfil/domain/entities/Perfil';
import { BarbeariaDetails } from '../../../../../src/modules/perfil/domain/entities/BarbeariaDetails';

function buildPerfilCompleto() {
  return Perfil.create(
    { userType: 'barbearia', nome: 'Barbearia do João', cidade: 'São Paulo', estado: 'SP' },
    'id-1'
  );
}

function buildDetailsCompletos(overrides?: Record<string, unknown>) {
  return BarbeariaDetails.create({
    profileId: 'id-1',
    nomeDecisor: 'João da Silva',
    numCadeiras: 4,
    faturamentoMedio: 15000,
    valores: ['Premium'],
    ...overrides,
  });
}

describe('PerfilCompletenessService', () => {
  it('marca incompleto e indisponível quando faltam campos do perfil (RN01)', () => {
    const perfil = Perfil.create({ userType: 'barbearia' }, 'id-1');

    const result = PerfilCompletenessService.evaluate({
      perfil,
      barbeariaDetails: null,
      galleryCount: 5,
    });

    expect(result.isComplete).toBe(false);
    expect(result.status).toBe('indisponivel');
  });

  it('marca incompleto quando faltam detalhes da barbearia', () => {
    const result = PerfilCompletenessService.evaluate({
      perfil: buildPerfilCompleto(),
      barbeariaDetails: null,
      galleryCount: 5,
    });

    expect(result.isComplete).toBe(false);
  });

  it('marca incompleto quando a galeria não atinge o mínimo de 5 fotos (RF29)', () => {
    const result = PerfilCompletenessService.evaluate({
      perfil: buildPerfilCompleto(),
      barbeariaDetails: buildDetailsCompletos(),
      galleryCount: 4,
    });

    expect(result.isComplete).toBe(false);
    expect(result.status).toBe('indisponivel');
  });

  it('marca completo e aberto quando tudo presente e contratando', () => {
    const result = PerfilCompletenessService.evaluate({
      perfil: buildPerfilCompleto(),
      barbeariaDetails: buildDetailsCompletos({ estaContratando: true }),
      galleryCount: 5,
    });

    expect(result.isComplete).toBe(true);
    expect(result.status).toBe('aberto');
  });

  it('marca completo e pausado quando completo mas não está contratando (E08/RN06)', () => {
    const result = PerfilCompletenessService.evaluate({
      perfil: buildPerfilCompleto(),
      barbeariaDetails: buildDetailsCompletos({ estaContratando: false }),
      galleryCount: 5,
    });

    expect(result.isComplete).toBe(true);
    expect(result.status).toBe('pausado');
  });

  it('mantém status banido independente da completude', () => {
    const perfil = buildPerfilCompleto();
    perfil.setCompleteness(true, 'banido');

    const result = PerfilCompletenessService.evaluate({
      perfil,
      barbeariaDetails: buildDetailsCompletos(),
      galleryCount: 5,
    });

    expect(result.status).toBe('banido');
  });
});
