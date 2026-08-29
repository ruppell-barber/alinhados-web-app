import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider } from '../ports/IAuthProvider';

export type RedefinirSenhaInput = {
  token: string;
  novaSenha: string;
};

export type RedefinirSenhaOutput = void;

@injectable()
export class RedefinirSenhaUseCase implements UseCase<RedefinirSenhaInput, RedefinirSenhaOutput> {
  constructor(@inject('IAuthProvider') private readonly authProvider: IAuthProvider) {}

  async execute(input: RedefinirSenhaInput): Promise<void> {
    // O adapter valida o token de recuperação (-> TokenRecuperacaoInvalidoError) e grava a nova
    // senha, invalidando as sessões anteriores. O use case só orquestra.
    await this.authProvider.redefinirSenha(input.token, input.novaSenha);
  }
}
