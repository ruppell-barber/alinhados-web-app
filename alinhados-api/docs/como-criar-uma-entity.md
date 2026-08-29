# Guia: Como Criar Entidades de Domínio (Entities)

O coração absoluto do seu software na Arquitetura Hexagonal e no DDD (Domain-Driven Design) são as **Entidades**. Elas não dependem de **NADA** do mundo externo (nem frameworks, nem bibliotecas, nem HTTP, nem SQL).

São classes puras de TypeScript que abrigam os dados e as regras de negócio intrínsecas ao objeto.

---

## 🛡️ A Interface Base `DomainEntity`

Para mantermos a padronização, toda Entidade do ecossistema Alinhados deve estender ou implementar a interface base definida em `src/shared/core/Entity.ts`. 
Isso garante que todas as entidades tenham identidade (`id`) e rastreio de tempo (`createdAt`, `updatedAt`).

```typescript
// src/shared/core/Entity.ts
export interface DomainEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛠️ Exemplo Prático de Criação

Você deve criar as entidades na camada de domínio do seu módulo (ex: `src/modules/{modulo}/domain/entities/UserEntity.ts`).

### Exemplo em Código:

```typescript
import { DomainEntity } from '../../../../shared/core/Entity';
import { v4 as uuidv4 } from 'uuid'; // Única dependência permitida (opcional)

// Propriedades específicas da sua entidade
export interface UserProps {
  name: string;
  email: string;
  passwordHash: string;
}

export class UserEntity implements DomainEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public props: UserProps;

  // O construtor permite montar a entidade caso ela já venha do Banco,
  // ou criar uma do zero gerando um ID novo.
  constructor(props: UserProps, id?: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id ?? uuidv4();
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
    this.props = props;
    
    this.validate(); // Regras de domínio rodam na construção
  }

  // Comportamentos e Regras de Negócio Puras da Entidade
  private validate() {
    if (!this.props.email.includes('@')) {
      throw new Error('E-mail de domínio inválido.');
    }
  }

  // Métodos que alteram o estado da entidade mantendo o encapsulamento
  public changeName(newName: string) {
    if (newName.length < 3) throw new Error('Nome muito curto');
    this.props.name = newName;
  }
}
```

---

## 🚫 O que uma Entidade NÃO é

- **Uma entidade não é uma Tabela do Banco:** Não misture o Model do Prisma (ou ORM) com a sua `UserEntity`. O Adapter do banco deve pegar o JSON retornado do Prisma e dar um "new UserEntity()" para enviá-lo ao Use Case.
- **Uma entidade não é um DTO:** Um DTO de requisição (Zod Schema) não tem comportamentos, só transfere dados de uma camada para a outra. A Entidade carrega as regras de negócio e validações brutas.
