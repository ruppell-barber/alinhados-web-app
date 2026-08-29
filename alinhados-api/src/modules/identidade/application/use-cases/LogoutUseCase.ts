import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider } from '../ports/IAuthProvider';

export type LogoutInput = { accessToken: string };
export type LogoutOutput = void;

@injectable()
export class LogoutUseCase implements UseCase<LogoutInput, LogoutOutput> {
  constructor(@inject('IAuthProvider') private readonly authProvider: IAuthProvider) {}

  async execute(input: LogoutInput): Promise<void> {
    await this.authProvider.logout(input.accessToken);
  }
}
