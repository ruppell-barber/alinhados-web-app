import { v4 as uuidv4 } from 'uuid';

/**
 * Classe base genérica para representar uma Entidade de Domínio (DDD).
 * Entidades são objetos que possuem uma identidade única (_id) e guardam as regras de negócio mais puras do sistema.
 * Ao utilizar um objeto 'props' genérico, encapsulamos os dados da entidade e evitamos mutações arbitrárias.
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  public readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id ?? uuidv4();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  /**
   * Compara se duas entidades são a mesma com base no seu ID único.
   */
  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id === object._id;
  }
}
