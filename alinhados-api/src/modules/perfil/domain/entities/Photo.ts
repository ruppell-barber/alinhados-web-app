import { Entity } from '../../../../shared/core/domain/Entity';
import { DomainError } from '../../../../shared/core/domain/DomainError';

export interface PhotoProps {
  profileId: string;
  url: string;
  ordem?: number;
  isAvatar?: boolean;
  createdAt?: Date;
}

export class Photo extends Entity<PhotoProps> {
  private constructor(props: PhotoProps, id?: string) {
    super(props, id);
    this.validate();
  }

  static create(props: PhotoProps, id?: string): Photo {
    return new Photo(
      {
        ...props,
        isAvatar: props.isAvatar ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
  }

  private validate(): void {
    if (!this.props.profileId || this.props.profileId.trim().length === 0) {
      throw new DomainError('O profileId é obrigatório.');
    }

    if (!this.props.url || this.props.url.trim().length === 0) {
      throw new DomainError('A url da foto é obrigatória.');
    }
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get url(): string {
    return this.props.url;
  }

  get ordem(): number | undefined {
    return this.props.ordem;
  }

  get isAvatar(): boolean {
    return this.props.isAvatar ?? false;
  }

  get createdAt(): Date {
    return this.props.createdAt as Date;
  }
}
