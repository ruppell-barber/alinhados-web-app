import { describe, it, expect, vi } from 'vitest';
import { LogoutUseCase } from '../../../../../src/modules/identidade/application/use-cases/LogoutUseCase';
import { IAuthProvider } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn(),
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn(),
    removerUsuario: vi.fn(),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    redefinirSenha: vi.fn(),
    alterarSenha: vi.fn(),
    ...overrides,
  };
}

describe('LogoutUseCase', () => {
  it('chama authProvider.logout com o token fornecido', async () => {
    const authProvider = makeAuthProvider();
    const useCase = new LogoutUseCase(authProvider);

    await useCase.execute({ accessToken: 'token-abc' });

    expect(authProvider.logout).toHaveBeenCalledWith('token-abc');
    expect(authProvider.logout).toHaveBeenCalledTimes(1);
  });

  it('propaga erros do authProvider sem transformar', async () => {
    const err = new Error('token inválido');
    const authProvider = makeAuthProvider({ logout: vi.fn().mockRejectedValue(err) });
    const useCase = new LogoutUseCase(authProvider);

    await expect(useCase.execute({ accessToken: 'token-ruim' })).rejects.toBe(err);
  });
});
