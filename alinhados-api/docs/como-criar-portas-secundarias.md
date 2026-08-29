# Guia: Como Criar Portas Secundárias (Driven Ports)

Na Arquitetura Hexagonal, as **Portas Secundárias** são as interfaces (contratos) que a camada de Aplicação cria para poder se comunicar com o mundo externo (Bancos de Dados, APIs de terceiros, Mensageria), mas **sem depender** da tecnologia escolhida (ex: Prisma, Axios, RabbitMQ).

Isso garante a **Inversão de Dependência**: o Use Case dita como ele quer receber os dados, e a camada de infraestrutura (Adapters) "se vira" para implementar essa interface.

---

## 🛠️ A Interface Base

Todo repositório deve tentar seguir o padrão mínimo implementando a interface base `IRepository` definida em `src/shared/core/Repository.ts`.

```typescript
// src/shared/core/Repository.ts
export interface IRepository<TEntity extends DomainEntity, TCreateInput> {
  create(data: TCreateInput): Promise<TEntity>;
  findById(id: string): Promise<TEntity | null>;
}
```

---

## 🏗️ Como Criar a Porta Secundária do seu Módulo

Suponha que estamos no módulo de **Identidade** e precisamos de um repositório para o Usuário.
O arquivo deve ser criado na camada de **Aplicação** ou **Domínio** (geralmente em `src/modules/{modulo}/application/ports/IUserRepository.ts`).

### Exemplo de Código:

```typescript
import { IRepository } from '../../../../shared/core/Repository';
import { UserEntity } from '../../domain/entities/UserEntity';

// 1. Defina um Type local se o seu Use Case precisar enviar dados complexos para a inserção
export type CreateUserRepositoryInput = {
  name: string;
  email: string;
  passwordHash: string;
}

// 2. Crie a sua Porta Secundária estendendo o IRepository genérico
export interface IUserRepository extends IRepository<UserEntity, CreateUserRepositoryInput> {
  
  // 3. Adicione métodos exclusivos do seu módulo que não existem na interface base!
  findByEmail(email: string): Promise<UserEntity | null>;
  
}
```

---

## 🚀 Implementando a Porta (Driven Adapter)

Com a porta secundária criada, o **Use Case só irá interagir com a interface `IUserRepository`**. 

Quem realmente executará as queries SQL ou acessará o banco será o **Driven Adapter** (ex: o Prisma), que fica na camada mais externa da sua arquitetura: `src/modules/identidade/adapters/database/PrismaUserRepository.ts`.

A classe do Adapter terá a responsabilidade de obedecer religiosamente à interface definida no Core e de mapear/converter a resposta do banco de dados para a `UserEntity`!
