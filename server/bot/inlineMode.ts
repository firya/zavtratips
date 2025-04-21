import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handle inline queries for recommendation search
 * @param bot Telegram bot instance
 * @param query Inline query from Telegram
 */
export const handleInlineQuery = async (bot: TelegramBot, query: TelegramBot.InlineQuery): Promise<void> => {
  try {
    const searchTerm = query.query.trim();
    
    if (!searchTerm) {
      await bot.answerInlineQuery(query.id, [], { cache_time: 0 });
      return;
    }
    
    // Search recommendations with proper Prisma types
    const where: Prisma.RecommendationWhereInput = {
      OR: [
        { name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
        { link: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
        { platforms: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
      ]
    };
    
    const recommendations = await prisma.recommendation.findMany({
      where,
      include: {
        type: true,
        podcast: true
      },
      orderBy: {
        rowNumber: 'desc'
      },
      take: 50, // Limit to prevent too many results
    });
    
    if (recommendations.length === 0) {
      await bot.answerInlineQuery(query.id, [], { cache_time: 300 });
      return;
    }
    
    // Group recommendations by name
    const groupedRecommendations = recommendations.reduce<Record<string, typeof recommendations>>((acc, recommendation) => {
      const name = recommendation.name;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(recommendation);
      return acc;
    }, {});
    
    // Format results for inline query
    const results = Object.entries(groupedRecommendations).map(([name, items], index) => {
      // Get the first item for main details
      const mainItem = items[0];
      
      // Compile host recommendations from all items
      const hosts = {
        dima: items.some(item => item.dima === true),
        timur: items.some(item => item.timur === true),
        maksim: items.some(item => item.maksim === true),
      };
      
      // Track which episodes each host recommended the item in
      const hostEpisodes = {
        dima: [] as string[],
        timur: [] as string[],
        maksim: [] as string[],
        guest: [] as string[]
      };
      
      // Get all podcasts where this was recommended and track host recommendations
      items.forEach(item => {
        const episodeRef = `#${item.podcast.number}`;
        
        if (item.dima === true) {
          hostEpisodes.dima.push(episodeRef);
        }
        
        if (item.timur === true) {
          hostEpisodes.timur.push(episodeRef);
        }
        
        if (item.maksim === true) {
          hostEpisodes.maksim.push(episodeRef);
        }
        
        if (item.guest) {
          hostEpisodes.guest.push(`${item.guest} ${episodeRef}`);
        }
      });
      
      // Get all podcasts where this was recommended
      const podcastReferences = items.map(item => 
        `${item.podcast.showType} #${item.podcast.number}`
      ).join(', ');
      
      // Format host recommendations with episode numbers
      const hostRecommendations = [
        hosts.dima ? `Дима 👍 (${hostEpisodes.dima.join(', ')})` : '',
        hosts.timur ? `Тимур 👍 (${hostEpisodes.timur.join(', ')})` : '',
        hosts.maksim ? `Максим 👍 (${hostEpisodes.maksim.join(', ')})` : '',
        hostEpisodes.guest.length > 0 ? `Гости: ${hostEpisodes.guest.join(', ')}` : ''
      ].filter(Boolean).join('\n');
      
      // Create message text
      let messageText = `*${name}*\n`;
      messageText += `*Тип:* ${mainItem.type.value}\n`;
      
      if (mainItem.platforms) {
        messageText += `*Платформы:* ${mainItem.platforms}\n`;
      }
      
      if (mainItem.genre) {
        messageText += `*Жанр:* ${mainItem.genre}\n`;
      }
      
      if (mainItem.rate) {
        messageText += `*Рейтинг:* ${mainItem.rate}\n`;
      }
      
      if (mainItem.length) {
        messageText += `*Длительность:* ${mainItem.length}\n`;
      }
      
      messageText += `\n*Рекомендовали:*\n${hostRecommendations || 'Никто'}\n`;
      
      if (mainItem.link) {
        messageText += `\n[Подробнее](${mainItem.link})`;
      }
      
      // Create inline keyboard only if we have a valid URL
      const replyMarkup = mainItem.link ? {
        inline_keyboard: [
          [
            {
              text: 'Открыть ссылку',
              url: mainItem.link
            }
          ]
        ]
      } : undefined;
      
      // Create InlineQueryResultArticle object with proper types
      const inlineResult: TelegramBot.InlineQueryResultArticle = {
        type: 'article',
        id: `recommendation_${index}`,
        title: name,
        description: `${mainItem.type.value}${mainItem.platforms ? ` • ${mainItem.platforms}` : ''}${mainItem.genre ? ` • ${mainItem.genre}` : ''}${hostEpisodes.dima.length || hostEpisodes.timur.length || hostEpisodes.maksim.length ? ` • ${items.length} упоминаний` : ''}`,
        thumb_url: mainItem.image || undefined,
        input_message_content: {
          message_text: messageText,
          parse_mode: 'Markdown'
        }
      };
      
      // Only add reply_markup if we have a valid URL
      if (replyMarkup) {
        inlineResult.reply_markup = replyMarkup;
      }
      
      return inlineResult;
    });
    
    await bot.answerInlineQuery(query.id, results, { cache_time: 300 });
  } catch (error) {
    console.error('Error handling inline query:', error);
    await bot.answerInlineQuery(query.id, [], { cache_time: 0 });
  }
}; 