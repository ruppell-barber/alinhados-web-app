# 📘 Guia de Desenvolvimento: Feature de Ponta a Ponta

Este documento descreve o fluxo de trabalho arquitetural (Arquitetura Hexagonal / Ports and Adapters) e o uso das ferramentas nativas do `shared/core` no ecossistema Alinhados. 

Ao criar uma nova funcionalidade (feature), você deve respeitar a regra de dependência: **o domínio (Use Cases e Entidades) nunca depende de detalhes externos (Banco de dados, Framework Web, Contratos HTTP). Os detalhes externos dependem do domínio.**

---

## 🏗️ Passo 1: O Contrato Público (Repositório `alinhados-contracts`)

Antes de escrever o backend, definimos **o que** entra e **o que** sai. Os DTOs e validações da sua feature devem ser criados no repositório independente de contratos.

**Local:** `alinhados-contracts/src/schemas/SuaFeatureSchema.ts`

```typescript
import { z } from 'zod';
import { registry } from '../registry/openApi';

// 1. Defina o schema Zod e registre no Swagger
export const CreatePerfilSchema = registry.register(
  'CreatePerfilSchema',
  z.object({
    nickname: z.string().min(3),
    bio: z.string().optional(),
  })
);

// 2. Exporte a tipagem (DTO)
export type CreatePerfilDto = z.infer<typeof CreatePerfilSchema>;
```

---

## 🏛️ Passo 2: A Entidade de Domínio (Core)

A entidade é o coração do seu sistema. Ela encapsula regras de negócio puras e estende a classe base genérica `Entity<Props>` do pacote shared.

> [!NOTE]
> **Por que usar o objeto genérico "Props"?**
> Ao definirmos uma interface de Props (ex: `PerfilProps`), a classe base `Entity<T>` encapsula todos os dados internamente no objeto `this.props`. 
> Isso impede que dados vitais sejam alterados de qualquer lugar. Se você quiser permitir que um nickname seja alterado de fora da classe, você cria um getter (`get nickname()`) ou um método de negócio específico (ex: `updateNickname(newName)`). Assim o ciclo de vida e a identidade (`_id`) ficam totalmente protegidos pela base.

**Local:** `alinhados-api/src/modules/perfil/application/entities/Perfil.ts`

```typescript
import { Entity } from '../../../../shared/core/domain/Entity';
import { DomainError } from '../../../../shared/core/domain/DomainError';

export interface PerfilProps {
  nickname: string;
  bio?: string;
  createdAt?: Date;
}

export class Perfil extends Entity<PerfilProps> {
  private constructor(props: PerfilProps, id?: string) {
    super(props, id);
  }

  public static create(props: PerfilProps, id?: string): Perfil {
    // Regras de negócio da Entidade
    if (props.nickname.length < 3) {
      throw new DomainError('O nickname deve ter no mínimo 3 caracteres.');
    }

    return new Perfil({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);
  }

  get nickname() {
    return this.props.nickname;
  }
}
```

---

## 🚪 Passo 3: A Porta do Repositório (Interface)

No domínio da API, precisamos definir como o caso de uso persistirá os dados, sem saber se é Prisma, SQL ou memória.

**Local:** `alinhados-api/src/modules/perfil/application/ports/IPerfilRepository.ts`

```typescript
import { Perfil } from '../entities/Perfil';

export interface IPerfilRepository {
  save(perfil: Perfil): Promise<void>;
  findByNickname(nickname: string): Promise<Perfil | null>;
}
```

---

## ⚙️ Passo 4: O Caso de Uso (Application)

O Caso de Uso orquestra as entidades e a porta do repositório. 

**Local:** `alinhados-api/src/modules/perfil/application/use-cases/CreatePerfilUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IPerfilRepository } from '../ports/IPerfilRepository';
import { Perfil } from '../entities/Perfil';
import { DomainError } from '../../../../shared/core/domain/DomainError';
import { UseCase } from '../../../../shared/core/domain/UseCase';

export interface CreatePerfilInput { 
  nickname: string; 
  bio?: string; 
}

export interface CreatePerfilOutput {
  perfil: Perfil;
}

@injectable()
export class CreatePerfilUseCase implements UseCase<CreatePerfilInput, CreatePerfilOutput> {
  constructor(
    @inject('IPerfilRepository')
    private readonly perfilRepository: IPerfilRepository
  ) {}

  async execute(data: CreatePerfilInput): Promise<CreatePerfilOutput> {
    const exists = await this.perfilRepository.findByNickname(data.nickname);
    if (exists) {
      throw new DomainError('Nickname já está em uso.');
    }

    // Passa pela fábrica da entidade (que valida as regras de negócio de domínio)
    const perfil = Perfil.create(data);

    await this.perfilRepository.save(perfil);

    return { perfil };
  }
}
```

---

## 🗄️ Passo 5: O Adapter de Banco (Repository Implementation)

Aqui implementamos a porta conectando as Entidades ao ORM.

**Local:** `alinhados-api/src/modules/perfil/adapters/database/PrismaPerfilRepository.ts`

```typescript
import { injectable } from 'tsyringe';
import { IPerfilRepository } from '../../application/ports/IPerfilRepository';
import { Perfil } from '../../application/entities/Perfil';
// Exemplo de prisma import
// import { prisma } from '../../../../shared/infra/database/prisma';

@injectable()
export class PrismaPerfilRepository implements IPerfilRepository {
  async findByNickname(nickname: string): Promise<Perfil | null> {
    // const model = await prisma.perfil.findUnique({ where: { nickname } });
    // if (!model) return null;
    // return Perfil.create(model, model.id);
    return null; // stub
  }

  async save(perfil: Perfil): Promise<void> {
    // await prisma.perfil.create({
    //   data: { id: perfil._id, nickname: perfil.nickname, bio: perfil.props.bio }
    // });
  }
}
```

---

## 🌐 Passo 6: O Adapter Web (Controller)

O Controller é a borda externa da nossa API. Ele recebe o Request, usa o schema do contrato, invoca o caso de uso e responde utilizando a classe padronizada `AppResponse`.

**Local:** `alinhados-api/src/modules/perfil/adapters/api-web/controller/PerfilController.ts`

```typescript
import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
// IMPORTANTE: Importamos o SCHEMA (para runtime) e o DTO (para tipagem) do nosso repositório externo!
import { CreatePerfilSchema, CreatePerfilDto } from '@alinhados/contracts';
import { AppResponse } from '../../../../../shared/infra/http/AppResponse';
import { CreatePerfilUseCase } from '../../../application/use-cases/CreatePerfilUseCase';

@injectable()
export class PerfilController {
  constructor(
    private readonly createPerfilUseCase: CreatePerfilUseCase
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    // 1. Validação na fronteira:
    // Usamos o Zod Schema em RUNTIME para validar o req.body. 
    // O resultado disso é um objeto 100% tipado com a interface do nosso DTO.
    const dto: CreatePerfilDto = CreatePerfilSchema.parse(req.body);

    // 2. Execução da regra de negócio (passando o DTO validado)
    const result = await this.createPerfilUseCase.execute(dto);
    const perfil = result.perfil;

    // 3. Retorno padronizado usando a factory AppResponse
    return AppResponse.created(res, { id: perfil.id, nickname: perfil.nickname }, 'Perfil criado com sucesso!');
  }
}
```

---

## 🚀 Passo 7: Amarração das Dependências (Rotas e IoC)

Como nossa arquitetura depende fortemente da Inversão de Dependências, utilizamos o `TSyringe` para cuidar da instanciação de nossas classes. Assim, você não precisa fazer a "dança do new" manualmente no seu arquivo de rotas.

**Local:** `alinhados-api/src/shared/container/index.ts`
*(Esse arquivo já está sendo importado automaticamente pelo `main.ts` no momento que o servidor liga!)*

```typescript
import { container } from 'tsyringe';

import { IPerfilRepository } from '../../modules/perfil/application/ports/IPerfilRepository';
import { PrismaPerfilRepository } from '../../modules/perfil/adapters/database/PrismaPerfilRepository';

container.registerSingleton<IPerfilRepository>(
  'IPerfilRepository',
  PrismaPerfilRepository
);
```

> [!TIP]
> **Por que não registramos o Controller e o UseCase no Container?**
> O TSyringe é inteligente! Você só precisa registrar explicitamente no `container.registerSingleton` as **Interfaces (Ports)** que apontam para uma **Implementação (Adapter)**.
> Classes concretas, como `CreatePerfilUseCase` e `PerfilController`, são resolvidas **automaticamente** pelo `container.resolve()`, desde que estejam anotadas com `@injectable()`.

**Local das Rotas:** `alinhados-api/src/modules/perfil/adapters/api-web/routes/perfil.routes.ts`

Nas rotas, você apenas resolve a classe do Controller e deixa a mágica do IoC acontecer. As dependências descerão em cascata (O Controller pedirá o UseCase, que por sua vez pedirá o Repository).

```typescript
import { Router } from 'express';
import { container } from 'tsyringe';
import { PerfilController } from '../controller/PerfilController';

const perfilRoutes = Router();

// 1. Resolver o Controller via Container TSyringe
const controller = container.resolve(PerfilController);

// 2. Mapear a rota HTTP (Usando bind ou arrow function para preservar o contexto do 'this')
perfilRoutes.post('/', (req, res) => controller.create(req, res));

export { perfilRoutes };
```

---

## 🤔 O Paradoxo da Repetição (DTO vs Input vs Props)

Uma dúvida extremamente comum na Arquitetura Hexagonal é: *"Eu tenho um DTO no Controller, um Input no UseCase e um Props na Entity. Todos eles têm os mesmos campos. Não estou reescrevendo código à toa?"*

A resposta é **Sim, você corre o risco de reescrever código, mas isso é proposital.**

Na arquitetura pura, o lema é: **"Nós preferimos a duplicação ao acoplamento"**. 
O motivo para termos 3 objetos muito parecidos é o isolamento rígido das camadas:

1. **O DTO (Contrato Web):** Representa exatamente o formato que a API recebe. Fica no limite do sistema (Controllers e Repositório de Contratos).
2. **O Input do UseCase:** Representa os dados que a sua regra de negócio pura precisa para funcionar. O UseCase não deve saber que existe HTTP no mundo; ele deve poder ser executado até por uma rotina no terminal.
3. **A Interface Props (Entity):** Representa o estado interno real do domínio em memória. A Entity tem campos que o usuário não envia via DTO (ex: `createdAt`, gerado internamente) e regras de validação exclusivas.

## 📚 Documentação com Swagger (OpenAPI)

Na nossa arquitetura, a documentação dos endpoints e dos contratos (DTOs) é gerada automaticamente através do pacote `@asteasolutions/zod-to-openapi` e deve ficar **exclusivamente no repositório de contratos (`alinhados-contracts`)**.

### Como documentar um Endpoint

Toda vez que você criar um novo caso de uso que expõe um endpoint na API, a documentação dele deve ser feita estritamente no repositório de contratos (`alinhados-contracts`). Siga os passos:

1. **Crie o arquivo do Schema e registre o DTO e a Rota:**
Crie o arquivo dentro da pasta `src/schemas/` no pacote de contratos (ex: `alinhados-contracts/src/schemas/CreatePerfilSchema.ts`).

```typescript
import { z } from 'zod';
import { registry } from '../registry/openApi';

// A. Registre o Schema (DTO)
export const CreatePerfilSchema = registry.register(
  'CreatePerfilSchema',
  z.object({
    nickname: z.string().min(3),
    bio: z.string().optional(),
  })
);

export type CreatePerfilDto = z.infer<typeof CreatePerfilSchema>;

// B. Registre a Rota vinculando o Schema
registry.registerPath({
  method: 'post',
  path: '/perfil',
  description: 'Cria um novo perfil de usuário',
  tags: ['Perfil'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePerfilSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Perfil criado com sucesso'
    }
  }
});
```

2. **Exporte o arquivo para que a API enxergue:**
Para que o Swagger na API consiga compilar tudo automaticamente e os Controllers possam importar a tipagem, adicione a exportação no arquivo `alinhados-contracts/src/index.ts`:

```typescript
export * from './schemas/CreatePerfilSchema';
```

Ao colocar as rotas e os schemas no repositório compartilhado, garantimos que a documentação (Swagger), os contratos de front-end e as rotas de back-end sejam **uma única fonte de verdade**.

> [!IMPORTANT]
> **No ecossistema Alinhados, optamos por preservar a pureza.**
> Embora seja possível reaproveitar o DTO diretamente no UseCase para ganhar velocidade (o que é feito em arquiteturas MVC mais simples), nós escolhemos manter as interfaces separadas. Isso garante que, se a API Web mudar seus formatos de Request no futuro, o Core do seu sistema continuará ileso e intocado.
