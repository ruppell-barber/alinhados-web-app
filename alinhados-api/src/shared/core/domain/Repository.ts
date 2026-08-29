import { Entity } from './Entity';

/**
 * Interface genérica para Portas Secundárias (Repositórios).
 * Esta interface garante um contrato padrão para inserção e busca de entidades, 
 * mas pode (e deve) ser estendida por interfaces específicas de cada módulo (ex: IUserRepository)
 * para adicionar métodos exclusivos como `findByEmail`.
 * 
 * @template TEntity O tipo da Entidade de Domínio que o repositório retorna.
 * @template TCreateInput A interface que define quais dados entram para criar a entidade.
 */
export interface IRepository<TCreateInput, TEntity extends Entity<unknown>> {
  create(data: TCreateInput): Promise<TEntity>;
  findById(id: string): Promise<TEntity | null>;
}
