import { injectable } from 'tsyringe';
import { prisma } from '../../../../../shared/infra/database/prisma';
import { IPerfilRepository } from '../../../application/ports/IPerfilRepository';
import { Perfil, ProfileStatus } from '../../../domain/entities/Perfil';

@injectable()
export class PrismaPerfilRepository implements IPerfilRepository {
  async findById(id: string): Promise<Perfil | null> {
    const model = await prisma.perfil.findUnique({ where: { id } });
    if (!model) return null;

    return Perfil.create(
      {
        userType: model.user_type,
        nome: model.nome ?? undefined,
        cidade: model.cidade ?? undefined,
        estado: model.estado ?? undefined,
        pais: model.pais ?? undefined,
        bio: model.bio ?? undefined,
        avatarUrl: model.avatar_url ?? undefined,
        isComplete: model.is_complete,
        status: model.status,
        createdAt: model.created_at,
        updatedAt: model.updated_at,
      },
      model.id
    );
  }

  async save(perfil: Perfil): Promise<void> {
    await prisma.perfil.upsert({
      where: { id: perfil.id },
      create: {
        id: perfil.id,
        user_type: perfil.userType,
        nome: perfil.nome,
        cidade: perfil.cidade,
        estado: perfil.estado,
        pais: perfil.pais,
        bio: perfil.bio,
        avatar_url: perfil.avatarUrl,
        is_complete: perfil.isComplete,
        status: perfil.status,
      },
      update: {
        nome: perfil.nome,
        cidade: perfil.cidade,
        estado: perfil.estado,
        pais: perfil.pais,
        bio: perfil.bio,
        avatar_url: perfil.avatarUrl,
        is_complete: perfil.isComplete,
        status: perfil.status,
      },
    });
  }

  async updateStatus(
    id: string,
    data: { isComplete: boolean; status: ProfileStatus }
  ): Promise<void> {
    await prisma.perfil.update({
      where: { id },
      data: {
        is_complete: data.isComplete,
        status: data.status,
      },
    });
  }
}
