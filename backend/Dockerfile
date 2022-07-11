FROM node:alpine as prod

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

RUN npm i pm2 -g

EXPOSE 3001

CMD ["pm2-runtime", "start", "dist/index.js"]