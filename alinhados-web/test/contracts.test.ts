import { describe, expect, it } from 'vitest';
import {
  cadastroSchema,
  formatarCnpj,
  formatarCpf,
  loginSchema,
  perfilBarbeiroSchema,
  validarCnpj,
  validarCpf,
  LIMITES,
} from '@/contracts-local';

describe('documentos (CPF/CNPJ)', () => {
  it('aceita CPF válido com e sem máscara', () => {
    expect(validarCpf('529.982.247-25')).toBe(true);
    expect(validarCpf('52998224725')).toBe(true);
  });

  it('rejeita CPF com dígito verificador errado e sequências repetidas', () => {
    expect(validarCpf('529.982.247-26')).toBe(false);
    expect(validarCpf('111.111.111-11')).toBe(false);
    expect(validarCpf('123')).toBe(false);
  });

  it('aceita CNPJ válido e rejeita inválido', () => {
    expect(validarCnpj('11.222.333/0001-81')).toBe(true);
    expect(validarCnpj('11.222.333/0001-80')).toBe(false);
    expect(validarCnpj('00.000.000/0000-00')).toBe(false);
  });

  it('formata CPF e CNPJ progressivamente', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
    expect(formatarCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });
});

describe('cadastroSchema (U01/RF09)', () => {
  const base = {
    email: 'gabriel@alinhados.app',
    senha: 'segredo123',
    confirmarSenha: 'segredo123',
  };

  it('aceita barbeiro com CPF válido', () => {
    const resultado = cadastroSchema.safeParse({
      ...base,
      tipo: 'barbeiro',
      documento: '529.982.247-25',
    });
    expect(resultado.success).toBe(true);
  });

  it('exige CNPJ válido para barbearia', () => {
    const resultado = cadastroSchema.safeParse({
      ...base,
      tipo: 'barbearia',
      documento: '529.982.247-25',
    });
    expect(resultado.success).toBe(false);
  });

  it('rejeita senhas que não conferem', () => {
    const resultado = cadastroSchema.safeParse({
      ...base,
      confirmarSenha: 'outra123',
      tipo: 'barbeiro',
      documento: '529.982.247-25',
    });
    expect(resultado.success).toBe(false);
  });

  it('rejeita senha fraca (sem número ou curta)', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', senha: 'x' }).success).toBe(true);
    expect(
      cadastroSchema.safeParse({
        ...base,
        senha: 'somenteletras',
        confirmarSenha: 'somenteletras',
        tipo: 'barbeiro',
        documento: '529.982.247-25',
      }).success,
    ).toBe(false);
  });
});

describe('perfilBarbeiroSchema (B01/B02)', () => {
  const perfilValido = {
    nome: 'Gabriel Lima',
    bio: 'Especialista em fade.',
    cidade: 'Barreiros',
    estado: 'PE' as const,
    apelido_profissional: '',
    anos_experiencia: 5,
    servicos: ['Degradê', 'Barba'],
    cursos_formacao: [],
    comissao_desejada: 50,
    taxa_ocupacao: 80,
    recorde_meta: '',
    valores: ['Pontualidade'],
    esta_desempregado: false,
  };

  it('aceita um perfil válido', () => {
    expect(perfilBarbeiroSchema.safeParse(perfilValido).success).toBe(true);
  });

  it('trava comissão fora da faixa 40–60 (RF14)', () => {
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, comissao_desejada: 30 }).success).toBe(false);
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, comissao_desejada: 61 }).success).toBe(false);
  });

  it('trava taxa de ocupação fora de 0–100 (RF16)', () => {
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, taxa_ocupacao: 101 }).success).toBe(false);
  });

  it(`limita valores a ${LIMITES.MAX_VALORES} tags (RN07)`, () => {
    const seteValores = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, valores: seteValores }).success).toBe(false);
  });

  it('exige ao menos um serviço', () => {
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, servicos: [] }).success).toBe(false);
  });

  it('rejeita faturamento mensal zerado ("0000"), mas aceita vazio ou positivo', () => {
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, faturamento_mensal: 0 }).success).toBe(false);
    expect(perfilBarbeiroSchema.safeParse({ ...perfilValido, faturamento_mensal: 6000 }).success).toBe(true);
    expect(perfilBarbeiroSchema.safeParse(perfilValido).success).toBe(true);
  });
});
