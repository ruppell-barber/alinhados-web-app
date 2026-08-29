# syntax=docker/dockerfile:1.4

# Estágio 1: Builder (Compilação do Frontend)
FROM node:20-alpine AS builder
LABEL maintainer="Equipe Alinhados <suporte@alinhados.com>"
WORKDIR /app

# Cache do npm ci usando BuildKit
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copia o código-fonte
COPY . .

# Faz o build (Vite/React/Vue etc)
RUN npm run build


# Estágio 2: Runner (NGINX Otimizado e com Hardening)
FROM nginx:alpine AS runner
LABEL maintainer="Equipe Alinhados <suporte@alinhados.com>"
LABEL description="Frontend Web do Alinhados"

# Hardening: Limpa os arquivos padrão do NGINX
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos minificados do builder
# IMPORTANTE: Se usar Vite, a pasta gerada é 'dist'. Se usar CRA, é 'build'. Ajuste conforme a stack!
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração dinâmica para SPAs (Single Page Applications)
# O try_files garante que o React Router / Vue Router funcionem sem dar erro 404
RUN echo 'server { \
    listen 80; \
    server_tokens off; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    # Hardening: Headers de segurança básicos \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-Content-Type-Options "nosniff"; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Roda o Nginx como processo primário
CMD ["nginx", "-g", "daemon off;"]
