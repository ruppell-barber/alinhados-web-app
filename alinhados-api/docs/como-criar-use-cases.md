# Guia Definitivo: Como Criar Casos de Uso (Use Cases)

Na nossa Arquitetura Hexagonal (Ports & Adapters), a camada de **Application** (onde moram os Casos de Uso) é o coração do sistema. É aqui que as regras de negócio puras são orquestradas.

Para garantir que a base de código do ecossistema Alinhados se mantenha escalável, limpa e padronizada, todos os Casos de Uso da plataforma devem seguir rigorosamente as diretrizes abaixo.

---

## 🛑 Regras de Ouro do Caso de Uso

1. **Agnóstico ao Mundo Externo:** Um Use Case **nunca** deve importar o `express`, o `zod`, ou saber o que é um `req.body` ou `res.status`. Ele lida exclusivamente com TypeScript puro (interfaces).
2. **Interface Genérica `UseCase`:** Toda classe de caso de uso deve implementar uma interface genérica de UseCase (ex: `UseCase<Input, Output>`).
3. **Tipos no Mesmo Arquivo:** As interfaces (ou types) que definem os dados de entrada (`Input`) e saída (`Output`) do caso de uso devem ser declaradas e exportadas **no mesmo arquivo** da classe do caso de uso.
4. **Responsabilidade Única:** O caso de uso deve ter apenas um método público, convencionalmente chamado de `execute()` ou `handle()`.
5. **Inversão de Dependência:** Qualquer acesso a banco de dados ou serviços externos deve ser injetado via construtor (através de interfaces/Ports), nunca instanciado diretamente.

---

## 🛠️ Exemplo Prático de Implementação

Suponha que estejamos no módulo de `identidade` e precisemos criar o caso de uso de "Criação de Usuário".

O arquivo deverá ser salvo na camada de aplicação do módulo, por exemplo:
`src/modules/identidade/application/use-cases/CreateUserUseCase.ts`

```typescript
// 1. As interfaces de Input e Output ficam no TOPO do mesmo arquivo
export interface CreateUserUseCaseInput {
  name: string;
  email: string;
  passwordHash: string; // Nota: O controller/adapter já deve ter feito o hash antes de chamar o UseCase
}

export interface CreateUserUseCaseOutput {
  id: string;
  name: string;
  createdAt: Date;
}

// Interface genérica (normalmente importada do seu src/shared/core/UseCase.ts)
// export interface UseCase<I, O> {
//   execute(input: I): Promise<O>;
// }

// 2. A Classe implementa a interface genérica
export class CreateUserUseCase implements UseCase<CreateUserUseCaseInput, CreateUserUseCaseOutput> {
  
  // 3. Injeção de Dependências pelo Construtor (Ports)
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly notificationService: INotificationService
  ) {}

  // 4. O método único que orquestra a regra de negócio
  async execute(input: CreateUserUseCaseInput): Promise<CreateUserUseCaseOutput> {
    
    // Regra de Negócio: Verifica se e-mail já existe
    const emailAlreadyExists = await this.userRepository.findByEmail(input.email);
    if (emailAlreadyExists) {
      throw new Error('User already exists'); // Utilize suas classes de erro customizadas de domínio
    }

    // Persistência
    const newUser = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: input.passwordHash
    });

    // Eventos de Domínio ou Efeitos Colaterais
    await this.notificationService.sendWelcomeEmail(newUser.email);

    // Retorna exatamente a interface de Output definida no topo
    return {
      id: newUser.id,
      name: newUser.name,
      createdAt: newUser.createdAt
    };
  }
}
```

---

## 🔄 Como isso se conecta com o Controller (Web)?

O Controller (na pasta `adapters/api-web`) é o "escudo" do Caso de Uso. O fluxo acontece assim:

1. A rota HTTP bate no Controller.
2. O Controller pega o `req.body` e usa o seu **Zod Schema (DTO)** para validar se o e-mail tem arroba, se a string é longa o suficiente, etc.
3. Se o Zod aprovar, o Controller adapta (converte) esse DTO no formato da interface `CreateUserUseCaseInput`.
4. O Controller chama `useCase.execute(input)`.
5. O Use Case roda a regra de negócio com segurança total de tipagem e devolve o `CreateUserUseCaseOutput`.
6. O Controller pega o `Output` e devolve um JSON `res.status(201)`.

Seguindo esse fluxo, nós garantimos que nossa aplicação é **100% blindada** contra o framework da web e as bibliotecas de validação!
