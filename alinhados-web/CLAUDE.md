# CLAUDE.md — alinhados-web

Frontend web (PWA + painel admin) do Alinhados: plataforma de match profissional entre barbeiros e barbearias. Interface principal do produto é o app mobile (Expo); o web cobre PWA e admin.

## Stack (designada pela governança do time — Wiki 4.1.1.4)
- Next.js (App Router) + TypeScript estrito + Tailwind v4 · deploy Vercel
- Contratos compartilhados: `@alinhados/contracts` (TypeScript + Zod, `file:../alinhados-contracts`)
- Auth: Supabase (ADR-0001 formal pendente; decisão verbal na daily 03/07)
- Dados de servidor: TanStack Query · Formulários: react-hook-form + Zod
- Testes: Vitest + Testing Library (`npm test`)

## Comandos
- `npm run dev` · `npm run build` · `npm run lint` · `npm test`
- API local (integração): `docker compose up` no repo irmão `alinhados-api` (Swagger em `localhost:3000/api-docs`)

## Estrutura
- `src/app/` — rotas (App Router)
- `src/features/<modulo>/` — espelha os módulos do back: identidade, perfil, discovery, matching, conversa, notificacoes
- `src/components/ui/` — design system neubrutalista (tokens em `src/app/globals.css`)
- `src/lib/auth/` — porta AuthGateway + adapters (Supabase real / mock sem env)

## Regras inegociáveis (Wiki, governança 4.x)
- Branch: `feature/<US-ID>-descricao` a partir de `develop`; NADA direto em develop/main; PR com template do Wiki 8.5.
- Commits: Conventional Commits **em português, no imperativo**, escopo = módulo/US. Ex.: `feat(perfil): adiciona slider de comissao (B02)`.
- Toda entrada de dados valida com Zod via `@alinhados/contracts`.
- Mobile-first 390px (RNF12) e WCAG AA, contraste ≥ 4,5:1 (RNF13) — a paleta neon sobre dark exige checar contraste sempre.
- Nenhum segredo hardcoded; envs conforme `.env.example`.
- Linguagem ubíqua: "Alinhamento" (não Match), "Barbearia" (não empresa). UI em pt-BR.

## Atenção
- `../alinhados-contracts` hoje é um SHIM local (ver README de lá); quando o repo oficial for publicado, apagar a pasta, clonar o oficial e corrigir divergências.
- Design: neubrutalismo dark + paleta ácida (Padlet do designer Gabriel). Fonte alvo: Neue Montreal (licença pendente) — interina: Inter. Logo provisória em `public/logo.png`.
- Docs de contexto do projeto (decisões, regras, aprendizados): pasta irmã `../docs/`.
