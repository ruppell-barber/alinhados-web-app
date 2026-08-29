import type { CadastroInput, LoginInput, Sessao } from '@/contracts-local';

/**
 * Porta de autenticação do front (espírito hexagonal do projeto).
 * A daily de 03/07 decidiu verbalmente usar Supabase Auth (ADR-0001 formal
 * pendente) — se o ADR mudar, troca-se só o adapter, nunca as telas.
 */
export interface AuthGateway {
  cadastrar(dados: CadastroInput): Promise<Sessao>;
  entrar(dados: LoginInput): Promise<Sessao>;
  sair(): Promise<void>;
  obterSessao(): Promise<Sessao | null>;
  /**
   * B10/RF06 — dispara o e-mail de recuperação. `devLink` só existe no adapter
   * mock (sem serviço de e-mail em dev, o link aparece na própria tela).
   */
  solicitarRecuperacao(email: string): Promise<{ devLink?: string }>;
  /** B10 — define a nova senha (token do link no mock; sessão do link no Supabase). */
  redefinirSenha(dados: { token?: string; novaSenha: string }): Promise<void>;
}

export class AuthError extends Error {}
