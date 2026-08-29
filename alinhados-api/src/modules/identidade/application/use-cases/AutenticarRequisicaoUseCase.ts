import { inject, injectable } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { Conta } from '../../domain/entities/Conta';
import { ContaSemPerfilError } from '../../domain/errors/IdentidadeErrors';
import { IAuthProvider } from '../ports/IAuthProvider';
import { IIdentidadeRepository } from '../ports/IIdentidadeRepository';

export interface AutenticarRequisicaoInput {
  accessToken: string;
}

export interface AutenticarRequisicaoOutput {
  userId: string;
}

@injectable()
export class AutenticarRequisicaoUseCase
  implements UseCase<AutenticarRequisicaoInput, AutenticarRequisicaoOutput>
{
  constructor(
    @inject('IAuthProvider')
    private readonly authProvider: IAuthProvider,

    @inject('IIdentidadeRepository')
    private readonly identidadeRepository: IIdentidadeRepository
  ) {}

  async execute(
    input: AutenticarRequisicaoInput
  ): Promise<AutenticarRequisicaoOutput> {
    const usuario = await this.authProvider.obterUsuarioPorToken(input.accessToken);
    const perfil = await this.identidadeRepository.buscarPerfil(usuario.id);
    if (!perfil) {
      throw new ContaSemPerfilError();
    }

    const conta = Conta.fromPersistence({
      id: perfil.id,
      email: usuario.email,
      userType: perfil.user_type,
      status: perfil.status,
      isComplete: perfil.is_complete,
    });
    conta.assertPodeAutenticar();

    return { userId: conta.id };
  }
}
