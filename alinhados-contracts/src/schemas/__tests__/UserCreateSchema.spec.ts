import { describe, it, expect } from 'vitest';
import { UserCreateSchema } from '../UserCreateSchema';

describe('UserCreateSchema (DTO Validation)', () => {
  it('should validate a correct user creation payload', () => {
    const payload = {
      name: 'João da Silva',
      email: 'joao@teste.com',
      password: 'mypassword123',
    };

    const result = UserCreateSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should fail if email is invalid', () => {
    const payload = {
      name: 'João',
      email: 'invalid-email',
      password: 'mypassword123',
    };

    const result = UserCreateSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should fail if password is too short', () => {
    const payload = {
      name: 'João',
      email: 'joao@teste.com',
      password: '123', // less than 8 chars
    };

    const result = UserCreateSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
