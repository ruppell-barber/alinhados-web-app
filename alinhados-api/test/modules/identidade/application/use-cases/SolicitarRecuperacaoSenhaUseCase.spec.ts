import { describe, it, expect, vi } from 'vitest';
import { SolicitarRecuperacaoSenhaUseCase } from '../../../../../src/modules/identidade/application/use-cases/SolicitarRecuperacaoSenhaUseCase';
import { IAuthProvider } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import { ErroDeInfraestrutura } from '../../../../../src/shared/core/errors/ErroDeInfraestrutura';

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    removerUsuario: vi.fn(),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn().mockResolvedValue(undefined),
    redefinirSenha: vi.fn(),
    alterarSenha: vi.fn(),
    ...overrides,
  };
}

describe('SolicitarRecuperacaoSenhaUseCase', () => {
  it('dispara a recuperação chamando o provider com o e-mail', async () => {
    const authProvider = makeAuthProvider();
    const useCase = new SolicitarRecuperacaoSenhaUseCase(authProvider);

    await useCase.execute({ email: 'barbeiro@exemplo.com' });

    expect(authProvider.solicitarRecuperacaoSenha).toHaveBeenCalledWith('barbeiro@exemplo.com');
    expect(authProvider.solicitarRecuperacaoSenha).toHaveBeenCalledTimes(1);
  });

  it('propaga erro operacional do provider sem transformar', async () => {
    const infra = new ErroDeInfraestrutura('Provedor indisponível.');
    const authProvider = makeAuthProvider({
      solicitarRecuperacaoSenha: vi.fn().mockRejectedValue(infra),
    });
    const useCase = new SolicitarRecuperacaoSenhaUseCase(authProvider);

    await expect(useCase.execute({ email: 'x@y.com' })).rejects.toBe(infra);
  });
});
