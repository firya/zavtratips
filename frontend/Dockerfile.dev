FROM node:alpine AS dev

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY ./ ./

RUN npm i

EXPOSE 3000

CMD ["npm", "run", "start"]