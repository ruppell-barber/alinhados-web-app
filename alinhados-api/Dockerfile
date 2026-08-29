# syntax=docker/dockerfile:1.4

# Estágio 1: Instalação de dependências e cache via Buildx
FROM node:20-alpine AS deps
LABEL maintainer="Equipe Alinhados <suporte@alinhados.com>"
LABEL description="API do Alinhados"
WORKDIR /app

# libc6-compat e openssl são vitais para o Prisma rodar no Alpine
RUN apk add --no-cache openssl libc6-compat

# Copia e compila o repositório de contratos via contexto externo (Buildx)
COPY --from=contracts . /alinhados-contracts
WORKDIR /alinhados-contracts
RUN npm install && npm run build

WORKDIR /app
# Utilização de mounts para o cache do NPM, economizando tempo de build
# Utiliza npm ci no lugar de npm install para garantir estabilidade (package-lock travado)
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci


# Estágio 2: Build da aplicação (Typescript -> Javascript)
FROM node:20-alpine AS builder
WORKDIR /app
# Copia contratos já compilados e módulos
COPY --from=deps /alinhados-contracts /alinhados-contracts
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Quando for rodar pra valer, descomente as linhas abaixo:
# RUN npx prisma generate
RUN npm run build


# Estágio 3: Separação isolada apenas de dependências de Produção
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY --from=deps /alinhados-contracts /alinhados-contracts
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


# Estágio 4: Imagem de Execução - Produção com Hardening Total
FROM node:20-alpine AS runner
LABEL maintainer="Equipe Alinhados <suporte@alinhados.com>"
LABEL description="API do Alinhados - Production Image"
LABEL org.opencontainers.image.vendor="Alinhados"

# Hardening: Adiciona dumb-init (para gerenciar PID 1 de forma segura) 
RUN apk add --no-cache dumb-init tzdata openssl

WORKDIR /app

# Hardening: Transfere a propriedade do diretório base para o usuário 'node'
RUN chown node:node /app

# Hardening: Abandona o acesso ROOT e roda exclusivamente como usuário comum do linux
USER node

# Define a variável de ambiente para Produção
ENV NODE_ENV=production

# Copia os contratos e as libs
COPY --from=prod-deps --chown=node:node /alinhados-contracts /alinhados-contracts
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma

EXPOSE 3000

# Executando o Node de forma bruta via dumb-init. 
# Motivo: Evitar o 'npm start' pois o NPM esconde sinais de parada do sistema operacional (SIGTERM).
CMD ["dumb-init", "node", "dist/main.js"]
