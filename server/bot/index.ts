import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import localtunnel from 'localtunnel';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

// Get bot token from environment variables
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('TELEGRAM_TOKEN is not defined in environment variables');
  process.exit(1);
}

// Get default admin ID
const defaultAdminId = process.env.TELEGRAM_DEFAULT_ADMIN ? 
  Number(process.env.TELEGRAM_DEFAULT_ADMIN) : 
  null;

if (!defaultAdminId) {
  console.warn('TELEGRAM_DEFAULT_ADMIN is not defined in environment variables');
}

// Initialize the bot with polling
const bot = new TelegramBot(token, { polling: true });

// Store for administrators
const admins = new Set<number>();
if (defaultAdminId) {
  admins.add(defaultAdminId);
}

// Function to check if user is admin
const isAdmin = (userId: number): boolean => {
  return admins.has(userId);
};

// Setup localtunnel for HTTPS exposure
let tunnelUrl: string | null = null;

const setupTunnel = async (port: number) => {
  try {
    const subdomain = process.env.LOCALTUNNEL_SUBDOMAIN;
    
    const options = subdomain ? { subdomain } : {};
    const tunnel = await localtunnel({ port, ...options });
    
    tunnelUrl = tunnel.url;
    console.log(`🚀 Bot webhook is available at: ${tunnelUrl}`);
    
    tunnel.on('close', () => {
      console.log('Tunnel closed');
      tunnelUrl = null;
    });
    
    return tunnel;
  } catch (error) {
    console.error('Failed to create tunnel:', error);
    return null;
  }
};

// Setup webhook when tunnel is ready
const setupWebhook = async () => {
  if (!tunnelUrl) {
    console.warn('Cannot set webhook: tunnel URL is not available');
    return;
  }
  
  try {
    const webhookUrl = `${tunnelUrl}/bot${token}`;
    await bot.setWebHook(webhookUrl);
    console.log(`Webhook set to ${webhookUrl}`);
  } catch (error) {
    console.error('Failed to set webhook:', error);
  }
};

// Configure the mini app button for the bot
const setupMiniAppButton = async () => {
  try {
    console.log('Starting to configure menu button...');
    const webAppUrl = `${tunnelUrl || process.env.PUBLIC_URL || ''}/app`;
    
    // First completely remove the menu button by setting it to commands
    console.log('Resetting menu button to commands type...');
    await bot.setChatMenuButton({
      menu_button: {
        type: 'commands'
      }
    });
    
    // Wait to ensure the reset takes effect
    console.log('Waiting for reset to take effect...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now set the new WebApp button
    console.log('Setting new WebApp button...');
    await bot.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: 'App',
        web_app: { url: webAppUrl }
      }
    });
    
    console.log('Menu button configured successfully');
  } catch (error) {
    console.error('Failed to configure menu button:', error);
    console.error(error);
  }
};

// Initialize the bot with tunnel
export const initBot = async (port: number) => {
  const tunnel = await setupTunnel(port);
  if (tunnel) {
    await setupWebhook();
    await setupMiniAppButton();
  }
  
  return {
    tunnel,
    bot
  };
};

// Telegram bot commands
bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!userId) {
    return;
  }
  
  let message = 'Welcome to ZavtraTips Bot! Use /help to see available commands.';
  
  if (isAdmin(userId)) {
    bot.sendMessage(chatId, 'Welcome, Administrator! You can access the web app via the WebApp button below the message input field.');
  } else {
    bot.sendMessage(chatId, message);
  }
});

// Help command
bot.onText(/\/help/, (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!userId) {
    return;
  }
  
  let helpText = 'Available commands:\n' +
    '/start - Start the bot\n' +
    '/help - Show this help message';
    
  if (isAdmin(userId)) {
    helpText += '\nAs an admin, you can access the WebApp through the menu button next to the message input field.';
    helpText += '\n/webappbutton - Show inline button to launch WebApp';
  }
  
  bot.sendMessage(chatId, helpText);
});

// Remove resetbutton command and replace with webappbutton command
bot.onText(/\/webappbutton/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!userId || !isAdmin(userId)) {
    bot.sendMessage(chatId, 'Sorry, this command is only available for administrators.');
    return;
  }
  
  const webAppUrl = `${tunnelUrl || process.env.PUBLIC_URL || ''}/app`;
  
  // Send message with inline keyboard button to launch webapp
  bot.sendMessage(chatId, 'Click the button below to open the WebApp:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open WebApp',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

// Force reset the bot button (admin only)
bot.onText(/\/forcebutton/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!userId || !isAdmin(userId)) {
    bot.sendMessage(chatId, 'Sorry, this command is only available for administrators.');
    return;
  }
  
  try {
    // Get the current button configuration
    const currentButton = await bot.getChatMenuButton({});
    bot.sendMessage(chatId, `Current button configuration: ${JSON.stringify(currentButton)}`);
    
    // First remove button completely
    await bot.setChatMenuButton({
      menu_button: {
        type: 'commands'
      }
    });
    
    bot.sendMessage(chatId, 'Button removed. Now waiting 3 seconds...');
    
    // Wait longer
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Set with a unique name for testing
    const webAppUrl = `${tunnelUrl || process.env.PUBLIC_URL || ''}/app`;
    await bot.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: 'WebApp',
        web_app: { url: webAppUrl }
      }
    });
    
    bot.sendMessage(chatId, 'Button has been completely reset. Please restart Telegram app to see changes.');
  } catch (error: any) {
    console.error('Error in force reset:', error);
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
});

export default bot; 