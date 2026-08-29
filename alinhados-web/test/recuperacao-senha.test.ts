import { beforeEach, describe, expect, it } from 'vitest';
import { redefinirSenhaSchema, solicitarRecuperacaoSchema } from '@/contracts-local';
import { MockAuthGateway } from '@/lib/auth/mock-gateway';

describe('schemas de recuperação de senha (B10)', () => {
  it('valida o e-mail da solicitação', () => {
    expect(solicitarRecuperacaoSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(solicitarRecuperacaoSchema.safeParse({ email: 'invalido' }).success).toBe(false);
  });

  it('exige nova senha forte e confirmação igual', () => {
    expect(
      redefinirSenhaSchema.safeParse({ senha: 'nova12345', confirmarSenha: 'nova12345' }).success,
    ).toBe(true);
    expect(
      redefinirSenhaSchema.safeParse({ senha: 'nova12345', confirmarSenha: 'outra123' }).success,
    ).toBe(false);
    expect(redefinirSenhaSchema.safeParse({ senha: 'curta1', confirmarSenha: 'curta1' }).success).toBe(false);
  });
});

describe('fluxo completo no MockAuthGateway (B10)', () => {
  beforeEach(() => localStorage.clear());

  async function cadastrarUsuario(gateway: MockAuthGateway) {
    return gateway.cadastrar({
      email: 'gabriel@alinhados.app',
      senha: 'antiga123',
      confirmarSenha: 'antiga123',
      tipo: 'barbeiro',
      documento: '529.982.247-25',
    });
  }

  it('solicita, redefine com o token e entra com a nova senha', async () => {
    const gateway = new MockAuthGateway();
    await cadastrarUsuario(gateway);

    const { devLink } = await gateway.solicitarRecuperacao('gabriel@alinhados.app');
    expect(devLink).toContain('/redefinir-senha?token=');
    const token = devLink!.split('token=')[1];

    await gateway.redefinirSenha({ token, novaSenha: 'nova12345' });

    await expect(
      gateway.entrar({ email: 'gabriel@alinhados.app', senha: 'nova12345' }),
    ).resolves.toMatchObject({ email: 'gabriel@alinhados.app' });
    await expect(
      gateway.entrar({ email: 'gabriel@alinhados.app', senha: 'antiga123' }),
    ).rejects.toThrow('E-mail ou senha incorretos.');
  });

  it('recusa e-mail não cadastrado com mensagem clara (RF09)', async () => {
    const gateway = new MockAuthGateway();
    await expect(gateway.solicitarRecuperacao('naoexiste@x.com')).rejects.toThrow(
      'E-mail não encontrado',
    );
  });

  it('recusa token inválido e impede reuso do token (TTL/uso único)', async () => {
    const gateway = new MockAuthGateway();
    await cadastrarUsuario(gateway);

    await expect(
      gateway.redefinirSenha({ token: 'token-falso', novaSenha: 'nova12345' }),
    ).rejects.toThrow('Link inválido ou expirado');

    const { devLink } = await gateway.solicitarRecuperacao('gabriel@alinhados.app');
    const token = devLink!.split('token=')[1];
    await gateway.redefinirSenha({ token, novaSenha: 'nova12345' });
    await expect(
      gateway.redefinirSenha({ token, novaSenha: 'outra1234' }),
    ).rejects.toThrow('Link inválido ou expirado');
  });
});
