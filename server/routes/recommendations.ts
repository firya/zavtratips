import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get available types
router.get('/types', async (req, res) => {
  try {
    const types = await prisma.config.findMany({
      where: {
        type: 'typeList'
      },
      select: {
        value: true,
      },
    });
    res.json(types.map(t => t.value));
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// Get available podcasts
router.get('/podcasts', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;

    const podcasts = await prisma.podcast.findMany({
      select: {
        showType: true,
        number: true,
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

// Get available hosts
router.get('/hosts', async (req, res) => {
  try {
    const hosts = await prisma.recommendation.findMany({
      select: {
        dima: true,
        timur: true,
        maksim: true,
        guest: true,
      },
    });
    
    const uniqueHosts = new Set<string>();
    hosts.forEach(host => {
      if (host.dima) uniqueHosts.add('dima');
      if (host.timur) uniqueHosts.add('timur');
      if (host.maksim) uniqueHosts.add('maksim');
      if (host.guest) uniqueHosts.add(host.guest);
    });
    
    res.json(Array.from(uniqueHosts));
  } catch (error) {
    console.error('Error fetching hosts:', error);
    res.status(500).json({ error: 'Failed to fetch hosts' });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Parse filters from query
    const search = req.query.search as string;
    const podcastShowType = req.query.podcastShowType as string;
    const podcastNumber = req.query.podcastNumber as string;
    const type = req.query.type as string;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;
    const hosts = (req.query.hosts as string)?.split(',') || [];

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    if (podcastShowType && podcastNumber) {
      where.podcast = {
        showType: podcastShowType,
        number: podcastNumber,
      };
    }
    
    if (type) {
      where.type = {
        value: type,
      };
    }
    
    if (dateFrom || dateTo) {
      where.podcast = {
        ...where.podcast,
        date: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      };
    }
    
    if (hosts.length > 0) {
      where.OR = hosts.map(host => {
        if (host === 'dima' || host === 'timur' || host === 'maksim') {
          return { [host]: true };
        }
        // For guests, we check if the guest field matches the host name
        return { guest: host };
      });
    }

    const [recommendations, total] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        select: {
          id: true,
          name: true,
          link: true,
          image: true,
          platforms: true,
          rate: true,
          length: true,
          podcast: {
            select: {
              showType: true,
              number: true,
              date: true,
            },
          },
          type: {
            select: {
              value: true,
            },
          },
          dima: true,
          timur: true,
          maksim: true,
          guest: true,
        },
        orderBy: {
          podcast: {
            date: 'desc',
          },
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

export default router; 