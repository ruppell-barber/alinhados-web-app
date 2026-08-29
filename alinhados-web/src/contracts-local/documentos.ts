/**
 * Validação de CPF/CNPJ por dígitos verificadores.
 * RNF03: o CNPJ nunca é exibido em tela — trafega apenas no cadastro e é
 * armazenado criptografado (cnpj_hash) pelo backend.
 */

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function digitoVerificador(digitos: number[], pesos: number[]): number {
  const soma = digitos.reduce((acc, digito, i) => acc + digito * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCpf(cpf: string): boolean {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const nums = d.split('').map(Number);
  const dv1 = digitoVerificador(nums.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = digitoVerificador(nums.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === nums[9] && dv2 === nums[10];
}

export function validarCnpj(cnpj: string): boolean {
  const d = somenteDigitos(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const nums = d.split('').map(Number);
  const dv1 = digitoVerificador(nums.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = digitoVerificador(nums.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === nums[12] && dv2 === nums[13];
}

export function formatarCpf(cpf: string): string {
  const d = somenteDigitos(cpf).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatarCnpj(cnpj: string): string {
  const d = somenteDigitos(cnpj).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
