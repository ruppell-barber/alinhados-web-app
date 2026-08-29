import { describe, it, expect, vi } from 'vitest';
import { RedefinirSenhaUseCase } from '../../../../../src/modules/identidade/application/use-cases/RedefinirSenhaUseCase';
import { IAuthProvider } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import { TokenRecuperacaoInvalidoError } from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    removerUsuario: vi.fn(),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    redefinirSenha: vi.fn().mockResolvedValue(undefined),
    alterarSenha: vi.fn(),
    ...overrides,
  };
}

describe('RedefinirSenhaUseCase', () => {
  it('redefine a senha chamando o provider com o token e a nova senha', async () => {
    const authProvider = makeAuthProvider();
    const useCase = new RedefinirSenhaUseCase(authProvider);

    await useCase.execute({ token: 'tok-123', novaSenha: 'NovaSenha123' });

    expect(authProvider.redefinirSenha).toHaveBeenCalledWith('tok-123', 'NovaSenha123');
    expect(authProvider.redefinirSenha).toHaveBeenCalledTimes(1);
  });

  it('propaga TokenRecuperacaoInvalidoError quando o token é inválido/expirado', async () => {
    const authProvider = makeAuthProvider({
      redefinirSenha: vi.fn().mockRejectedValue(new TokenRecuperacaoInvalidoError()),
    });
    const useCase = new RedefinirSenhaUseCase(authProvider);

    await expect(
      useCase.execute({ token: 'ruim', novaSenha: 'NovaSenha123' })
    ).rejects.toBeInstanceOf(TokenRecuperacaoInvalidoError);
  });
});
