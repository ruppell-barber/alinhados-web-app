import { injectable, inject } from 'tsyringe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthProvider, RegistrarInput, AuthUsuario, SessaoAuth } from '../../../application/ports/IAuthProvider';
import {
  CredenciaisInvalidasError,
  ContaJaExisteError,
  SessaoInvalidaError,
  TokenRecuperacaoInvalidoError,
  SenhaAtualIncorretaError,
} from '../../../domain/errors/IdentidadeErrors';
import { ErroDeInfraestrutura } from '../../../../../shared/core/errors/ErroDeInfraestrutura';
import { IEnvService } from '../../../../../shared/infra/services/env';
import { logger } from '../../../../../shared/logger';

/**
 * Falha operacional do provedor (rede, timeout, indisponibilidade). O supabase-js
 * embrulha falhas de rede em `AuthRetryableFetchError` e usa `status` >= 500 para
 * erros de servidor. Só o que reconhecemos como indisponibilidade vira 503;
 * o resto sobe cru e o `globalErrorHandler` responde 500.
 */
function isIndisponibilidade(error: { name?: string; status?: number | null }): boolean {
  return error.name === 'AuthRetryableFetchError' || (typeof error.status === 'number' && error.status >= 500);
}

@injectable()
export class SupabaseAuthProvider implements IAuthProvider {
  private readonly client: SupabaseClient;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(@inject('IEnvService') envService: IEnvService) {
    this.supabaseUrl = envService.get('SUPABASE_URL');
    this.supabaseKey = envService.get('SUPABASE_SERVICE_ROLE_KEY');
    this.client = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async registrar(input: RegistrarInput): Promise<AuthUsuario> {
    const { data, error } = await this.client.auth.admin.createUser({
      email: input.email,
      password: input.senha,
      email_confirm: true,
    });

    if (error) {
      if (isIndisponibilidade(error)) throw this.indisponivel(error);
      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        throw new ContaJaExisteError();
      }
      throw error; // desconhecido -> sobe cru -> 500
    }

    return { id: data.user.id, email: data.user.email! };
  }

  async login(email: string, senha: string): Promise<SessaoAuth> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password: senha });

    if (error) {
      if (isIndisponibilidade(error)) throw this.indisponivel(error);
      if (error.code === 'invalid_credentials') throw new CredenciaisInvalidasError();
      throw error; // desconhecido -> sobe cru -> 500
    }

    if (!data.session || !data.user) throw new CredenciaisInvalidasError();

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      usuario: { id: data.user.id, email: data.user.email! },
    };
  }

  async refresh(refreshToken: string): Promise<SessaoAuth> {
    const { data, error } = await this.client.auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      if (isIndisponibilidade(error)) throw this.indisponivel(error);
      throw new SessaoInvalidaError('Refresh token inválido ou expirado.');
    }

    if (!data.session || !data.user) throw new SessaoInvalidaError('Refresh token inválido ou expirado.');

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      usuario: { id: data.user.id, email: data.user.email! },
    };
  }

  async obterUsuarioPorToken(accessToken: string): Promise<AuthUsuario> {
    const { data, error } = await this.client.auth.getUser(accessToken);

    if (error) {
      if (isIndisponibilidade(error)) throw this.indisponivel(error);
      throw new SessaoInvalidaError();
    }

    if (!data.user) throw new SessaoInvalidaError();

    return {
      id: data.user.id,
      email: data.user.email ?? '',
    };
  }

  async logout(accessToken: string): Promise<void> {
    const { data, error } = await this.client.auth.getUser(accessToken);

    if (error) {
      if (isIndisponibilidade(error)) throw this.indisponivel(error);
      throw new SessaoInvalidaError('Sessão inválida ou já encerrada.');
    }

    if (!data.user) throw new SessaoInvalidaError('Sessão inválida ou já encerrada.');

    // Revogação do refresh token é best-effort: se falhar, o cliente já perdeu a sessão local.
    const response = await fetch(`${this.supabaseUrl}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: this.supabaseKey,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      logger.error(
        { status: response.status, body, userId: data.user.id },
        'Falha ao revogar refresh token no Supabase — logout do cliente prossegue normalmente'
      );
    }
  }

  async removerUsuario(id: string): Promise<void> {
    // Chamado como compensação; o use case captura e loga qualquer falha aqui.
    const { error } = await this.client.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    // Anti-enumeração: não revela se o e-mail existe. Como o Zod já validou o formato, qualquer erro
    // aqui é do provedor (rate-limit, SMTP, indisponibilidade) -> 503, nunca 500 (mantém 200/503 do contrato).
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) {
      throw this.indisponivel(error);
    }
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    // 1. Valida o token de recuperação recebido no e-mail (token_hash).
    const { data, error } = await this.client.auth.verifyOtp({ token_hash: token, type: 'recovery' });
    if (error) {
      if (isIndisponibilidade(error)) throw this.indisponivel(error);
      throw new TokenRecuperacaoInvalidoError();
    }
    if (!data.user) throw new TokenRecuperacaoInvalidoError();

    // 2. Grava a nova senha (service role). A troca de senha no GoTrue revoga as sessões anteriores.
    const { error: updateError } = await this.client.auth.admin.updateUserById(data.user.id, {
      password: novaSenha,
    });
    if (updateError) {
      throw new ErroDeInfraestrutura('Falha ao atualizar a senha no provedor de autenticação.', {
        cause: updateError,
      });
    }
  }

  async alterarSenha(accessToken: string, senhaAtual: string, novaSenha: string): Promise<void> {
    // 1. Identifica o usuário pela sessão atual (access token).
    const { data: userData, error: userError } = await this.client.auth.getUser(accessToken);
    if (userError || !userData.user?.email) {
      if (userError && isIndisponibilidade(userError)) throw this.indisponivel(userError);
      throw new SessaoInvalidaError();
    }

    // 2. Reconfere a senha atual (defesa contra sessão roubada).
    const { error: reauthError } = await this.client.auth.signInWithPassword({
      email: userData.user.email,
      password: senhaAtual,
    });
    if (reauthError) {
      if (isIndisponibilidade(reauthError)) throw this.indisponivel(reauthError);
      if (reauthError.code === 'invalid_credentials') throw new SenhaAtualIncorretaError();
      throw reauthError; // desconhecido -> sobe cru -> 500
    }

    // 3. Grava a nova senha (service role).
    const { error: updateError } = await this.client.auth.admin.updateUserById(userData.user.id, {
      password: novaSenha,
    });
    if (updateError) {
      throw new ErroDeInfraestrutura('Falha ao atualizar a senha no provedor de autenticação.', {
        cause: updateError,
      });
    }
  }

  private indisponivel(cause: unknown): ErroDeInfraestrutura {
    return new ErroDeInfraestrutura('Provedor de autenticação indisponível.', { cause });
  }
}
