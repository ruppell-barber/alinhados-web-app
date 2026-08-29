import { EnvType } from './env';

/**
 * @interface IEnvService
 * @description Interface da porta para o serviço de injeção de variáveis de ambiente.
 * 
 * Segue o princípio de inversão de dependência (Arquitetura Hexagonal), 
 * permitindo que os casos de uso consumam variáveis de ambiente de forma isolada e testável, 
 * sem depender diretamente do `process.env`.
 * 
 * @example
 * constructor(
 *   @inject('IEnvService') private envService: IEnvService
 * ) {}
 * 
 * const porta = this.envService.get('PORT');
 */
export interface IEnvService {
  get<T extends keyof EnvType>(key: T): EnvType[T];
}
