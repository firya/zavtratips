import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN!, { polling: true });

// Telegram bot commands
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Welcome to ZavtraTips Bot! Use /help to see available commands.'
  );
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Available commands:\n' +
      '/recommendations - Show recommendations\n' +
      '/podcasts - Show podcasts\n' +
      '/streams - Show streams\n' +
      '/add_recommendation - Add new recommendation'
  );
});

export default bot; 