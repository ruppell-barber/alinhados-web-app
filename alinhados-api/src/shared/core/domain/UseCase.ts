/**
 * Contrato base para todos os Casos de Uso (Regras de Negócio) da aplicação.
 * Cada Caso de Uso deve ter um único método `execute`, recebendo um DTO de entrada `I`
 * e retornando uma Promise de saída `O`.
 * 
 * @example
 * class CriarBarbeariaUseCase implements UseCase<CriarBarbeariaInput, BarbeariaOutput> {
 *   async execute(input: CriarBarbeariaInput): Promise<BarbeariaOutput> { ... }
 * }
 */
export interface UseCase<I, O> {
  execute(input: I): Promise<O>;
}
