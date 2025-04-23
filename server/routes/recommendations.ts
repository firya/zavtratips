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

    // Handle search parameter (fix the issue where search is not applied)
    if (req.query.search) {
      const searchCondition: Prisma.RecommendationWhereInput = {
        name: { contains: req.query.search as string, mode: 'insensitive' }
      };
      where.AND = where.AND || [];
      (where.AND as Prisma.RecommendationWhereInput[]).push(searchCondition);
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
        ...(req.query.dateFrom ? { 
          gte: new Date(new Date(req.query.dateFrom as string).setUTCHours(0, 0, 0, 0))
        } : {}),
        ...(req.query.dateTo ? { 
          lte: new Date(new Date(req.query.dateTo as string).setUTCHours(23, 59, 59, 999))
        } : {})
      };
    }

    if (Object.keys(podcastWhere).length > 0) {
      where.podcast = podcastWhere;
    }

    if (req.query.hosts) {
      const hosts = (req.query.hosts as string).split(',');
      const hostsConditions: Prisma.RecommendationWhereInput[] = hosts.map(host => {
        if (host === 'dima') return { 
          OR: [
            { dima: true },
            { dima: false }
          ]
        };
        if (host === 'timur') return { 
          OR: [
            { timur: true },
            { timur: false }
          ]
        };
        if (host === 'maksim') return { 
          OR: [
            { maksim: true },
            { maksim: false }
          ]
        };
        return { guest: { not: null } };
      });
      
      // Apply hosts conditions with AND to preserve search filter
      if (hostsConditions.length === 1) {
        where.AND = where.AND || [];
        (where.AND as Prisma.RecommendationWhereInput[]).push(hostsConditions[0]);
      } else if (hostsConditions.length > 1) {
        where.AND = where.AND || [];
        (where.AND as Prisma.RecommendationWhereInput[]).push({ OR: hostsConditions });
      }
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

// Search media (games/movies) based on type
router.get('/search-media', async (req, res) => {
  try {
    const { search, typeId } = req.query;
    console.log(`Search request with search=${search}, typeId=${typeId}`);
    
    if (!search || !typeId || search.toString().length < 2) {
      console.log('Missing search or typeId parameters, or search query is too short');
      return res.json([]);
    }

    // First get the content type configuration (e.g. "🎮 Игра")
    const contentTypeConfig = await prisma.config.findUnique({
      where: { id: Number(typeId) },
      select: { value: true }
    });

    if (!contentTypeConfig) {
      console.log(`No config found for ID ${typeId}`);
      return res.json([]);
    }

    // Then get the API configuration based on the content type value
    const apiConfig = await prisma.config.findFirst({
      where: {
        value: contentTypeConfig.value,
        NOT: { type: 'typeList' }
      },
      select: { type: true, value: true }
    });

    if (!apiConfig) {
      console.log(`No API config found for content type: ${contentTypeConfig.value}`);
      return res.json([]);
    }

    console.log(`Using API type: ${apiConfig.type} for content: ${apiConfig.value}`);

    // Use apiConfig.type to determine which API to call
    let mediaData = [];
    
    if (apiConfig.type === 'rawg') {
      try {
        const response = await axios.get(`https://api.rawg.io/api/games`, {
          params: {
            key: process.env.RAWG_API_KEY,
            search: search,
            page_size: 10,
          },
        });

        mediaData = response.data.results.map((game: any) => ({
          name: game.name,
          link: `https://rawg.io/games/${game.slug}`,
          image: game.background_image,
          platforms: game.platforms?.map((p: any) => p.platform.name).join(', '),
          rate: game.metacritic,
          genre: game.genres?.map((g: any) => g.name).join(', '),
          releaseDate: game.released,
          length: {
            gameplayMain: game.playtime,
            gameplayMainExtra: game.playtime,
            gameplayCompletionist: game.playtime,
          },
        }));
      } catch (apiError) {
        console.error('RAWG API error:', apiError);
      }
    } 
    // For movies, TV shows, etc. use OMDB/IMDB API
    else if (apiConfig.type === 'imdb') {
      try {
        const response = await axios.get(`http://www.omdbapi.com/`, {
          params: {
            apikey: process.env.OMDB_API_KEY,
            s: search,
            // Determine type based on media content type
            type: apiConfig.value.toLowerCase().includes('сериал') || apiConfig.value.toLowerCase().includes('шоу') ? 'series' : 'movie',
          },
          timeout: 10000, // 10 second timeout
        });

        if (response.data.Search) {
          mediaData = await Promise.all(
            response.data.Search.slice(0, 10).map(async (movie: any) => {
              try {
                // Add retry logic for details request
                let retries = 3;
                let detailsResponse;
                
                while (retries > 0) {
                  try {
                    detailsResponse = await axios.get(`http://www.omdbapi.com/`, {
                      params: {
                        apikey: process.env.OMDB_API_KEY,
                        i: movie.imdbID,
                        plot: 'short',
                      },
                      timeout: 10000, // 10 second timeout
                    });
                    break; // If successful, break the retry loop
                  } catch (retryError) {
                    retries--;
                    if (retries === 0) throw retryError;
                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }

                return {
                  name: movie.Title,
                  link: `https://www.imdb.com/title/${movie.imdbID}/`,
                  image: movie.Poster,
                  platforms: 'IMDb',
                  rate: detailsResponse?.data?.imdbRating,
                  genre: detailsResponse?.data?.Genre,
                  releaseDate: detailsResponse?.data?.Released,
                  length: detailsResponse?.data?.Runtime,
                };
              } catch (detailsError) {
                console.error(`Error fetching details for ${movie.imdbID}:`, detailsError);
                // Return basic info even if details fetch fails
                return {
                  name: movie.Title,
                  link: `https://www.imdb.com/title/${movie.imdbID}/`,
                  image: movie.Poster,
                  platforms: 'IMDb',
                };
              }
            })
          );
        }
      } catch (apiError) {
        console.error('OMDB API error:', apiError);
        // Return empty array instead of throwing error
        return res.json([]);
      }
    } else {
      console.log(`No suitable API found for content type: ${apiConfig.type}`);
    }

    console.log(`Found ${mediaData.length} results`);
    res.json(mediaData);
  } catch (error) {
    console.error('Error searching media:', error);
    res.status(500).json({ error: 'Failed to search media' });
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

// Create new recommendation - now automatically protected
router.post('/', async (req, res) => {
  try {
    const requestData = { ...req.body };
    
    // Transform relationship fields for Prisma
    const data: any = {};
    
    // Handle direct fields
    const directFields = [
      'name', 'image', 'platforms', 'rate', 
      'genre', 'length', 'dima', 
      'timur', 'maksim', 'guest', 'rowNumber'
    ];
    
    directFields.forEach(field => {
      if (field in requestData) {
        data[field] = requestData[field];
      }
    });
    
    // Handle link field separately as it's required
    data.link = requestData.link || "";
    
    // Handle releaseDate explicitly - if null/undefined/empty, set to null
    if ('releaseDate' in requestData) {
      data.releaseDate = requestData.releaseDate || null;
    }
    
    // Handle relationship fields
    if ('podcastId' in requestData) {
      data.podcast = {
        connect: { id: Number(requestData.podcastId) }
      };
    }
    
    if ('typeId' in requestData) {
      data.type = {
        connect: { id: Number(requestData.typeId) }
      };
    }
    
    const recommendation = await prisma.recommendation.create({
      data,
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
      '', // Empty column
      recommendation.platforms || '',
      recommendation.rate?.toString() || '',
      recommendation.genre || '',
      recommendation.releaseDate?.toLocaleDateString() || '',
      recommendation.length || '',
      recommendation.dima === true ? '👍' : recommendation.dima === false ? '❌' : '',
      recommendation.timur === true ? '👍' : recommendation.timur === false ? '❌' : '',
      recommendation.maksim === true ? '👍' : recommendation.maksim === false ? '❌' : '',
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

// Update recommendation - now automatically protected
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requestData = { ...req.body };
    
    // Transform relationship fields for Prisma
    const data: any = {};
    
    // Handle direct fields
    const directFields = [
      'name', 'image', 'platforms', 'rate', 
      'genre', 'length', 'dima', 
      'timur', 'maksim', 'guest', 'rowNumber'
    ];
    
    directFields.forEach(field => {
      if (field in requestData) {
        data[field] = requestData[field];
      }
    });
    
    // Handle link field separately as it's required
    if ('link' in requestData) {
      data.link = requestData.link || "";
    }
    
    // Handle releaseDate explicitly - if null/undefined/empty, set to null
    if ('releaseDate' in requestData) {
      data.releaseDate = requestData.releaseDate || null;
    }
    
    // Handle relationship fields
    if ('podcastId' in requestData) {
      data.podcast = {
        connect: { id: Number(requestData.podcastId) }
      };
    }
    
    if ('typeId' in requestData) {
      data.type = {
        connect: { id: Number(requestData.typeId) }
      };
    }
    
    const recommendation = await prisma.recommendation.update({
      where: { id: Number(id) },
      data,
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
        '', // Empty column
        recommendation.platforms || '',
        recommendation.rate?.toString() || '',
        recommendation.genre || '',
        recommendation.releaseDate?.toLocaleDateString() || '',
        recommendation.length || '',
        recommendation.dima === true ? '👍' : recommendation.dima === false ? '❌' : '',
        recommendation.timur === true ? '👍' : recommendation.timur === false ? '❌' : '',
        recommendation.maksim === true ? '👍' : recommendation.maksim === false ? '❌' : '',
        recommendation.guest || ''
      ]);
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Delete recommendation - now automatically protected
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the recommendation first to get the row number
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: Number(id) },
      select: { 
        id: true,
        rowNumber: true,
        name: true 
      }
    });

    console.log(`Deleting recommendation ID: ${id}, Row Number: ${recommendation?.rowNumber}, Name: ${recommendation?.name}`);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    // Instead of deleting the row, update it with empty values
    if (recommendation.rowNumber) {
      console.log(`Updating row with empty values in Google Spreadsheet, sheet: 'Рекомендации', row: ${recommendation.rowNumber}`);
      try {
        // Create an array of empty strings with the same length as the row
        const emptyRow = Array(16).fill('');
        await updateRowInSpreadsheet('Рекомендации', recommendation.rowNumber, emptyRow);
        console.log(`Successfully cleared row in Google Spreadsheet: row ${recommendation.rowNumber}`);
      } catch (spreadsheetError) {
        console.error('Error updating Google Spreadsheet:', spreadsheetError);
        return res.status(500).json({ 
          error: 'Failed to update Google Spreadsheet',
          details: spreadsheetError instanceof Error ? spreadsheetError.message : 'Unknown error'
        });
      }
    } else {
      console.warn(`No row number found for recommendation ID ${id}, skipping spreadsheet update`);
    }

    // Then delete from database after successful spreadsheet update
    try {
      await prisma.recommendation.delete({
        where: { id: Number(id) },
      });
      console.log(`Successfully deleted from database: ID ${id}`);
    } catch (dbError) {
      console.error('Error deleting from database:', dbError);
      return res.status(500).json({ 
        error: 'Updated Google Spreadsheet but failed to delete from database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      });
    }

    res.json({ 
      success: true,
      message: `Successfully deleted recommendation ID: ${id}, Name: ${recommendation.name}`
    });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to delete recommendation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 