import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient, Prisma, Recommendation, Podcast, Config } from '@prisma/client';

const prisma = new PrismaClient();

// Define a type that includes the relations
type RecommendationWithRelations = Recommendation & {
  podcast: Podcast;
  type: Config;
};

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
    
    // Search recommendations by name (partial match, case-insensitive)
    const where: Prisma.RecommendationWhereInput = {
      name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive }
    };
    
    const recommendations = await prisma.recommendation.findMany({
      where,
      include: {
        type: true,
        podcast: true
      },
      orderBy: {
        rowNumber: 'desc' // Keep some ordering, e.g., by latest appearance
      },
      take: 50, // Limit results
    });
    
    if (recommendations.length === 0) {
      await bot.answerInlineQuery(query.id, [], { cache_time: 300 });
      return;
    }
    
    // Group recommendations by link
    const groupedRecommendations: Record<string, RecommendationWithRelations[]> = {};
    
    recommendations.forEach(recommendation => {
      const link = recommendation.link || 'no-link'; // Use a placeholder if link is null/empty
            
      if (!groupedRecommendations[link]) {
        groupedRecommendations[link] = [];
      }
      
      groupedRecommendations[link].push(recommendation);
    });
    
    // Format results for inline query
    const results = Object.entries(groupedRecommendations).map(([link, items]: [string, RecommendationWithRelations[]], index) => {
      // Get the first item for main details
      const mainItem = items[0];
      
      // Track episode and vote status for each host
      interface EpisodeVote {
        episode: string;
        vote: boolean | null;
      }

      const hostEpisodes: {
        dima: EpisodeVote[];
        timur: EpisodeVote[];
        maksim: EpisodeVote[];
        guest: string[]; // Guests just listed with episode
      } = { dima: [], timur: [], maksim: [], guest: [] };
      
      // Get all podcasts where this was recommended and track host recommendations/votes
      items.forEach(item => {
        const episodeRef = `#${item.podcast.number}`;
        
        // Record vote status for each host for this specific episode mention
        hostEpisodes.dima.push({ episode: episodeRef, vote: item.dima });
        hostEpisodes.timur.push({ episode: episodeRef, vote: item.timur });
        hostEpisodes.maksim.push({ episode: episodeRef, vote: item.maksim });
        
        if (item.guest) {
          hostEpisodes.guest.push(`${item.guest} ${episodeRef}`);
        }
      });
      
      // Helper function to format vote status
      const formatVote = (vote: boolean | null): string => {
        if (vote === true) return '👍';
        if (vote === false) return '👎';
        // This case should not be reached if we filter nulls beforehand, 
        // but return empty string just in case.
        return ''; 
      };

      // Format host recommendations showing vote status per episode, filtering out null votes
      const hostRecommendations = [
        hostEpisodes.dima.filter(v => v.vote !== null).length > 0 
          ? `Дима: ${hostEpisodes.dima.filter(v => v.vote !== null).map(v => `${formatVote(v.vote)} ${v.episode}`).join(', ')}` 
          : '',
        hostEpisodes.timur.filter(v => v.vote !== null).length > 0 
          ? `Тимур: ${hostEpisodes.timur.filter(v => v.vote !== null).map(v => `${formatVote(v.vote)} ${v.episode}`).join(', ')}` 
          : '',
        hostEpisodes.maksim.filter(v => v.vote !== null).length > 0 
          ? `Максим: ${hostEpisodes.maksim.filter(v => v.vote !== null).map(v => `${formatVote(v.vote)} ${v.episode}`).join(', ')}` 
          : '',
        hostEpisodes.guest.length > 0 ? `Гости: ${hostEpisodes.guest.join(', ')}` : ''
      ].filter(Boolean).join('\n');
      
      // Create message text
      let messageText = `*${mainItem.name}*\n`;
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
      
      // Generate a valid, URL-safe ID for Telegram (must be <= 64 bytes and use safe characters)
      // Use a hash or truncated/encoded version of the link instead of the full URL
      const safeResultId = `rec_${index}_${mainItem.id}`;
      
      // Create InlineQueryResultArticle object with proper types
      const inlineResult: TelegramBot.InlineQueryResultArticle = {
        type: 'article',
        id: safeResultId, // Use a safe, short ID format
        title: mainItem.name, // Use full name as title now
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