# ZavtraTips

A web application for managing podcast recommendations and streams.

## Prerequisites

- Node.js (version specified in .nvmrc)
- PostgreSQL
- Docker and Docker Compose (for production deployment)

## Environment Setup

1. Copy `.env.example` to `.env` and fill in all required variables

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Available Scripts

### Development

- `npm run dev:all` - Start both frontend and backend servers in development mode, frontend available on localhost:5173
- `npm run bot:dev` - Build the frontend as static! and start the backend with hot-reload (useful for Telegram bot development)

### Database

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run db:show` - Open Prisma Studio to view and edit database content
- `npm run sync-db` - Synchronize database with Google Sheets data

### Build & Production

- `npm run build` - Build the frontend application for production
- `npm run production` - Build and run the application in production mode

### Code Quality

- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint to check code quality

## Deployment

The application is configured for deployment using Docker Compose. The deployment process is automated through GitHub Actions.

1. Set up your VPS with Docker and Docker Compose
2. Configure GitHub repository secrets with your deployment credentials
3. Push to the main branch to trigger automatic deployment

## Environment Variables

See `.env.example` for a complete list of required environment variables and their descriptions.

## Features

- Podcast recommendation management
- Stream scheduling and management
- Telegram bot integration
- Google Sheets synchronization
- YouTube playlist integration
- RAWG and OMDB API integration for game and movie recommendations

## Tech Stack

- Frontend: React, Vite, TypeScript, TailwindCSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL, Prisma ORM
- Deployment: Docker, Docker Compose, GitHub Actions 