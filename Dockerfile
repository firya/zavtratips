ARG WORKDIR=/app

FROM node:22-alpine
WORKDIR ${WORKDIR}

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy server code and environment files
COPY server ./server
COPY .env* ./

# Create empty dist directory for volume mounting
RUN mkdir -p dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application with tsx to run TypeScript files
CMD ["npx", "tsx", "server/index.ts"] 