import { injectable } from 'tsyringe';
import { prisma } from '../../../../../shared/infra/database/prisma';
import { IBarbeiroDetailsRepository } from '../../../application/ports/IBarbeiroDetailsRepository';
import { BarbeiroDetails } from '../../../domain/entities/BarbeiroDetails';
import { ProfileStatus } from '../../../domain/entities/Perfil';

@injectable()
export class PrismaBarbeiroDetailsRepository implements IBarbeiroDetailsRepository {
  async findByProfileId(profileId: string): Promise<BarbeiroDetails | null> {
    const model = await prisma.barbeiroDetails.findUnique({
      where: { profile_id: profileId },
    });

    if (!model) return null;

    return BarbeiroDetails.create({
      profileId: model.profile_id,
      apelidoProfissional: model.apelido_profissional ?? undefined,
      cpfHash: model.cpf_hash ?? undefined,
      anosExperiencia: model.anos_experiencia ?? undefined,
      servicos: model.servicos,
      cursosFormacao: model.cursos_formacao ?? undefined,
      comissaoDesejada: model.comissao_desejada ?? undefined,
      faturamentoMensal: model.faturamento_mensal ? Number(model.faturamento_mensal) : undefined,
      taxaOcupacao: model.taxa_ocupacao ?? undefined,
      recordeMeta: model.recorde_meta ?? undefined,
      valores: model.valores,
      barbeariaAtual: model.barbearia_atual ?? undefined,
      estaDesempregado: model.esta_desempregado,
    });
  }

  async saveWithPerfilStatus(
    details: BarbeiroDetails,
    perfilStatus: { isComplete: boolean; status: ProfileStatus }
  ): Promise<void> {
    const data = this.toPersistence(details);

    await prisma.$transaction([
      prisma.barbeiroDetails.upsert({
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

  private toPersistence(details: BarbeiroDetails) {
    return {
      apelido_profissional: details.apelidoProfissional,
      cpf_hash: details.cpfHash,
      anos_experiencia: details.anosExperiencia,
      servicos: details.servicos,
      cursos_formacao: details.cursosFormacao,
      comissao_desejada: details.comissaoDesejada,
      faturamento_mensal: details.faturamentoMensal,
      taxa_ocupacao: details.taxaOcupacao,
      recorde_meta: details.recordeMeta,
      valores: details.valores,
      barbearia_atual: details.barbeariaAtual,
      esta_desempregado: details.estaDesempregado,
    };
  }
}
