FROM node:20-alpine

WORKDIR /app

COPY bot/package*.json ./bot/

WORKDIR /app/bot
RUN npm ci --omit=dev

WORKDIR /app
COPY . .

RUN npm install -g pm2
RUN mkdir -p logs

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
