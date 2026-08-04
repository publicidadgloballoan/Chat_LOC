FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080

# Variables de entorno por defecto (sobreescribir en docker-compose.yml)
ENV PORT=8080
ENV AUTHENTICATION_API_KEY=PICE-SAAS-DEFAULT-KEY-2026
ENV META_RELAY_WS=wss://relay.smart-box.com.ar/ws
ENV RELAY_API_KEY=PICE-SAAS-DEFAULT-KEY-2026
ENV NUCLEO_WEBHOOK_URL=http://ai-core:5000/webhook
ENV META_GRAPH_VERSION=v20.0

CMD ["node", "server.js"]
