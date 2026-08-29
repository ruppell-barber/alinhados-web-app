import { injectable } from 'tsyringe';
import { IEnvService } from './env.service.interface';
import { env, EnvType } from './env';

/**
 * @class EnvService
 * @description Implementação (Adapter) para a interface IEnvService usando os dados validados pelo Zod.
 * 
 * Essa classe pode ser injetada em qualquer parte da aplicação via tsyringe. 
 * Ela consome as variáveis já devidamente carregadas e validadas, retornando-as de forma 
 * tipada de acordo com as chaves cadastradas no `envSchema`.
 *
 * @example
 * // Em um arquivo de registro do tsyringe (container):
 * container.registerSingleton<IEnvService>('IEnvService', EnvService);
 * 
 * // No construtor de um serviço consumindo-a:
 * const porta = this.envService.get('PORT'); // Retorna o valor de PORT (number)
 */
@injectable()
export class EnvService implements IEnvService {
  get<T extends keyof EnvType>(key: T): EnvType[T] {
    return env[key];
  }
}
