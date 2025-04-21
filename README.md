# Zavtratips

## Deployment

### Prerequisites

- Docker and Docker Compose
- Traefik reverse proxy running with a network named `traefik-public`
- SSH access to your VPS
- GitHub account with repository secrets configured

### Environment Variables

Create a `.env` file with the following variables:

```
# Application
NODE_ENV=production
PORT=3000
DOMAIN=your-domain.com

# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=zavtratips_db
POSTGRES_URL=postgresql://postgres:your_secure_password@db:5432/zavtratips_db

# Google Sheets (for syncing)
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/bot/webhook
```

### Manual Deployment

1. Clone the repository to your server
2. Create the `.env` file with appropriate values
3. Run the following command:

```bash
export DOMAIN=your-domain.com && docker-compose up -d
```

### GitHub Actions Deployment

For automatic deployment via GitHub Actions, set up the following repository secrets:

- `SSH_PRIVATE_KEY`: Your SSH private key for accessing the VPS
- `SSH_KNOWN_HOSTS`: SSH known hosts for your VPS
- `SSH_USER`: SSH username for your VPS
- `SSH_HOST`: Your VPS hostname or IP
- `DEPLOY_PATH`: Path on the VPS where the app should be deployed
- `DOMAIN`: Your domain name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `GOOGLE_SHEET_ID`: ID of your Google Sheet (optional)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account email (optional)
- `GOOGLE_PRIVATE_KEY`: Google private key for API access (optional)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (optional)
- `TELEGRAM_WEBHOOK_URL`: Webhook URL for the Telegram bot (optional)

After setting up these secrets, any push to the `main` branch will trigger an automatic deployment to your VPS.

## Database Management

The application uses Prisma ORM to manage the database schema. When the container starts:

1. The application waits for the PostgreSQL database to be ready
2. Prisma automatically runs migrations to create or update the database schema
3. The application starts once the database is properly set up

If you need to make changes to the database schema:

1. Update the `prisma/schema.prisma` file
2. Run `npx prisma migrate dev --name your_migration_name` locally
3. Commit the generated migration files
4. Push to main to deploy the changes 