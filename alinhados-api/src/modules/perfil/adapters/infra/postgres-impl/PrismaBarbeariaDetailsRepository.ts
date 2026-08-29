import { injectable } from 'tsyringe';
import { prisma } from '../../../../../shared/infra/database/prisma';
import { IBarbeariaDetailsRepository } from '../../../application/ports/IBarbeariaDetailsRepository';
import { BarbeariaDetails } from '../../../domain/entities/BarbeariaDetails';
import { ProfileStatus } from '../../../domain/entities/Perfil';

@injectable()
export class PrismaBarbeariaDetailsRepository implements IBarbeariaDetailsRepository {
  async findByProfileId(profileId: string): Promise<BarbeariaDetails | null> {
    const model = await prisma.barbeariaDetails.findUnique({
      where: { profile_id: profileId },
    });

    if (!model) return null;

    return BarbeariaDetails.create({
      profileId: model.profile_id,
      nomeDecisor: model.nome_decisor ?? undefined,
      cnpjHash: model.cnpj_hash ?? undefined,
      numCadeiras: model.num_cadeiras ?? undefined,
      vagasAbertas: model.vagas_abertas ?? undefined,
      comissaoPaga: model.comissao_paga ?? undefined,
      temFixo: model.tem_fixo,
      valorFixo: model.valor_fixo ? Number(model.valor_fixo) : undefined,
      temClube: model.tem_clube,
      descricaoClube: model.descricao_clube ?? undefined,
      temPops: model.tem_pops,
      numUnidades: model.num_unidades ?? undefined,
      eFranquia: model.e_franquia,
      faturamentoMedio: model.faturamento_medio ? Number(model.faturamento_medio) : undefined,
      valores: model.valores,
      estaContratando: model.esta_contratando,
    });
  }

  async saveWithPerfilStatus(
    details: BarbeariaDetails,
    perfilStatus: { isComplete: boolean; status: ProfileStatus }
  ): Promise<void> {
    const data = this.toPersistence(details);

    await prisma.$transaction([
      prisma.barbeariaDetails.upsert({
        where: { profile_id: details.profileId },
        create: {
          profile_id: details.profileId,
          ...data,
        },
        update: data,
      }),
      prisma.perfil.update({
        where: { id: details.profileId },
        data: {
          is_complete: perfilStatus.isComplete,
          status: perfilStatus.status,
        },
      }),
    ]);
  }

  private toPersistence(details: BarbeariaDetails) {
    return {
      nome_decisor: details.nomeDecisor,
      cnpj_hash: details.cnpjHash,
      num_cadeiras: details.numCadeiras,
      vagas_abertas: details.vagasAbertas,
      comissao_paga: details.comissaoPaga,
      tem_fixo: details.temFixo,
      valor_fixo: details.valorFixo,
      tem_clube: details.temClube,
      descricao_clube: details.descricaoClube,
      tem_pops: details.temPops,
      num_unidades: details.numUnidades,
      e_franquia: details.eFranquia,
      faturamento_medio: details.faturamentoMedio,
      valores: details.valores,
      esta_contratando: details.estaContratando,
    };
  }
}
