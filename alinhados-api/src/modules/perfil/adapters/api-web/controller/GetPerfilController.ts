import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { GetPerfilUseCase } from '../../../application/use-cases/GetPerfilUseCase';

@injectable()
export class GetPerfilController {
  constructor(
    @inject(GetPerfilUseCase)
    private readonly getPerfilUseCase: GetPerfilUseCase
  ) {}

  async show(req: Request, res: Response): Promise<Response> {
    const result = await this.getPerfilUseCase.execute({ id: String(req.params.id) });
    const { perfil, details, avatarUrl } = result;

    return AppResponse.ok(res, {
      id: perfil.id,
      userType: perfil.userType,
      nome: perfil.nome,
      cidade: perfil.cidade,
      estado: perfil.estado,
      pais: perfil.pais,
      bio: perfil.bio,
      avatarUrl,
      isComplete: perfil.isComplete,
      status: perfil.status,
      createdAt: perfil.createdAt,
      updatedAt: perfil.updatedAt,
      details: details
        ? {
            profileId: details.profileId,
            nomeDecisor: details.nomeDecisor,
            numCadeiras: details.numCadeiras,
            vagasAbertas: details.vagasAbertas,
            comissaoPaga: details.comissaoPaga,
            temFixo: details.temFixo,
            valorFixo: details.valorFixo,
            temClube: details.temClube,
            descricaoClube: details.descricaoClube,
            temPops: details.temPops,
            numUnidades: details.numUnidades,
            eFranquia: details.eFranquia,
            faturamentoMedio: details.faturamentoMedio,
            valores: details.valores,
            estaContratando: details.estaContratando,
          }
        : null,
    });
  }
}
