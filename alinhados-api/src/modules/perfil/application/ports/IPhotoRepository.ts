import { Photo } from '../../domain/entities/Photo';

export interface IPhotoRepository {
  save(photo: Photo): Promise<void>;
  findById(id: string): Promise<Photo | null>;
  findByProfileId(profileId: string): Promise<Photo[]>;
  countGalleryByProfileId(profileId: string): Promise<number>;
  deleteById(id: string): Promise<void>;
  deleteAvatarByProfileId(profileId: string): Promise<void>;
}
