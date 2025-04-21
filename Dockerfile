FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma files
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy Prisma schema
COPY prisma ./prisma/

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules

# Copy any other necessary files
COPY .env* ./

# Create a startup script
RUN echo '#!/bin/sh\n\
# Wait for database to be ready\n\
echo "Waiting for database..."\n\
sleep 5\n\
\n\
# Run database migrations\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
\n\
# Start the application\n\
echo "Starting application..."\n\
node server/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 3000

# Start the application with the startup script
ENTRYPOINT ["/bin/sh", "/app/start.sh"] 