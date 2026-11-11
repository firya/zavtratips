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

Deploy manually after publishing to GitHub main:

```bash
git pull --ff-only origin main
docker compose up -d --build --no-deps app
```

Set `TMDB_READ_ACCESS_TOKEN` in the server's `.env` before deployment. Never commit credentials. No GitHub webhook or automatic deployment is configured.

## Environment Variables

See `.env.example` for a complete list of required environment variables and their descriptions.

## Features

- Podcast recommendation management
- Stream scheduling and management
- Telegram bot integration
- Google Sheets synchronization
- YouTube playlist integration
- IGDB, TMDB and OMDb API integration for game and movie recommendations

## Tech Stack

- Frontend: React, Vite, TypeScript, TailwindCSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL, Prisma ORM
- Deployment: Docker, Docker Compose

## Поиск фильмов и аниме

Поиск через TMDB: оригинальные, русские и альтернативные названия, IMDb ID или IMDb-ссылка. До 20 результатов по году премьеры от новых к старым. Загружаются доступные страницы поиска (до 100 на вариант запроса).

Тип формы учитывается: фильмы/сериалы без анимации, мультфильмы/мультсериалы с жанром Animation, аниме — японская анимация обоих форматов. Год в конце (`Resident Evil 2026`) проверяется как год премьеры и как часть названия (`Blade Runner 2049`). Совпадения по указанному году идут первыми.

После выбора оригинал заполняет Original Name, русское и английское названия без повторов — Other Names. Также заполняются постер, ссылка IMDb (при наличии), жанры, дата выхода, длительность фильма или серии. Рейтинг IMDb запрашивается отдельно через OMDb при выборе; если рейтинга нет, поле остаётся пустым. Другие названия сохраняются при повторном редактировании. Существующие записи автоматически не меняются.

Подробности кешируются на сутки, поиск — на пять минут, максимум четыре одновременных запроса к TMDB. Токен остаётся на сервере, сообщения об ошибках его не содержат. Для api.themoviedb.org используется DNS over HTTPS через Cloudflare: штатный DNS хостинга возвращает loopback. DNS других сервисов не меняется.

Атрибуция TMDB и официальный логотип — в настройках, в блоке «О приложении». API требует соблюдения условий TMDB; бесплатный доступ предназначен для некоммерческого использования.

Проверки: `npm test` и `npm run build`.
