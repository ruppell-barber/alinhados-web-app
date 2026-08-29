/**
 * @file index.ts
 * @description Ponto de exportação central (Barrel Export) do módulo de variáveis de ambiente.
 * 
 * Agrupa todas as exportações relevantes, facilitando a importação em outros locais da aplicação.
 *
 * @example
 * import { IEnvService, EnvService, env } from '../../shared/infra/services/env';
 */
export * from './env';
export * from './env.service.interface';
export * from './env.service';
