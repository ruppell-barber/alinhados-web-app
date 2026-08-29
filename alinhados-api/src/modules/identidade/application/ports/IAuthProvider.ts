export interface RegistrarInput {
  email: string;
  senha: string;
}

export interface AuthUsuario {
  id: string;
  email: string;
}

export interface SessaoAuth {
  accessToken: string;
  refreshToken: string;
  usuario: AuthUsuario;
}

export interface IAuthProvider {
  registrar(input: RegistrarInput): Promise<AuthUsuario>;
  login(email: string, senha: string): Promise<SessaoAuth>;
  logout(accessToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<SessaoAuth>;
  /**
   * Remove um usuário do provedor de autenticação.
   * Usado como compensação quando a criação do perfil falha após o registro no Auth,
   * evitando usuários órfãos.
   */
  removerUsuario(id: string): Promise<void>;

  /**
   * Identifica o usuário dono de um access token válido.
   * Usado pelo middleware de autenticação para resolver o viewer da requisição.
   * Token inválido/expirado -> erro de sessão; falha operacional -> erro de infraestrutura.
   */
  obterUsuarioPorToken(accessToken: string): Promise<AuthUsuario>;

  /**
   * Dispara o e-mail de recuperação de senha (link/token de uso único com TTL curto).
   * Não deve revelar se o e-mail existe (anti-enumeração / LGPD).
   */
  solicitarRecuperacaoSenha(email: string): Promise<void>;

  /**
   * Valida o token de recuperação e grava a nova senha, invalidando as sessões anteriores.
   * Token inválido/expirado deve virar erro de sessão/token, não erro operacional.
   */
  redefinirSenha(token: string, novaSenha: string): Promise<void>;

  /**
   * Altera a senha de um usuário já autenticado, reconferindo a senha atual antes de gravar
   * (impede troca por uma sessão roubada). Sessão inválida -> erro de sessão; senha atual
   * incorreta -> erro de credenciais.
   */
  alterarSenha(accessToken: string, senhaAtual: string, novaSenha: string): Promise<void>;
}
