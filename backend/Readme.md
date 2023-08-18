Для локального запуска бота необходимо:

- Включить проксирование локалхоста в интернет, например через `ssh -R 80:localhost:8000 localhost.run`
- Указать `.env`  в корне проекта переменные:
  - `HOST_URL` — Полученный адрес из localhost.run 
  - `WEBAPP_URL` — Ссылка на вебапп
  - `PORT` — Порт запуска
  - `POSTGRES_URL` — ссылка для подключения к postgress
  - `TELEGRAM_TOKEN` — токен телеграм бота
  - `TELEGRAM_DEFAULT_ADMIN` — id дефолтного админа в телеграме
  - `RAWG_API_KEY` — ключ к api https://rawg.io
  - `OMDB_API_KEY` — ключ к api https://www.omdbapi.com
  - `GOOGLE_API_KEY` — где-то в гугле берется
  - `GOOGLE_SPREADSHEET_URL` —где-то в гугле берется
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` —где-то в гугле берется
  - `GOOGLE_PRIVATE_KEY` — где-то в гугле берется