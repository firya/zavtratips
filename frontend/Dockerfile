# FROM node:alpine AS dev

# WORKDIR /app

# COPY package*.json ./
# COPY tsconfig.json ./

# COPY ./ ./

# RUN npm i

# CMD ["npm", "run", "start"]

FROM node:alpine AS build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY ./ ./

RUN npm сi
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
