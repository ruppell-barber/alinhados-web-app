import { describe, it, expect, vi } from 'vitest';
import { CadastrarUsuarioUseCase, CadastrarUsuarioInput } from '../../../../../src/modules/identidade/application/use-cases/CadastrarUsuarioUseCase';
import { IAuthProvider, AuthUsuario } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import { IIdentidadeRepository } from '../../../../../src/modules/identidade/application/ports/IIdentidadeRepository';
import { ContaJaExisteError } from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';
import { ErroDeInfraestrutura } from '../../../../../src/shared/core/errors/ErroDeInfraestrutura';

const fakeAuthUsuario: AuthUsuario = { id: 'user-1', email: 'joao@exemplo.com' };

const validInput: CadastrarUsuarioInput = {
  email: 'joao@exemplo.com',
  senha: 'senha123',
  user_type: 'barbeiro',
};

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn().mockResolvedValue(fakeAuthUsuario),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    removerUsuario: vi.fn().mockResolvedValue(undefined),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    redefinirSenha: vi.fn(),
    alterarSenha: vi.fn(),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<IIdentidadeRepository> = {}): IIdentidadeRepository {
  return {
    criarPerfil: vi.fn().mockResolvedValue(undefined),
    buscarPerfil: vi.fn(),
    ...overrides,
  };
}

describe('CadastrarUsuarioUseCase', () => {
  it('cria usuário e perfil e retorna os dados do novo usuário', async () => {
    const authProvider = makeAuthProvider();
    const repo = makeRepo();
    const useCase = new CadastrarUsuarioUseCase(authProvider, repo);

    const result = await useCase.execute(validInput);

    expect(authProvider.registrar).toHaveBeenCalledWith({ email: validInput.email, senha: validInput.senha });
    expect(repo.criarPerfil).toHaveBeenCalledWith({ id: 'user-1', user_type: 'barbeiro' });
    expect(authProvider.removerUsuario).not.toHaveBeenCalled();
    expect(result).toEqual({
      usuario: { id: 'user-1', email: 'joao@exemplo.com', user_type: 'barbeiro' },
    });
  });

  it('propaga ContaJaExisteError vinda do adapter sem interpretar mensagens', async () => {
    const authProvider = makeAuthProvider({
      registrar: vi.fn().mockRejectedValue(new ContaJaExisteError()),
    });
    const repo = makeRepo();
    const useCase = new CadastrarUsuarioUseCase(authProvider, repo);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(ContaJaExisteError);
    // Falhou antes de tentar criar perfil — nada a compensar
    expect(repo.criarPerfil).not.toHaveBeenCalled();
    expect(authProvider.removerUsuario).not.toHaveBeenCalled();
  });

  it('propaga erro operacional do registrar sem transformar', async () => {
    const infra = new ErroDeInfraestrutura('Provedor indisponível.');
    const authProvider = makeAuthProvider({ registrar: vi.fn().mockRejectedValue(infra) });
    const useCase = new CadastrarUsuarioUseCase(authProvider, makeRepo());

    await expect(useCase.execute(validInput)).rejects.toBe(infra);
  });

  it('compensa removendo o usuário do Auth quando criarPerfil falha e relança o erro original', async () => {
    const dbError = new Error('db error');
    const authProvider = makeAuthProvider();
    const repo = makeRepo({ criarPerfil: vi.fn().mockRejectedValue(dbError) });
    const useCase = new CadastrarUsuarioUseCase(authProvider, repo);

    await expect(useCase.execute(validInput)).rejects.toBe(dbError);
    expect(authProvider.removerUsuario).toHaveBeenCalledWith('user-1');
  });

  it('relança o erro original mesmo quando a própria compensação falha', async () => {
    const dbError = new Error('db error');
    const authProvider = makeAuthProvider({
      removerUsuario: vi.fn().mockRejectedValue(new Error('falha ao remover')),
    });
    const repo = makeRepo({ criarPerfil: vi.fn().mockRejectedValue(dbError) });
    const useCase = new CadastrarUsuarioUseCase(authProvider, repo);

    // O erro relançado é o ORIGINAL (dbError), não o da compensação
    await expect(useCase.execute(validInput)).rejects.toBe(dbError);
    expect(authProvider.removerUsuario).toHaveBeenCalledWith('user-1');
  });
});
