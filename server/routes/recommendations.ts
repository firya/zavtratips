import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { addRecommendationToSpreadsheet, updateRowInSpreadsheet, deleteRowFromSpreadsheet } from '../sheets';

const router = Router();
const prisma = new PrismaClient();

// Get available podcasts
router.get('/podcasts', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;

    const podcasts = await prisma.podcast.findMany({
      select: {
        id: true,
        showType: true,
        number: true,
        name: true,
      },
      where: search ? {
        OR: [
          { showType: { contains: search, mode: 'insensitive' } },
          { number: { contains: search, mode: 'insensitive' } },
          ...(/^\d+$/.test(search) ? [{ number: search }] : []),
        ],
      } : undefined,
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

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
          podcast: {
            date: 'desc'
          }
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

export default router; 