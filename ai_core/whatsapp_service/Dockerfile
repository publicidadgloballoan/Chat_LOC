FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para Baileys y Git
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copiar package.json y instalar dependencias
COPY package.json ./
RUN npm install --production --legacy-peer-deps

# Copiar codigo fuente
COPY *.js ./

# Crear directorio para auth states
RUN mkdir -p /tmp/baileys-auth

# Exponer puerto
EXPOSE 8080

# Iniciar servidor
CMD ["node", "server.js"]
