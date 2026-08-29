import { describe, it, expect, vi } from 'vitest';
import { AlterarSenhaUseCase } from '../../../../../src/modules/identidade/application/use-cases/AlterarSenhaUseCase';
import { IAuthProvider } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import {
  SenhaAtualIncorretaError,
  SessaoInvalidaError,
} from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    removerUsuario: vi.fn(),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    redefinirSenha: vi.fn(),
    alterarSenha: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('AlterarSenhaUseCase', () => {
  it('altera a senha chamando o provider com token, senha atual e nova senha', async () => {
    const authProvider = makeAuthProvider();
    const useCase = new AlterarSenhaUseCase(authProvider);

    await useCase.execute({ accessToken: 'tok', senhaAtual: 'Atual123', novaSenha: 'Nova12345' });

    expect(authProvider.alterarSenha).toHaveBeenCalledWith('tok', 'Atual123', 'Nova12345');
    expect(authProvider.alterarSenha).toHaveBeenCalledTimes(1);
  });

  it('propaga SenhaAtualIncorretaError quando a senha atual está errada', async () => {
    const authProvider = makeAuthProvider({
      alterarSenha: vi.fn().mockRejectedValue(new SenhaAtualIncorretaError()),
    });
    const useCase = new AlterarSenhaUseCase(authProvider);

    await expect(
      useCase.execute({ accessToken: 'tok', senhaAtual: 'errada', novaSenha: 'Nova12345' })
    ).rejects.toBeInstanceOf(SenhaAtualIncorretaError);
  });

  it('propaga SessaoInvalidaError quando o access token é inválido', async () => {
    const authProvider = makeAuthProvider({
      alterarSenha: vi.fn().mockRejectedValue(new SessaoInvalidaError()),
    });
    const useCase = new AlterarSenhaUseCase(authProvider);

    await expect(
      useCase.execute({ accessToken: 'ruim', senhaAtual: 'Atual123', novaSenha: 'Nova12345' })
    ).rejects.toBeInstanceOf(SessaoInvalidaError);
  });
});
