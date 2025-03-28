import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.podcast.count(),
    ]);

    console.log('Query results:', { 
      podcastsCount: podcasts.length,
      total,
      page,
      limit,
      skip
    });

    res.json({
      podcasts,
      total
    });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

export default router; 