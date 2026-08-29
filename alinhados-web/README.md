<div align="center">
  <img src="./docs/logo.png" alt="Alinhados Web Logo" width="200"/>
  <h1>💈 Alinhados Web</h1>
  <p><strong>A experiência visual e interativa da plataforma Alinhados</strong></p>
</div>

<br/>

## 📖 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Governança e CI/CD](#-governança-e-cicd)
- [Autores](#-autores)

---

## 🚀 Sobre o Projeto
O **Alinhados Web** é o front-end projetado para suportar os clientes e as barbearias do ecossistema Alinhados. Ele entrega as interfaces de gestão, busca geoespacial, agendamentos e interações em tempo real.

---

## 🛠 Tecnologias Utilizadas
- **Node.js** v20+
- **TypeScript**
- **Framework:** Next.js (App Router) + Tailwind CSS v4 (governança 4.1.1.4 do Wiki)
- **Contratos:** `@alinhados/contracts` (TypeScript + Zod)
- **Formulários & Dados:** react-hook-form + Zod · TanStack Query
- **Testes:** Vitest + Testing Library
- **Qualidade de Código:** ESLint, Prettier e Lefthook (Git Hooks)
- **CI/CD:** GitHub Actions & Vercel

---

## ⚙️ Pré-requisitos
- [Node.js (v20+)](https://nodejs.org/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

---

## 💻 Como Executar

### 1. Clone os repositórios (lado a lado)
O projeto depende de `@alinhados/contracts` via `file:../alinhados-contracts`, então a pasta `alinhados-contracts` precisa existir **ao lado** da `alinhados-web` (mesma pasta pai). Sem ela, o `npm install` falha.

```bash
git clone https://github.com/ruppell-barber/alinhados-web.git
git clone https://github.com/ruppell-barber/alinhados-contracts.git
```

> ⚠️ Enquanto o repositório oficial `alinhados-contracts` não for publicado, usamos um shim local (ver README dentro da pasta `alinhados-contracts`).

### 2. Instale as dependências
```bash
cd alinhados-web
npm install
```

### 3. Configure as variáveis de ambiente (opcional em dev)
```bash
cp .env.example .env.local
```
- **Sem** as variáveis do Supabase preenchidas, o app roda com o `MockAuthGateway` (login fake via localStorage — suficiente para desenvolver a UI).
- **Com** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, usa a auth real do Supabase.

### 4. Suba o servidor de desenvolvimento
```bash
npm run dev
```
O app fica disponível em [http://localhost:3000](http://localhost:3000).

### Outros comandos
| Comando | O que faz |
|---|---|
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção |
| `npm run lint` | Análise estática (ESLint) |
| `npm test` | Roda os testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |

### Rodando com Docker
Se preferir rodar em contêiner (o app fica em [http://localhost:3001](http://localhost:3001), porta 3001 do host mapeada para a 3000 do contêiner):
```bash
docker compose up -d
```

### Integração com a API
O `NEXT_PUBLIC_API_URL` aponta para a `alinhados-api` local (`http://localhost:3000` por padrão). **Atenção:** o repositório `alinhados-api` ainda é um esqueleto (sem `package.json`/`docker-compose.yml`), então por enquanto não é possível subi-la — o front funciona de forma independente com o mock de auth.

---

## 🛡️ Governança e CI/CD
Este projeto utiliza **Lefthook** para governar automaticamente os padrões do repositório de ponta a ponta. 
Sempre que um `git commit` ou `git push` for realizado, as barreiras locais atuarão:
- Nomes de branch devem seguir o padrão estrito: `feature/*`, `fix/*`, `hotfix/*`, `release/*`
- Mensagens de commit seguem a convenção do **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc)
- Todo o código sofre análise estática automática e formatação (ESLint + Prettier).

Os pipelines de CI/CD automatizados rodam via GitHub Actions integrados com a **Vercel**:
1. **Staging:** Build e testes automatizados (`develop`).
2. **Homologação:** Deploy Preview na Vercel a partir das branches `release/*`.
3. **Produção:** Deploy produtivo na branch `main`, exigindo portão de aprovação manual.

---

## ✒️ Autores
- **Equipe Alinhados** - [GitHub](https://github.com/ruppell-barber)

<br/>
<p align="center">Desenvolvido com ☕ e ❤️ para construir conexões valiosas e facilitar o gerenciamento de barbearias de alto nível.</p>
