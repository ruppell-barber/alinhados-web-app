import { describe, expect, it } from 'vitest';
import { Perfil } from '../../../../../src/modules/perfil/domain/entities/Perfil';
import { DomainError } from '../../../../../src/shared/core/domain/DomainError';

describe('Perfil', () => {
  it('cria um perfil válido com userType e nome', () => {
    const perfil = Perfil.create({ userType: 'barbearia', nome: 'Barbearia do João' }, 'id-1');

    expect(perfil.userType).toBe('barbearia');
    expect(perfil.nome).toBe('Barbearia do João');
    expect(perfil.id).toBe('id-1');
    expect(perfil.pais).toBe('Brasil');
    expect(perfil.isComplete).toBe(false);
    expect(perfil.status).toBe('indisponivel');
    expect(perfil.createdAt).toBeInstanceOf(Date);
    expect(perfil.updatedAt).toBeInstanceOf(Date);
  });

  it('cria um perfil sem nome/cidade/estado (opcionais, preenchidos depois)', () => {
    const perfil = Perfil.create({ userType: 'barbeiro' }, 'id-1');

    expect(perfil.nome).toBeUndefined();
    expect(perfil.cidade).toBeUndefined();
    expect(perfil.estado).toBeUndefined();
  });

  it('rejeita a criação sem um id explícito (deve vir da autenticação)', () => {
    expect(() => Perfil.create({ userType: 'barbearia' }, '')).toThrow(DomainError);
  });

  it('rejeita userType inválido', () => {
    expect(() =>
      Perfil.create({ userType: 'invalido' as unknown as 'barbearia' }, 'id-1')
    ).toThrow(DomainError);
  });

  it('rejeita nome com menos de 2 caracteres quando informado', () => {
    expect(() => Perfil.create({ userType: 'barbearia', nome: 'a' }, 'id-1')).toThrow(
      'O nome deve ter no mínimo 2 caracteres.'
    );
  });

  it('changeNome atualiza o nome e o updatedAt', async () => {
    const perfil = Perfil.create({ userType: 'barbearia', nome: 'Antigo' }, 'id-1');
    const originalUpdatedAt = perfil.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));
    perfil.changeNome('Novo Nome');

    expect(perfil.nome).toBe('Novo Nome');
    expect(perfil.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('changeNome preserva a invariável de tamanho mínimo', () => {
    const perfil = Perfil.create({ userType: 'barbearia', nome: 'Nome válido' }, 'id-1');

    expect(() => perfil.changeNome('a')).toThrow(
      'O nome deve ter no mínimo 2 caracteres.'
    );
    expect(perfil.nome).toBe('Nome válido');
  });

  it('changeBio atualiza a bio e aceita undefined para limpar', () => {
    const perfil = Perfil.create({ userType: 'barbearia', bio: 'Antiga' }, 'id-1');

    perfil.changeBio('Nova bio');
    expect(perfil.bio).toBe('Nova bio');

    perfil.changeBio(undefined);
    expect(perfil.bio).toBeUndefined();
  });

  it('setCompleteness atualiza isComplete e status', () => {
    const perfil = Perfil.create({ userType: 'barbearia' }, 'id-1');

    perfil.setCompleteness(true, 'aberto');

    expect(perfil.isComplete).toBe(true);
    expect(perfil.status).toBe('aberto');
  });
});
