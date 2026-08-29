import { injectable } from 'tsyringe';
import { prisma } from '../../../../../shared/infra/database/prisma';
import { IIdentidadeRepository, CriarPerfilInput, PerfilInfo } from '../../../application/ports/IIdentidadeRepository';
import { UserType, ContaStatus } from '../../../domain/entities/Conta';

@injectable()
export class PrismaIdentidadeRepository implements IIdentidadeRepository {
  async criarPerfil(input: CriarPerfilInput): Promise<void> {
    await prisma.perfil.create({
      data: {
        id: input.id,
        user_type: input.user_type,
        is_complete: false,
      },
    });
  }

  async buscarPerfil(userId: string): Promise<PerfilInfo | null> {
    const perfil = await prisma.perfil.findUnique({ where: { id: userId } });
    if (!perfil) return null;

    // Os enums do Prisma espelham os tipos de domínio; a entidade Conta revalida
    // esses valores ao reconstruir a partir da persistência.
    return {
      id: perfil.id,
      user_type: perfil.user_type as UserType,
      is_complete: perfil.is_complete,
      status: perfil.status as ContaStatus,
    };
  }
}
