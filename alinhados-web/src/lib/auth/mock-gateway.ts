import type { CadastroInput, LoginInput, Sessao } from '@/contracts-local';
import { AuthError, type AuthGateway } from './gateway';

const CHAVE_SESSAO = 'alinhados.sessao';
const CHAVE_USUARIOS = 'alinhados.mock.usuarios';
const CHAVE_TOKENS = 'alinhados.mock.tokens.recuperacao';
const TTL_TOKEN_MS = 15 * 60 * 1000; // token com TTL curto (nota técnica da B10)

interface UsuarioMock extends Sessao {
  senha: string;
}

interface TokenRecuperacao {
  token: string;
  email: string;
  expiraEm: number;
}

/**
 * Adapter de desenvolvimento — funciona sem projeto Supabase configurado
 * (persistência em localStorage). Ativado automaticamente quando as envs
 * NEXT_PUBLIC_SUPABASE_* não existem. NÃO usar em produção.
 */
export class MockAuthGateway implements AuthGateway {
  private lerUsuarios(): UsuarioMock[] {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) ?? '[]');
  }

  private async simularLatencia() {
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  async cadastrar(dados: CadastroInput): Promise<Sessao> {
    await this.simularLatencia();
    const usuarios = this.lerUsuarios();
    if (usuarios.some((u) => u.email === dados.email)) {
      throw new AuthError('Este e-mail já está cadastrado.');
    }
    const sessao: Sessao = {
      usuarioId: crypto.randomUUID(),
      email: dados.email,
      tipo: dados.tipo,
    };
    usuarios.push({ ...sessao, senha: dados.senha });
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    return sessao;
  }

  async entrar(dados: LoginInput): Promise<Sessao> {
    await this.simularLatencia();
    const usuario = this.lerUsuarios().find(
      (u) => u.email === dados.email && u.senha === dados.senha,
    );
    if (!usuario) {
      throw new AuthError('E-mail ou senha incorretos.');
    }
    const sessao: Sessao = { usuarioId: usuario.usuarioId, email: usuario.email, tipo: usuario.tipo };
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    return sessao;
  }

  async sair(): Promise<void> {
    localStorage.removeItem(CHAVE_SESSAO);
  }

  async obterSessao(): Promise<Sessao | null> {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  }

  private lerTokens(): TokenRecuperacao[] {
    return JSON.parse(localStorage.getItem(CHAVE_TOKENS) ?? '[]');
  }

  async solicitarRecuperacao(email: string): Promise<{ devLink?: string }> {
    await this.simularLatencia();
    const usuario = this.lerUsuarios().find((u) => u.email === email);
    if (!usuario) {
      throw new AuthError('E-mail não encontrado. Confira ou crie uma conta.'); // RF09
    }
    const token = crypto.randomUUID();
    const tokens = this.lerTokens().filter((t) => t.email !== email);
    tokens.push({ token, email, expiraEm: Date.now() + TTL_TOKEN_MS });
    localStorage.setItem(CHAVE_TOKENS, JSON.stringify(tokens));
    // Sem serviço de e-mail em dev: o "link do e-mail" aparece na tela.
    return { devLink: `/redefinir-senha?token=${token}` };
  }

  async redefinirSenha({ token, novaSenha }: { token?: string; novaSenha: string }): Promise<void> {
    await this.simularLatencia();
    const registro = this.lerTokens().find((t) => t.token === token);
    if (!registro || registro.expiraEm < Date.now()) {
      throw new AuthError('Link inválido ou expirado. Solicite uma nova recuperação.'); // RF09
    }
    const usuarios = this.lerUsuarios().map((u) =>
      u.email === registro.email ? { ...u, senha: novaSenha } : u,
    );
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    localStorage.setItem(
      CHAVE_TOKENS,
      JSON.stringify(this.lerTokens().filter((t) => t.token !== token)),
    );
  }
}
