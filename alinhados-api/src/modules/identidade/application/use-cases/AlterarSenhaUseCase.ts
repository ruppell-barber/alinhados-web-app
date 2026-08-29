import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider } from '../ports/IAuthProvider';

export type AlterarSenhaInput = {
  accessToken: string;
  senhaAtual: string;
  novaSenha: string;
};

export type AlterarSenhaOutput = void;

@injectable()
export class AlterarSenhaUseCase implements UseCase<AlterarSenhaInput, AlterarSenhaOutput> {
  constructor(@inject('IAuthProvider') private readonly authProvider: IAuthProvider) {}

  async execute(input: AlterarSenhaInput): Promise<void> {
    // O adapter identifica o usuário pelo token, reconfere a senha atual (-> CredenciaisInvalidas/
    // SenhaAtualIncorreta) e grava a nova senha. O use case só orquestra.
    await this.authProvider.alterarSenha(input.accessToken, input.senhaAtual, input.novaSenha);
  }
}
