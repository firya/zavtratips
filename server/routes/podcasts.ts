import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all podcasts with pagination
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

// Create new podcast
router.post('/', async (req, res) => {
  try {
    const podcast = await prisma.podcast.create({
      data: req.body,
    });
    res.json(podcast);
  } catch (error) {
    console.error('Error creating podcast:', error);
    res.status(500).json({ error: 'Failed to create podcast' });
  }
});

// Update podcast
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await prisma.podcast.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(podcast);
  } catch (error) {
    console.error('Error updating podcast:', error);
    res.status(500).json({ error: 'Failed to update podcast' });
  }
});

// Delete podcast
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.podcast.delete({
      where: { id: Number(id) },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    res.status(500).json({ error: 'Failed to delete podcast' });
  }
});

export default router; 