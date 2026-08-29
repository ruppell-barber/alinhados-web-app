import { injectable, inject } from 'tsyringe';
import { UseCase } from '../../../../shared/core/domain/UseCase';
import { IAuthProvider } from '../ports/IAuthProvider';

export type RefreshInput = { refreshToken: string };
export type RefreshOutput = { accessToken: string; refreshToken: string };

@injectable()
export class RefreshUseCase implements UseCase<RefreshInput, RefreshOutput> {
  constructor(@inject('IAuthProvider') private readonly authProvider: IAuthProvider) {}

  async execute(input: RefreshInput): Promise<RefreshOutput> {
    const sessao = await this.authProvider.refresh(input.refreshToken);
    return { accessToken: sessao.accessToken, refreshToken: sessao.refreshToken };
  }
}
