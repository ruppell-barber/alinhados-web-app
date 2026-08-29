# **💈 Alinhados**

O match entre barbeiros e barbearias. Um "Tinder" da contratação em barbearia: cada lado monta seu perfil, desliza pelos perfis do outro e, no like mútuo, abre um alinhamento que libera a conversa.

Repositório central do ecossistema Alinhados, produto da Ruppell Software House.

---

## **🎯 O problema**

A contratação em barbearia é informal e opaca. Vaga circula em grupo de WhatsApp, Instagram e classificado genérico, sem perfil padronizado e sem transparência nas variáveis que de fato decidem o encaixe: comissão, fixo, taxa de ocupação, faturamento, modelo de trabalho e valores. O resultado é rotatividade alta, cadeira vazia para a barbearia e barbeiro preso onde não combina com ele.

---

## **💡 A solução**

O Alinhados padroniza os dados que importam dos dois lados e transforma a busca em um match por compatibilidade:

*   **Barbeiro** cadastra comissão desejada, taxa de ocupação, faturamento, experiência, serviços, valores e portfólio.
*   **Barbearia** cadastra comissão paga, fixo, clube, POPs, cadeiras, vagas abertas, faturamento médio e galeria.
*   O feed prioriza a mesma cidade (depois o estado), mostra apenas perfis completos e não repete quem já foi visto.
*   O like mútuo cria o alinhamento, libera um chat privado e notifica os dois na hora.
*   Cada lado marca se "deu certo", registrando a conversão.
*   Um painel administrativo cuida da moderação e da qualidade do marketplace.

---

## **👥 Público-alvo**

Barbeiros (empregados, autônomos ou recém-formados) em busca de recolocação, melhor comissão ou uma barbearia alinhada ao seu momento; e donos e gestores de barbearia querendo preencher cadeiras com profissionais que combinam com a casa. Início em Recife e região metropolitana, com expansão nacional.

---

## **📊 Estágio & roadmap**

Fase pré-MVP: produto especificado e arquitetado, build em início. O desenvolvimento segue um plano de 6 sprints (v0.1.0-alpha, v1.0.0), com lançamento da v1 do MVP previsto para até 10 de setembro de 2026.

---


## **📦 alinhados-contracts, o idioma comum**

Fonte única da forma dos dados. Schemas de validação em Zod (validação em runtime e tipos em compile-time a partir de uma única declaração) e registro OpenAPI (`@asteasolutions/zod-to-openapi`) para gerar a documentação Swagger. `api` e `web` importam daqui em vez de redeclarar tipos, o que elimina o drift de contrato entre backend e frontend.

---

## **🖥️ alinhados-api, as regras de negócio**

Backend REST em Node.js + Express, com Prisma sobre PostgreSQL. Organizado como monólito modular com arquitetura hexagonal (Ports & Adapters); os módulos se comunicam por API interna, o que mantém cada um isolado e candidato a extração futura.

| Módulo | Responsabilidade |
| :--- | :--- |
| `identidade` | Cadastro, login e credenciamento |
| `perfil` | Perfis de barbeiro e barbearia, completude e status |
| `discovery` | Feed, swipe e regras de visibilidade |
| `matching` | Like mútuo, alinhamento e conversão |
| `conversa` | Chat e mensagens |
| `notificacoes` | Push e notificações in-app |
| `admin` | Moderação e métricas do marketplace |

---

## **🌐 alinhados-web, a interface**

Aplicação frontend em Next.js, entregue como PWA, que atende barbeiro, barbearia e o painel administrativo. Padroniza qualidade com ESLint + Prettier e CI/CD via GitHub Actions.

Autenticação, banco e storage de imagens são providos pelo Supabase (PostgreSQL, Auth e Storage). A solução de tempo real do chat está em decisão (ADR-0001).

---

## **🚀 CI/CD**

Pipeline em quatro estágios, seguindo o caminho de promoção staging, homologação, produção:

1.  **Staging**, push em `develop`: lint, testes e build de preparação.
2.  **Homologação**, branches `release/*`: verificação completa de integração para o aceite (UAT).
3.  **Produção**, merge em `main`: build, testes E2E e deploy (Vercel), com aprovação manual antes de subir.
4.  **Promoção stable**, tags `v*`: publica a imagem no registry com o sufixo stable.

---

## **🏗️ Rodando localmente**

Pré-requisitos: Node.js 20+, PostgreSQL e NPM.

```bash
# 1. Instalar dependências de cada projeto
cd alinhados-contracts && npm install
cd ../alinhados-api && npm install
cd ../alinhados-web && npm install

# 2. Banco de dados (na api): configure DATABASE_URL e rode as migrations
cd ../alinhados-api
npx prisma migrate dev

# 3. Qualidade (no web)
cd ../alinhados-web
npm run lint && npm run test
```

---

<sub>Alinhados, Ruppell Software House, pré-MVP, v1 do MVP prevista para até 10/09/2026</sub>