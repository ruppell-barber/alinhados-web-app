import { injectable } from 'tsyringe';
import { prisma } from '../../../../../shared/infra/database/prisma';
import { IPhotoRepository } from '../../../application/ports/IPhotoRepository';
import { Photo } from '../../../domain/entities/Photo';

@injectable()
export class PrismaPhotoRepository implements IPhotoRepository {
  async save(photo: Photo): Promise<void> {
    await prisma.photo.create({
      data: {
        id: photo.id,
        profile_id: photo.profileId,
        url: photo.url,
        ordem: photo.ordem,
        is_avatar: photo.isAvatar,
      },
    });
  }

  async findById(id: string): Promise<Photo | null> {
    const model = await prisma.photo.findUnique({ where: { id } });
    if (!model) return null;

    return Photo.create(
      {
        profileId: model.profile_id,
        url: model.url,
        ordem: model.ordem ?? undefined,
        isAvatar: model.is_avatar,
        createdAt: model.created_at,
      },
      model.id
    );
  }

  async findByProfileId(profileId: string): Promise<Photo[]> {
    const models = await prisma.photo.findMany({
      where: { profile_id: profileId },
      orderBy: { created_at: 'asc' },
    });

    return models.map((model) =>
      Photo.create(
        {
          profileId: model.profile_id,
          url: model.url,
          ordem: model.ordem ?? undefined,
          isAvatar: model.is_avatar,
          createdAt: model.created_at,
        },
        model.id
      )
    );
  }

  async countGalleryByProfileId(profileId: string): Promise<number> {
    return prisma.photo.count({
      where: { profile_id: profileId, is_avatar: false },
    });
  }

  async deleteById(id: string): Promise<void> {
    await prisma.photo.delete({ where: { id } });
  }

  async deleteAvatarByProfileId(profileId: string): Promise<void> {
    await prisma.photo.deleteMany({
      where: { profile_id: profileId, is_avatar: true },
    });
  }
}
