FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY src/schema.sql ./dist/schema.sql

RUN addgroup -S nexo && adduser -S nexo -G nexo && chown -R nexo:nexo /app
USER nexo

EXPOSE 8080
CMD ["node", "dist/index.js"]
