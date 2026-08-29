import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider } from '../ports/IAuthProvider';

export type SolicitarRecuperacaoSenhaInput = {
  email: string;
};

export type SolicitarRecuperacaoSenhaOutput = void;

@injectable()
export class SolicitarRecuperacaoSenhaUseCase
  implements UseCase<SolicitarRecuperacaoSenhaInput, SolicitarRecuperacaoSenhaOutput>
{
  constructor(@inject('IAuthProvider') private readonly authProvider: IAuthProvider) {}

  async execute(input: SolicitarRecuperacaoSenhaInput): Promise<void> {
    // Anti-enumeração (LGPD): o caso de uso apenas dispara a solicitação. O adapter não revela
    // se o e-mail está cadastrado — o controller responde sempre de forma genérica.
    await this.authProvider.solicitarRecuperacaoSenha(input.email);
  }
}
