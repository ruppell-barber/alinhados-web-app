import { describe, expect, it, vi } from 'vitest';
import { AutenticarRequisicaoUseCase } from '../../../../../src/modules/identidade/application/use-cases/AutenticarRequisicaoUseCase';
import { IAuthProvider } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import { IIdentidadeRepository } from '../../../../../src/modules/identidade/application/ports/IIdentidadeRepository';

function buildUseCase() {
  const authProvider = {
    obterUsuarioPorToken: vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    }),
  };
  const identidadeRepository = {
    buscarPerfil: vi.fn().mockResolvedValue({
      id: 'user-1',
      user_type: 'barbearia',
      status: 'aberto',
      is_complete: true,
    }),
  };

  const useCase = new AutenticarRequisicaoUseCase(
    authProvider as unknown as IAuthProvider,
    identidadeRepository as unknown as IIdentidadeRepository
  );

  return { useCase, authProvider, identidadeRepository };
}

describe('AutenticarRequisicaoUseCase', () => {
  it('valida o token e retorna o id da conta ativa', async () => {
    const { useCase, authProvider } = buildUseCase();

    await expect(
      useCase.execute({ accessToken: 'access-token' })
    ).resolves.toEqual({ userId: 'user-1' });
    expect(authProvider.obterUsuarioPorToken).toHaveBeenCalledWith('access-token');
  });

  it('rejeita usuário autenticado sem perfil correspondente', async () => {
    const { useCase, identidadeRepository } = buildUseCase();
    identidadeRepository.buscarPerfil.mockResolvedValue(null);

    await expect(
      useCase.execute({ accessToken: 'access-token' })
    ).rejects.toMatchObject({
      kind: 'conflict',
      code: 'CONTA_SEM_PERFIL',
    });
  });

  it('bloqueia conta banida mesmo com token ainda válido', async () => {
    const { useCase, identidadeRepository } = buildUseCase();
    identidadeRepository.buscarPerfil.mockResolvedValue({
      id: 'user-1',
      user_type: 'barbearia',
      status: 'banido',
      is_complete: true,
    });

    await expect(
      useCase.execute({ accessToken: 'access-token' })
    ).rejects.toMatchObject({
      kind: 'permission',
      code: 'CONTA_SUSPENSA',
    });
  });
});
