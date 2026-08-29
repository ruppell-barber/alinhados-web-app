import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  CadastroSchema,
  LoginSchema,
  RefreshSchema,
  RecuperarSenhaSchema,
  RedefinirSenhaSchema,
  AlterarSenhaSchema,
} from '@alinhados/contracts';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { HttpError } from '../../../../../shared/infra/http/HttpError';
import { CadastrarUsuarioUseCase, CadastrarUsuarioInput } from '../../../application/use-cases/CadastrarUsuarioUseCase';
import { LoginUseCase, LoginInput } from '../../../application/use-cases/LoginUseCase';
import { LogoutUseCase, LogoutInput } from '../../../application/use-cases/LogoutUseCase';
import { RefreshUseCase, RefreshInput } from '../../../application/use-cases/RefreshUseCase';
import {
  SolicitarRecuperacaoSenhaUseCase,
  SolicitarRecuperacaoSenhaInput,
} from '../../../application/use-cases/SolicitarRecuperacaoSenhaUseCase';
import { RedefinirSenhaUseCase, RedefinirSenhaInput } from '../../../application/use-cases/RedefinirSenhaUseCase';
import { AlterarSenhaUseCase, AlterarSenhaInput } from '../../../application/use-cases/AlterarSenhaUseCase';

@injectable()
export class IdentidadeController {
  constructor(
    @inject(CadastrarUsuarioUseCase) private readonly cadastrarUseCase: CadastrarUsuarioUseCase,
    @inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @inject(LogoutUseCase) private readonly logoutUseCase: LogoutUseCase,
    @inject(RefreshUseCase) private readonly refreshUseCase: RefreshUseCase,
    @inject(SolicitarRecuperacaoSenhaUseCase)
    private readonly solicitarRecuperacaoSenhaUseCase: SolicitarRecuperacaoSenhaUseCase,
    @inject(RedefinirSenhaUseCase) private readonly redefinirSenhaUseCase: RedefinirSenhaUseCase,
    @inject(AlterarSenhaUseCase) private readonly alterarSenhaUseCase: AlterarSenhaUseCase
  ) {}

  async cadastrar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const dto = CadastroSchema.parse(req.body);
      // Adapta o DTO público (contracts) para o Input do use case — objetos separados de propósito.
      const input: CadastrarUsuarioInput = {
        email: dto.email,
        senha: dto.senha,
        user_type: dto.user_type,
      };
      const result = await this.cadastrarUseCase.execute(input);
      return AppResponse.created(res, result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const dto = LoginSchema.parse(req.body);
      const input: LoginInput = { email: dto.email, senha: dto.senha };
      const result = await this.loginUseCase.execute(input);
      return AppResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) {
        // Não formatamos a resposta aqui: lançamos um erro de adapter para o globalErrorHandler.
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const input: LogoutInput = { accessToken: auth.slice(7) };
      await this.logoutUseCase.execute(input);
      return AppResponse.ok(res, { message: 'Sessão encerrada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const dto = RefreshSchema.parse(req.body);
      const input: RefreshInput = { refreshToken: dto.refreshToken };
      const result = await this.refreshUseCase.execute(input);
      return AppResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  async recuperarSenha(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const dto = RecuperarSenhaSchema.parse(req.body);
      const input: SolicitarRecuperacaoSenhaInput = { email: dto.email };
      await this.solicitarRecuperacaoSenhaUseCase.execute(input);
      // Resposta genérica de propósito (anti-enumeração): não revela se o e-mail existe.
      return AppResponse.ok(res, {
        message: 'Se o e-mail estiver cadastrado, enviamos um link de recuperação.',
      });
    } catch (err) {
      next(err);
    }
  }

  async redefinirSenha(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const dto = RedefinirSenhaSchema.parse(req.body);
      const input: RedefinirSenhaInput = { token: dto.token, novaSenha: dto.novaSenha };
      await this.redefinirSenhaUseCase.execute(input);
      return AppResponse.ok(res, { message: 'Senha redefinida com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  async alterarSenha(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) {
        throw new HttpError(401, 'AUTHORIZATION_HEADER_MISSING', 'Token de acesso não fornecido.');
      }
      const dto = AlterarSenhaSchema.parse(req.body);
      const input: AlterarSenhaInput = {
        accessToken: auth.slice(7),
        senhaAtual: dto.senhaAtual,
        novaSenha: dto.novaSenha,
      };
      await this.alterarSenhaUseCase.execute(input);
      return AppResponse.ok(res, { message: 'Senha alterada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}
