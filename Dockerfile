FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN ./node_modules/.bin/prisma generate && npm test && npm run build && \
    ./node_modules/.bin/esbuild server/index.ts --bundle --platform=node --packages=external --format=esm --target=node22 --outfile=server/production.mjs

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && ./node_modules/.bin/prisma generate

FROM node:22-alpine
WORKDIR /app
RUN apk upgrade --no-cache && rm -rf /usr/local/lib/node_modules/npm /opt/yarn-*
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/production.mjs ./server/production.mjs
COPY package.json ./
EXPOSE 3000
CMD ["node", "server/production.mjs"]
