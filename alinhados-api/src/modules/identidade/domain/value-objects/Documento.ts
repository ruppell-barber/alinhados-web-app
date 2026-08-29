import { DomainError } from '../../../../shared/core/domain/DomainError';

function isValidCPF(value: string): boolean {
  if (/^(\d)\1{10}$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(value[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check >= 10) check = 0;
  if (check !== parseInt(value[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(value[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check >= 10) check = 0;
  return check === parseInt(value[10]);
}

function isValidCNPJ(value: string): boolean {
  if (/^(\d)\1{13}$/.test(value)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = w1.reduce((acc, w, i) => acc + parseInt(value[i]) * w, 0);
  let check = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (check !== parseInt(value[12])) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = w2.reduce((acc, w, i) => acc + parseInt(value[i]) * w, 0);
  check = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return check === parseInt(value[13]);
}

export class Documento {
  private constructor(private readonly value: string) {}

  static create(userType: 'barbeiro' | 'barbearia', raw: string): Documento {
    if (userType === 'barbeiro') {
      if (raw.length !== 11 || !isValidCPF(raw)) throw new DomainError('CPF inválido.');
    } else {
      if (raw.length !== 14 || !isValidCNPJ(raw)) throw new DomainError('CNPJ inválido.');
    }
    return new Documento(raw);
  }

  getValue(): string {
    return this.value;
  }
}
