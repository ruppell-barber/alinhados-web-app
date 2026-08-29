import { DomainError } from '../../../../shared/core/domain/DomainError';

function isValidCnpj(value: string): boolean {
  if (!/^\d{14}$/.test(value) || /^(\d)\1{13}$/.test(value)) return false;

  const calculateDigit = (base: string, weights: number[]): number => {
    const sum = weights.reduce(
      (total, weight, index) => total + Number(base[index]) * weight,
      0
    );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(value.slice(0, 12), [
    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);
  const secondDigit = calculateDigit(value.slice(0, 12) + firstDigit, [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  return value.endsWith(`${firstDigit}${secondDigit}`);
}

export class Cnpj {
  private constructor(private readonly value: string) {}

  static create(raw: string): Cnpj {
    const value = raw.replace(/\D/g, '');
    if (!isValidCnpj(value)) {
      throw new DomainError('CNPJ inválido.', {
        kind: 'business',
        code: 'CNPJ_INVALIDO',
      });
    }

    return new Cnpj(value);
  }

  getValue(): string {
    return this.value;
  }
}
