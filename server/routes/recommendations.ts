import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { addRecommendationToSpreadsheet, updateRowInSpreadsheet, deleteRowFromSpreadsheet } from '../sheets';
import axios from 'axios';
import { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Get recommendations with filters
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const where: Prisma.RecommendationWhereInput = {};

    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search as string, mode: 'insensitive' } },
        { link: { contains: req.query.search as string, mode: 'insensitive' } },
        { platforms: { contains: req.query.search as string, mode: 'insensitive' } },
      ];
    }

    if (req.query.type) {
      where.typeId = Number(req.query.type);
    }

    const podcastWhere: Prisma.PodcastWhereInput = {};

    if (req.query.podcastShowType) {
      podcastWhere.showType = req.query.podcastShowType as string;
    }

    if (req.query.podcastNumber) {
      podcastWhere.number = req.query.podcastNumber as string;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      podcastWhere.date = {
        ...(req.query.dateFrom ? { gte: new Date(req.query.dateFrom as string) } : {}),
        ...(req.query.dateTo ? { lte: new Date(req.query.dateTo as string) } : {})
      };
    }

    if (Object.keys(podcastWhere).length > 0) {
      where.podcast = podcastWhere;
    }

    if (req.query.hosts) {
      const hosts = (req.query.hosts as string).split(',');
      where.OR = hosts.map(host => {
        if (host === 'dima') return { dima: true };
        if (host === 'timur') return { timur: true };
        if (host === 'maksim') return { maksim: true };
        return { guest: host };
      });
    }

    const [recommendations, total] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        include: {
          type: true,
          podcast: true
        },
        orderBy: {
          rowNumber: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.recommendation.count({ where }),
    ]);

    res.json({
      recommendations,
      total
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get single recommendation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: Number(id) },
      include: {
        type: true,
        podcast: true
      }
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

// Create new recommendation
router.post('/', async (req, res) => {
  try {
    const recommendation = await prisma.recommendation.create({
      data: req.body,
      include: {
        podcast: {
          select: {
            id: true,
            date: true,
            showType: true,
            number: true,
            name: true,
            length: true
          }
        },
        type: {
          select: {
            id: true,
            value: true
          }
        }
      }
    });

    // Add to Google Spreadsheet
    const rowNumber = await addRecommendationToSpreadsheet([
      recommendation.podcast.date.toLocaleDateString(),
      `${recommendation.podcast.showType} #${recommendation.podcast.number}`,
      recommendation.type.value,
      recommendation.name,
      recommendation.link || '',
      recommendation.image || '',
      recommendation.platforms || '',
      recommendation.rate?.toString() || '',
      recommendation.genre || '',
      recommendation.releaseDate?.toLocaleDateString() || '',
      recommendation.length || '',
      recommendation.dima ? '👍' : '❌',
      recommendation.timur ? '👍' : '❌',
      recommendation.maksim ? '👍' : '❌',
      recommendation.guest || ''
    ]);

    // Update the rowNumber in the database
    await prisma.recommendation.update({
      where: { id: recommendation.id },
      data: { rowNumber }
    });

    res.json(recommendation);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
});

// Update recommendation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await prisma.recommendation.update({
      where: { id: Number(id) },
      data: req.body,
      include: {
        podcast: {
          select: {
            id: true,
            date: true,
            showType: true,
            number: true,
            name: true,
            length: true
          }
        },
        type: {
          select: {
            id: true,
            value: true
          }
        }
      }
    });

    // Update in Google Spreadsheet
    if (recommendation.rowNumber) {
      await updateRowInSpreadsheet('Рекомендации', recommendation.rowNumber, [
        recommendation.podcast.date.toLocaleDateString(),
        `${recommendation.podcast.showType} #${recommendation.podcast.number}`,
        recommendation.type.value,
        recommendation.name,
        recommendation.link || '',
        recommendation.image || '',
        recommendation.platforms || '',
        recommendation.rate?.toString() || '',
        recommendation.genre || '',
        recommendation.releaseDate?.toLocaleDateString() || '',
        recommendation.length || '',
        recommendation.dima ? '👍' : '❌',
        recommendation.timur ? '👍' : '❌',
        recommendation.maksim ? '👍' : '❌',
        recommendation.guest || ''
      ]);
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Delete recommendation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the recommendation first to get the row number
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: Number(id) },
      select: { rowNumber: true }
    });

    // Delete from database
    await prisma.recommendation.delete({
      where: { id: Number(id) },
    });

    // Delete from Google Spreadsheet
    if (recommendation?.rowNumber) {
      await deleteRowFromSpreadsheet('Рекомендации', recommendation.rowNumber);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
});

// Search media (games/movies) based on type
router.get('/search-media', async (req, res) => {
  try {
    const { search, typeId } = req.query;
    if (!search || !typeId) {
      return res.json([]);
    }

    // Get type configuration
    const type = await prisma.type.findUnique({
      where: { id: Number(typeId) },
      include: { config: true },
    });

    if (!type?.config) {
      return res.json([]);
    }

    let mediaData;
    if (type.config.value === 'rawg') {
      // Search games using RAWG API
      const response = await axios.get(`https://api.rawg.io/api/games`, {
        params: {
          key: process.env.RAWG_API_KEY,
          search: search,
          page_size: 5,
        },
      });

      mediaData = response.data.results.map((game: any) => ({
        name: game.name,
        link: `https://rawg.io/games/${game.slug}`,
        image: game.background_image,
        platforms: game.platforms?.map((p: any) => p.platform.name).join(', '),
        rate: game.rating,
        genre: game.genres?.map((g: any) => g.name).join(', '),
        releaseDate: game.released,
        length: {
          gameplayMain: game.playtime,
          gameplayMainExtra: game.playtime,
          gameplayCompletionist: game.playtime,
        },
      }));
    } else if (type.config.value === 'imdb') {
      // Search movies using OMDB API
      const response = await axios.get(`http://www.omdbapi.com/`, {
        params: {
          apikey: process.env.OMDB_API_KEY,
          s: search,
          type: 'movie',
        },
      });

      if (response.data.Search) {
        mediaData = await Promise.all(
          response.data.Search.slice(0, 5).map(async (movie: any) => {
            const details = await axios.get(`http://www.omdbapi.com/`, {
              params: {
                apikey: process.env.OMDB_API_KEY,
                i: movie.imdbID,
                plot: 'short',
              },
            });

            return {
              name: movie.Title,
              link: `https://www.imdb.com/title/${movie.imdbID}/`,
              image: movie.Poster,
              platforms: 'IMDb',
              rate: details.data.imdbRating,
              genre: details.data.Genre,
              releaseDate: details.data.Released,
              length: details.data.Runtime,
            };
          })
        );
      } else {
        mediaData = [];
      }
    }

    res.json(mediaData || []);
  } catch (error) {
    console.error('Error searching media:', error);
    res.status(500).json({ error: 'Failed to search media' });
  }
});

export default router; 