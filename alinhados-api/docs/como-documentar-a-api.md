# Guia Definitivo: Como Documentar a API (Zod + OpenAPI + Contracts)

## 🏗️ 0. Configurando o Ambiente (Para Novos Desenvolvedores)

Como os Schemas da API foram isolados num repositório separado (`alinhados-contracts`) para serem reaproveitados pelo Frontend, você **precisa** baixar esse repositório na sua máquina antes de rodar a API, ou o `npm install` da API vai quebrar!

### Passo a passo (Setup Inicial):
1. Crie uma pasta raiz na sua máquina chamada `alinhados` (se já não tiver).
2. Clone a API: `git clone <url-do-repo-da-api> alinhados-api`
3. Clone os Contratos **ao lado da API**: `git clone <url-do-repo-dos-contratos> alinhados-contracts`
4. Sua estrutura de pastas deve ficar exatamente assim:
   ```text
   📁 alinhados/
   ├── 📁 alinhados-api/
   └── 📁 alinhados-contracts/
   ```
5. Entre na pasta da API (`cd alinhados-api`) e rode `npm install`. 
   *(O NPM vai criar um atalho automático que puxa os arquivos locais da pasta vizinha `alinhados-contracts` usando a instrução `file:../alinhados-contracts` no package.json).*

### Atualizando os Contratos no dia a dia:
Sempre que outro desenvolvedor criar um Schema novo no repositório de contratos, você vai precisar puxar as atualizações e **recompilar** o pacote:
```bash
cd ../alinhados-contracts
git pull origin develop
npm run build
cd ../alinhados-api
```
*(Você não precisa rodar `npm install` de novo na API, pois o NPM já criou um atalho dinâmico, mas **toda vez que um dev mudar os contratos será necessário rodar o build** no repositório de contratos para que a API enxergue as mudanças).*

---

## 🏗️ 1. Onde os arquivos de Schemas devem ficar?

Nós utilizamos a arquitetura de **Shared Kernel / Contracts Repo**. Isso significa que todos os DTOs que validam requisições HTTP e as tipagens de resposta **NÃO** ficam dentro da API. 

Eles devem ser criados no projeto independente: `alinhados-contracts`.

A estrutura padrão no ecossistema é:

```text
alinhados-contracts/
└── src/
    ├── registry/
    │   └── openApi.ts                <-- O Singleton do Swagger
    └── schemas/
        ├── {NomeDaFeature}Schema.ts  <-- O Validador Zod / Documentação
        └── index.ts                  <-- Onde você deve EXPORTAR o seu schema!
```

---

## 🛠️ 2. Criando um DTO (Zod + OpenAPI) no Contracts

Dentro da pasta `alinhados-contracts/src/schemas`, crie o arquivo do Schema e use o `registry` para registrar o modelo na documentação. Lembre-se de adicionar a função `.openapi()` em cada propriedade para que a interface gráfica fique rica em exemplos.

**Exemplo (`UserCreateSchema.ts`):**

```typescript
import { z } from 'zod';
import { registry } from '../registry/openApi';

// 1. O Validador e Documentação
export const UserCreateSchema = registry.register(
  'UserCreateRequest', // Nome que aparecerá no Swagger
  z.object({
    name: z.string().min(3).openapi({
      example: 'João da Silva',
      description: 'Nome completo',
    }),
    email: z.string().email().openapi({
      example: 'joao@barbearia.com',
      description: 'E-mail corporativo',
    }),
  })
);

// 2. O DTO Tipado para uso nos Casos de Uso (Application)
export type UserCreateDto = z.infer<typeof UserCreateSchema>;
```

⚠️ **Atenção:** Logo após criar o arquivo, vá no arquivo `alinhados-contracts/src/index.ts` e exporte ele: `export * from './schemas/UserCreateSchema';`.

---

## 🚀 3. Consumindo os Contratos na API e no Frontend

Com o Schema exportado, a mágica do monorepo de contratos acontece!

### No Backend (`alinhados-api`)
No seu Controller, você não precisa saber de onde o schema veio, apenas o importa direto do pacote. O Zod cuidará de validar o payload e de inferir o tipo para que você repasse os dados de forma 100% segura para o seu Use Case.

Veja um exemplo de uma classe Controller completa:

```typescript
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { UserCreateSchema, UserCreateDto } from '@alinhados/contracts';
import { AppResponse } from '../../../../shared/infra/http/AppResponse';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';

@injectable()
export class CreateUserController {
  constructor(
    @inject('CreateUserUseCase') 
    private createUserUseCase: CreateUserUseCase
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // 1. Validação Bruta via Contratos (Zod)
      // Se o req.body estiver errado, o Zod lança um erro que é capturado
      // pelo catch e enviado para o globalErrorHandler (retornando HTTP 400)!
      const payload: UserCreateDto = UserCreateSchema.parse(req.body);

      // 2. Execução da Regra de Negócio (Use Case)
      // Note que o 'payload' já está perfeitamente tipado graças ao Contracts!
      const result = await this.createUserUseCase.execute(payload);

      // 3. Resposta de Sucesso
      return AppResponse.created(res, result, 'Usuário criado com sucesso!');
    } catch (error) {
      // Repassa o erro (Zod, DomainError ou AppError) para o middleware global lidar
      next(error);
    }
  }
}
```

### No Frontend (`alinhados-web`)
O Frontend (ex: React, Vite) vai importar **exatamente o mesmo pacote** para validar um formulário no navegador ou para tipar a resposta do `axios`! Nenhuma linha de código precisa ser reescrita:

```typescript
import { UserCreateSchema } from '@alinhados/contracts';

// Passa pro React Hook Form ou pro resolver do Zod no Frontend!
```

---

## 🌐 4. Documentando a Rota (Endpoint)

Para garantirmos que a documentação seja nossa única fonte de verdade e seja facilmente compartilhada com o Frontend, **a definição dos endpoints também deve ser feita exclusivamente no repositório de contratos (`alinhados-contracts`)**.

No mesmo arquivo onde você declara o seu schema (`alinhados-contracts/src/schemas/UserCreateSchema.ts`), você deve usar o `registry.registerPath` para mapear a rota correspondente.

```typescript
import { z } from 'zod';
import { registry } from '../registry/openApi';

export const UserCreateSchema = registry.register(
  'UserCreateRequest',
  z.object({
    name: z.string().min(3),
    email: z.string().email(),
  })
);

export type UserCreateDto = z.infer<typeof UserCreateSchema>;

// REGISTRANDO A ROTA NO SWAGGER (Dentro do repositório de contratos)
registry.registerPath({
  method: 'post',
  path: '/users',
  summary: 'Criar Usuário',
  description: 'Endpoint para criação de clientes na plataforma',
  tags: ['Usuários'], // Agrupa rotas no Swagger
  request: {
    body: {
      content: {
        'application/json': { schema: UserCreateSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuário cadastrado com sucesso'
    },
    400: { description: 'Erro de validação nos campos' }
  },
});
```

Não se esqueça de que o arquivo deve estar exportado no `index.ts` de `alinhados-contracts`. 
Na API (`alinhados-api`), você apenas declara a rota real do Express (`app.post('/users', ...)`), sem se preocupar em documentar nada, pois o Swagger puxará a documentação direto do pacote de contratos!
```

---

## 🖥️ 5. Visualizando a Mágica

Pronto! Tudo que você codificou já virou documentação. 

Para visualizar, rode o servidor na pasta da API:
```bash
npm run dev
```

E acesse em seu navegador:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

A página do **Swagger UI** gerada automaticamente listará seu Endpoint novo sob a tag "Usuários", com o botão "Try it out" pronto para ser testado e validado pelos schemas que vivem no pacote central de contratos!
