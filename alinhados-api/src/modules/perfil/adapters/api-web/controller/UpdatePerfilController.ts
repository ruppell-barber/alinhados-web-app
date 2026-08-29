import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { UpdatePerfilSchema, UpdatePerfilDto } from '@alinhados/contracts';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { UpdatePerfilUseCase } from '../../../application/use-cases/UpdatePerfilUseCase';

@injectable()
export class UpdatePerfilController {
  constructor(
    @inject(UpdatePerfilUseCase)
    private readonly updatePerfilUseCase: UpdatePerfilUseCase
  ) {}

  async update(req: Request, res: Response): Promise<Response> {
    const dto: UpdatePerfilDto = UpdatePerfilSchema.parse(req.body);

    const result = await this.updatePerfilUseCase.execute({
      id: req.userId!,
      ...dto,
    });
    const perfil = result.perfil;

    return AppResponse.ok(res, {
      id: perfil.id,
      nome: perfil.nome,
      cidade: perfil.cidade,
      estado: perfil.estado,
      bio: perfil.bio,
      avatarUrl: perfil.avatarUrl,
      isComplete: perfil.isComplete,
      status: perfil.status,
    });
  }
}
