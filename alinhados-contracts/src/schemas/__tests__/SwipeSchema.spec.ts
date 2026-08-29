import { describe, it, expect } from 'vitest';
import { RegistrarSwipeSchema } from '../SwipeSchema';

describe('RegistrarSwipeSchema (DTO Validation)', () => {
  it('should validate a correct like payload', () => {
    const payload = {
      swipedId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      direction: 'like',
    };

    const result = RegistrarSwipeSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should validate a correct dislike payload', () => {
    const payload = {
      swipedId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      direction: 'dislike',
    };

    const result = RegistrarSwipeSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should fail if swipedId is not a valid uuid', () => {
    const payload = {
      swipedId: 'not-a-uuid',
      direction: 'like',
    };

    const result = RegistrarSwipeSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should fail if direction is outside the enum', () => {
    const payload = {
      swipedId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      direction: 'superlike',
    };

    const result = RegistrarSwipeSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
