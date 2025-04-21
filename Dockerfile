ARG WORKDIR=/app

# Builder stage for frontend
FROM node:22-alpine AS builder
WORKDIR ${WORKDIR}

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the application code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR ${WORKDIR}

# Copy package files and install dependencies (including dev dependencies for tsx)
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy server code and environment files
COPY server ./server
COPY .env* ./

# Copy built frontend from builder stage
COPY --from=builder ${WORKDIR}/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application with tsx to run TypeScript files
CMD ["npx", "tsx", "server/index.ts"] 