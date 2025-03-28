import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [streams, total] = await Promise.all([
      prisma.stream.findMany({
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.stream.count(),
    ]);

    console.log('Query results:', { 
      streamsCount: streams.length,
      total,
      page,
      limit,
      skip
    });

    res.json({
      streams,
      total
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

export default router; 