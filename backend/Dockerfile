FROM node:20-bookworm-slim

WORKDIR /app

# Instalar dependencias de sistema para Prisma y OpenSSL
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
