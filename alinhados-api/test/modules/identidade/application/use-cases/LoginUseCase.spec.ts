import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase, LoginInput } from '../../../../../src/modules/identidade/application/use-cases/LoginUseCase';
import { IAuthProvider, SessaoAuth } from '../../../../../src/modules/identidade/application/ports/IAuthProvider';
import { IIdentidadeRepository, PerfilInfo } from '../../../../../src/modules/identidade/application/ports/IIdentidadeRepository';
import {
  CredenciaisInvalidasError,
  ContaSuspensaError,
  ContaSemPerfilError,
} from '../../../../../src/modules/identidade/domain/errors/IdentidadeErrors';
import { ErroDeInfraestrutura } from '../../../../../src/shared/core/errors/ErroDeInfraestrutura';

const fakeSessao: SessaoAuth = {
  accessToken: 'access-abc',
  refreshToken: 'refresh-xyz',
  usuario: { id: 'user-1', email: 'barbeiro@exemplo.com' },
};

const fakePerfil: PerfilInfo = {
  id: 'user-1',
  user_type: 'barbeiro',
  is_complete: false,
  status: 'disponivel',
};

const validInput: LoginInput = { email: 'barbeiro@exemplo.com', senha: 'senha123' };

function makeAuthProvider(overrides: Partial<IAuthProvider> = {}): IAuthProvider {
  return {
    registrar: vi.fn(),
    login: vi.fn().mockResolvedValue(fakeSessao),
    logout: vi.fn(),
    refresh: vi.fn(),
    removerUsuario: vi.fn(),
    obterUsuarioPorToken: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    redefinirSenha: vi.fn(),
    alterarSenha: vi.fn(),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<IIdentidadeRepository> = {}): IIdentidadeRepository {
  return {
    criarPerfil: vi.fn(),
    buscarPerfil: vi.fn().mockResolvedValue(fakePerfil),
    ...overrides,
  };
}

describe('LoginUseCase', () => {
  it('retorna tokens e dados do usuário em login válido', async () => {
    const useCase = new LoginUseCase(makeAuthProvider(), makeRepo());

    const result = await useCase.execute(validInput);

    expect(result).toEqual({
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
      usuario: { id: 'user-1', email: 'barbeiro@exemplo.com', user_type: 'barbeiro', is_complete: false },
    });
  });

  it('propaga CredenciaisInvalidasError sem reclassificar (RF09)', async () => {
    const authProvider = makeAuthProvider({
      login: vi.fn().mockRejectedValue(new CredenciaisInvalidasError()),
    });
    const useCase = new LoginUseCase(authProvider, makeRepo());

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(CredenciaisInvalidasError);
  });

  it('propaga erro operacional (Supabase fora do ar) como infra, NUNCA como 401', async () => {
    const authProvider = makeAuthProvider({
      login: vi.fn().mockRejectedValue(new ErroDeInfraestrutura('Provedor indisponível.')),
    });
    const useCase = new LoginUseCase(authProvider, makeRepo());

    // Não deve virar erro de autenticação — deve subir como ErroDeInfraestrutura (-> 503)
    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(ErroDeInfraestrutura);
  });

  it('lança ContaSemPerfilError quando o usuário autenticado não possui perfil', async () => {
    const repo = makeRepo({ buscarPerfil: vi.fn().mockResolvedValue(null) });
    const useCase = new LoginUseCase(makeAuthProvider(), repo);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(ContaSemPerfilError);
  });

  it('lança ContaSuspensaError quando conta está banida (RF08)', async () => {
    const repo = makeRepo({
      buscarPerfil: vi.fn().mockResolvedValue({ ...fakePerfil, status: 'banido' }),
    });
    const useCase = new LoginUseCase(makeAuthProvider(), repo);

    const promise = useCase.execute(validInput);
    await expect(promise).rejects.toBeInstanceOf(ContaSuspensaError);
    await expect(useCase.execute(validInput)).rejects.toThrow('Conta suspensa. Entre em contato com o suporte.');
  });
});
