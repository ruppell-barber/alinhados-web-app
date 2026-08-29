import { DomainError } from '../../../../shared/core/domain/DomainError';

function isValidCpf(value: string): boolean {
  if (!/^\d{11}$/.test(value) || /^(\d)\1{10}$/.test(value)) return false;

  const calculateDigit = (base: string, firstWeight: number): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
      sum += Number(base[i]) * (firstWeight - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(value.slice(0, 9), 10);
  const secondDigit = calculateDigit(value.slice(0, 10), 11);

  return value.endsWith(`${firstDigit}${secondDigit}`);
}

export class Cpf {
  private constructor(private readonly value: string) {}

  static create(raw: string): Cpf {
    const value = raw.replace(/\D/g, '');
    if (!isValidCpf(value)) {
      throw new DomainError('CPF inválido.', {
        kind: 'business',
        code: 'CPF_INVALIDO',
      });
    }

    return new Cpf(value);
  }

  getValue(): string {
    return this.value;
  }
}
