import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CadastroInput, LoginInput, Sessao, TipoUsuario } from '@/contracts-local';
import { somenteDigitos } from '@/contracts-local';
import { AuthError, type AuthGateway } from './gateway';

/**
 * Adapter real — Supabase Auth (decisão verbal da daily 03/07; ADR-0001 pendente).
 * profiles.id espelha auth.users.id (Wiki 1.2). O documento (CPF/CNPJ) segue nos
 * metadados do signUp para o backend criptografar (RNF03) — nunca é exibido.
 */
export class SupabaseAuthGateway implements AuthGateway {
  private client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  async cadastrar(dados: CadastroInput): Promise<Sessao> {
    const { data, error } = await this.client.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          user_type: dados.tipo,
          documento: somenteDigitos(dados.documento),
        },
      },
    });
    if (error || !data.user) {
      throw new AuthError(traduzirErro(error?.message));
    }
    return { usuarioId: data.user.id, email: dados.email, tipo: dados.tipo };
  }

  async entrar(dados: LoginInput): Promise<Sessao> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    });
    if (error || !data.user) {
      throw new AuthError(traduzirErro(error?.message));
    }
    return {
      usuarioId: data.user.id,
      email: data.user.email ?? dados.email,
      tipo: (data.user.user_metadata?.user_type as TipoUsuario) ?? 'barbeiro',
    };
  }

  async sair(): Promise<void> {
    await this.client.auth.signOut();
  }

  async obterSessao(): Promise<Sessao | null> {
    const { data } = await this.client.auth.getSession();
    const usuario = data.session?.user;
    if (!usuario) return null;
    return {
      usuarioId: usuario.id,
      email: usuario.email ?? '',
      tipo: (usuario.user_metadata?.user_type as TipoUsuario) ?? 'barbeiro',
    };
  }

  async solicitarRecuperacao(email: string): Promise<{ devLink?: string }> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) {
      throw new AuthError('Não foi possível enviar o e-mail. Tente novamente em instantes.');
    }
    return {};
  }

  async redefinirSenha({ novaSenha }: { token?: string; novaSenha: string }): Promise<void> {
    // O link do e-mail autentica a sessão ao abrir /redefinir-senha (detectSessionInUrl).
    const { error } = await this.client.auth.updateUser({ password: novaSenha });
    if (error) {
      throw new AuthError('Link inválido ou expirado. Solicite uma nova recuperação.');
    }
  }
}

function traduzirErro(mensagem?: string): string {
  if (!mensagem) return 'Não foi possível concluir. Tente novamente.';
  if (mensagem.includes('already registered')) return 'Este e-mail já está cadastrado.';
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  return 'Não foi possível concluir. Tente novamente em instantes.';
}
