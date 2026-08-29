/**
 * @file env.ts
 * @description Define o schema de validação (Zod) e extrai as variáveis de ambiente com type-safety.
 * 
 * Este arquivo é responsável por carregar o `.env` e garantir que a aplicação 
 * não inicie caso variáveis obrigatórias estejam faltando ou em formato incorreto.
 *
 * @example
 * import { env } from './env';
 * console.log(env.PORT); // O TypeScript sabe que PORT é um 'number'.
 */
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  RABBITMQ_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DOCUMENTO_ENCRYPTION_KEY: z.string().length(64),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Encontramos problemas nas variáveis de ambiente.\n');

  const fieldErrors = _env.error.flatten().fieldErrors;
  const missingOrInvalid = Object.keys(fieldErrors);

  console.error('🚨 Variáveis faltando ou incorretas:');
  missingOrInvalid.forEach((key) => {
    const k = key as keyof typeof fieldErrors;
    console.error(`  👉 ${key}: ${fieldErrors[k]?.join(', ')}`);
  });

  console.error('\n✅ Variáveis injetadas com sucesso:');
  const allKeys = Object.keys(envSchema.shape);
  const injectedKeys = allKeys.filter((key) => !missingOrInvalid.includes(key));

  injectedKeys.forEach((key) => {
    console.error(`  ✔️  ${key}`);
  });

  console.error('\n🛑 O servidor será desligado para evitar comportamentos inesperados.\n');
  process.exit(1);
}

export const env = _env.data;
export type EnvType = z.infer<typeof envSchema>;
