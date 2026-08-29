import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider } from '../ports/IAuthProvider';
import { IIdentidadeRepository } from '../ports/IIdentidadeRepository';
import { Conta } from '../../domain/entities/Conta';
import { ContaSemPerfilError } from '../../domain/errors/IdentidadeErrors';

export type LoginInput = {
  email: string;
  senha: string;
};

export type LoginOutput = {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    email: string;
    user_type: string;
    is_complete: boolean;
  };
};

@injectable()
export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  constructor(
    @inject('IAuthProvider') private readonly authProvider: IAuthProvider,
    @inject('IIdentidadeRepository') private readonly identidadeRepository: IIdentidadeRepository
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // O adapter traduz credencial inválida (-> CredenciaisInvalidasError) e deixa
    // erros operacionais subirem. O use case NÃO captura nem reclassifica erros.
    const sessao = await this.authProvider.login(input.email, input.senha);

    const perfil = await this.identidadeRepository.buscarPerfil(sessao.usuario.id);
    if (!perfil) {
      throw new ContaSemPerfilError();
    }

    // A entidade valida invariantes de estado e concentra a regra de banimento (RF08).
    const conta = Conta.fromPersistence({
      id: perfil.id,
      email: sessao.usuario.email,
      userType: perfil.user_type,
      status: perfil.status,
      isComplete: perfil.is_complete,
    });

    conta.assertPodeAutenticar();

    return {
      accessToken: sessao.accessToken,
      refreshToken: sessao.refreshToken,
      usuario: {
        id: conta.id,
        email: sessao.usuario.email,
        user_type: conta.userType,
        is_complete: conta.isComplete,
      },
    };
  }
}
