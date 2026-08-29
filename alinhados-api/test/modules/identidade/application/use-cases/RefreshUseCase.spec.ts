import { describe, it, expect, vi } from 'vitest';
import { RefreshUseCase } from '../../../../../src/modules/identidade/application/use-cases/RefreshUseCase';
import { IAuthProvider, SessaoAuth } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import { SessaoInvalidaError } from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';

const fakeSessao: SessaoAuth = {
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
  usuario: { id: 'user-1', email: 'barbeiro@exemplo.com' },
};

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn().mockResolvedValue(fakeSessao),
    removerUsuario: vi.fn(),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    redefinirSenha: vi.fn(),
    alterarSenha: vi.fn(),
    ...overrides,
  };
}

describe('RefreshUseCase', () => {
  it('retorna novos tokens quando refresh token é válido', async () => {
    const useCase = new RefreshUseCase(makeAuthProvider());

    const result = await useCase.execute({ refreshToken: 'refresh-antigo' });

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('chama authProvider.refresh com o token fornecido', async () => {
    const authProvider = makeAuthProvider();
    const useCase = new RefreshUseCase(authProvider);

    await useCase.execute({ refreshToken: 'refresh-antigo' });

    expect(authProvider.refresh).toHaveBeenCalledWith('refresh-antigo');
    expect(authProvider.refresh).toHaveBeenCalledTimes(1);
  });

  it('propaga SessaoInvalidaError quando refresh token é inválido ou expirado', async () => {
    const authProvider = makeAuthProvider({
      refresh: vi.fn().mockRejectedValue(new SessaoInvalidaError('Refresh token inválido ou expirado.')),
    });
    const useCase = new RefreshUseCase(authProvider);

    await expect(useCase.execute({ refreshToken: 'token-expirado' })).rejects.toBeInstanceOf(SessaoInvalidaError);
    await expect(useCase.execute({ refreshToken: 'token-expirado' })).rejects.toThrow('Refresh token inválido ou expirado.');
  });
});
