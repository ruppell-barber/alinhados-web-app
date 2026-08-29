import { z } from 'zod';
import { validarCpf, validarCnpj } from './documentos';

/** profiles.user_type — Wiki 1.2 */
export const tipoUsuarioSchema = z.enum(['barbeiro', 'barbearia']);
export type TipoUsuario = z.infer<typeof tipoUsuarioSchema>;

const emailSchema = z
  .string()
  .min(1, 'Informe seu e-mail.')
  .email('E-mail inválido. Confira e tente de novo.');

const senhaSchema = z
  .string()
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .regex(/[A-Za-z]/, 'A senha precisa ter pelo menos uma letra.')
  .regex(/\d/, 'A senha precisa ter pelo menos um número.');

/** U01 / RF09 — cadastro com e-mail, senha, tipo e CPF/CNPJ */
export const cadastroSchema = z
  .object({
    email: emailSchema,
    senha: senhaSchema,
    confirmarSenha: z.string().min(1, 'Confirme sua senha.'),
    tipo: tipoUsuarioSchema,
    documento: z.string().min(1, 'Informe seu documento.'),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  })
  .refine((dados) => (dados.tipo === 'barbeiro' ? validarCpf(dados.documento) : true), {
    message: 'CPF inválido. Confira os números.',
    path: ['documento'],
  })
  .refine((dados) => (dados.tipo === 'barbearia' ? validarCnpj(dados.documento) : true), {
    message: 'CNPJ inválido. Confira os números.',
    path: ['documento'],
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Informe sua senha.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** B10 / RF06 — solicitar recuperação de senha por e-mail */
export const solicitarRecuperacaoSchema = z.object({
  email: emailSchema,
});
export type SolicitarRecuperacaoInput = z.infer<typeof solicitarRecuperacaoSchema>;

/** B10 — definir nova senha a partir do token do link */
export const redefinirSenhaSchema = z
  .object({
    senha: senhaSchema,
    confirmarSenha: z.string().min(1, 'Confirme sua nova senha.'),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;

/** Sessão persistida no cliente (Supabase Auth espelhado — profiles.id = auth.users.id) */
export interface Sessao {
  usuarioId: string;
  email: string;
  tipo: TipoUsuario;
}
