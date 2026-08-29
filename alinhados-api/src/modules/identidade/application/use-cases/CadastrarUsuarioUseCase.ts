import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider, AuthUsuario } from '../ports/IAuthProvider';
import { IIdentidadeRepository } from '../ports/IIdentidadeRepository';
import { UserType } from '../../domain/entities/Conta';
import { logger } from '../../../../shared/logger';

export type CadastrarUsuarioInput = {
  email: string;
  senha: string;
  user_type: UserType;
};

export type CadastrarUsuarioOutput = {
  usuario: Pick<AuthUsuario, 'id' | 'email'> & { user_type: UserType };
};

@injectable()
export class CadastrarUsuarioUseCase implements UseCase<CadastrarUsuarioInput, CadastrarUsuarioOutput> {
  constructor(
    @inject('IAuthProvider') private readonly authProvider: IAuthProvider,
    @inject('IIdentidadeRepository') private readonly identidadeRepository: IIdentidadeRepository
  ) {}

  async execute(input: CadastrarUsuarioInput): Promise<CadastrarUsuarioOutput> {
    // O adapter é quem conhece o provedor: e-mail duplicado -> ContaJaExisteError,
    // erro operacional -> ErroDeInfraestrutura. O use case apenas orquestra.
    const authUsuario = await this.authProvider.registrar({ email: input.email, senha: input.senha });

    try {
      await this.identidadeRepository.criarPerfil({
        id: authUsuario.id,
        user_type: input.user_type,
      });
    } catch (err) {
      // Compensação: o usuário já existe no Auth mas o perfil falhou.
      // Removemos o usuário do Auth para não deixar registro órfão.
      await this.compensarUsuarioOrfao(authUsuario.id);
      throw err;
    }

    return { usuario: { id: authUsuario.id, email: authUsuario.email, user_type: input.user_type } };
  }

  private async compensarUsuarioOrfao(usuarioId: string): Promise<void> {
    try {
      await this.authProvider.removerUsuario(usuarioId);
    } catch (compensacaoErr) {
      // A compensação falhou: registramos para reconciliação manual, mas não
      // sobrescrevemos o erro original que será relançado ao chamador.
      logger.error(
        { err: compensacaoErr, usuarioId },
        'Falha ao remover usuário órfão do Auth após erro na criação do perfil'
      );
    }
  }
}
