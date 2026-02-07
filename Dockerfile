FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["npm", "run", "start"]
