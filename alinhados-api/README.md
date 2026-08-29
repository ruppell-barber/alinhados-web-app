<div align="center">
  <img src="./docs/logo.png" alt="Alinhados API Logo" width="200"/>
  <h1>💈 Alinhados API</h1>
  <p><strong>A inteligência por trás do ecossistema Alinhados</strong></p>
</div>

<br/>

## 📖 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura e Módulos](#-arquitetura-e-módulos)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
  - [Rodando tudo via Docker (API incluída)](#rodando-tudo-via-docker-api-incluída)
  - [Testes e verificação](#-testes-e-verificação)
- [Governança e CI/CD](#-governança-e-cicd)
- [Autores](#-autores)

---

## 🚀 Sobre o Projeto
O **Alinhados API** é o backend projetado para suportar o ecossistema da plataforma Alinhados (Web e Mobile). Ele atua como o cérebro central gerenciando as identidades, perfis de barbearias, geolocalização (discovery), agendamentos (matching), chat em tempo real e notificações.

Foi concebido rigorosamente como um Monolito Modular, seguindo os princípios da **Arquitetura Hexagonal (Ports & Adapters)** e **Domain-Driven Design (DDD)** para garantir alta testabilidade, baixo acoplamento e flexibilidade para uma eventual evolução para microsserviços no futuro.

---

## 🧩 Arquitetura e Módulos
O código está estruturado em módulos totalmente isolados, protegidos por fronteiras claras através do uso de portas condutoras (Casos de Uso) e portas dirigidas (Repositórios/Adaptadores):

- **`identidade/`**: Autenticação, autorização, gestão de sessões e perfis de acesso.
- **`perfil/`**: Gerenciamento de dados de barbearias e clientes (fotos, descrição, avaliações).
- **`discovery/`**: Motor de busca geoespacial e recomendação.
- **`matching/`**: Lógica de agendamento, aceitação e gestão de filas de espera.
- **`notificacoes/`**: Mensageria em tempo real, push notifications e e-mails.

---

## 🛠 Tecnologias Utilizadas
- **Runtime:** Node.js v20+
- **Linguagem:** TypeScript
- **Framework:** Express
- **Banco de Dados:** PostgreSQL (Relacional)
- **Mensageria:** RabbitMQ
- **ORM:** Prisma
- **Injeção de Dependências:** `tsyringe`
- **Qualidade de Código:** ESLint, Prettier e Lefthook (Git Hooks)
- **CI/CD:** GitHub Actions & Docker Multi-stage

---

## ⚙️ Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas na sua máquina antes de começar:
- [Node.js (v20+)](https://nodejs.org/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

> ⚠️ **Importante:** a API depende do pacote `@alinhados/contracts` como um repositório **irmão local** (`file:../alinhados-contracts`), não como um pacote publicado no NPM. Isso significa que a pasta `alinhados-contracts` precisa existir **no mesmo diretório pai** que `alinhados-api`, já compilada, antes de instalar ou buildar a API — tanto no fluxo local quanto no Docker.

---

## 💻 Como Executar

### 1. Clone os dois repositórios lado a lado

```bash
mkdir alinhados && cd alinhados

git clone https://github.com/ruppell-barber/alinhados-contracts.git
git clone https://github.com/ruppell-barber/alinhados-api.git
```

A estrutura de pastas deve ficar assim:
```
alinhados/
├── alinhados-contracts/
└── alinhados-api/
```

### 2. Compile o pacote de contratos

```bash
cd alinhados-contracts
npm install
npm run build   # gera alinhados-contracts/dist, que a API importa via @alinhados/contracts
cd ../alinhados-api
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

O `.env` precisa conter (valores padrão já batem com o `docker-compose.yml`):
```dotenv
PORT=3000
DATABASE_URL="postgresql://alinhados_user:alinhados_pass@localhost:5432/alinhados_db?schema=public"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
DOCUMENTO_HASH_SECRET="troque-por-um-segredo-forte"   # usado pra hashear CNPJ/CPF (LGPD) — nunca versione o valor real
```

### 4. Suba a infraestrutura (Postgres + RabbitMQ)

```bash
docker compose up -d postgres rabbitmq
```

### 5. Instale as dependências da API

```bash
npm install
```

### 6. Gere o Prisma Client e aplique as migrations

```bash
npx prisma generate
npx prisma migrate dev
```
> Na primeira vez que rodar, o Prisma pode pedir confirmação para criar o banco/aplicar as migrations — responda "yes". Isso cria as tabelas (`profiles`, `barbeiro_details`, `barbearia_details`, `photos`, `swipes`, `matches`, `messages`) no Postgres que você acabou de subir.

### 7. Rode a aplicação em modo de desenvolvimento (hot reload)

```bash
npm run dev
```

Se tudo deu certo, você verá no terminal:
```
Server running on port 3000
Swagger docs available at http://localhost:3000/api-docs
```

A API estará em `http://localhost:3000` e a documentação interativa (Swagger) em [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

Para derrubar a infraestrutura depois:
```bash
docker compose down
```

### Rodando tudo via Docker (API incluída)
Também é possível buildar a própria API dentro de um container (usa o repositório de contratos irmão como contexto extra de build via Buildx):

```bash
docker compose up --build -d
docker compose logs -f api
```
> A imagem Docker atual **não roda `prisma generate`/`prisma migrate deploy` automaticamente no build** (ver comentário no `Dockerfile`). Depois de subir os containers, aplique as migrations manualmente uma vez:
> ```bash
> docker compose exec api npx prisma migrate deploy
> ```

```bash
# Para derrubar a infraestrutura e desligar os containers
docker compose down
```

### 🧪 Testes e verificação
```bash
npm run lint       # ESLint
npx tsc --noEmit   # checagem de tipos
npm run test       # roda a suíte de testes (vitest)
npm run test:cov   # com relatório de cobertura
```

---

## 🛡️ Governança e CI/CD
Este projeto utiliza **Lefthook** para governar automaticamente os padrões do repositório de ponta a ponta. 
Sempre que um `git commit` ou `git push` for realizado, as barreiras locais atuarão:
- Nomes de branch devem seguir o padrão estrito: `feature/*`, `fix/*`, `hotfix/*`, `release/*`
- Mensagens de commit seguem a convenção do **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc)
- Todo o código sofre análise estática automática e formatação (ESLint + Prettier).

Os pipelines de CI/CD automatizados rodam via GitHub Actions separando os deploys de:
1. **Staging:** Valida o build, tipagem e executa na branch `develop`.
2. **Homologação:** Prepara o artefato em deploy efêmero a partir das branches `release/*`.
3. **Produção:** Acionado na branch `main`, exigindo portão de **Aprovação Humana**.
4. **Stable:** Tagueia oficialmente a versão quando a tag `vX.Y.Z` for lançada.

---

## ✒️ Autores
- **Equipe Alinhados** - [GitHub](https://github.com/ruppell-barber)

<br/>
<p align="center">Desenvolvido com ☕ e ❤️ para construir conexões valiosas e facilitar o gerenciamento de barbearias de alto nível.</p>
