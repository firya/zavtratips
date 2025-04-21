import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Get total episodes count
    const totalEpisodes = await prisma.podcast.count({
      where: {
        showType: "Zavtracast"
      }
    });

    // Get total length of all episodes
    const totalLength = await prisma.podcast.aggregate({
      where: {
        showType: "Zavtracast"
      },
      _sum: {
        length: true
      }
    });

    // Get total recommendations count
    const totalRecommendations = await prisma.recommendation.count();

    // Get recommendations by host using separate queries
    const [dimaCount, timurCount, maksimCount, guestCount] = await Promise.all([
      prisma.recommendation.count({ where: { dima: true } }),
      prisma.recommendation.count({ where: { timur: true } }),
      prisma.recommendation.count({ where: { maksim: true } }),
      prisma.recommendation.count({ where: { guest: { not: null } } })
    ]);

    // Get recommendations by type with Config relation
    const recommendationsByType = await prisma.recommendation.groupBy({
      by: ['typeId'],
      _count: {
        typeId: true
      }
    });

    // Get all types from Config table
    const types = await prisma.config.findMany({
      where: {
        type: 'typeList'
      },
      select: {
        id: true,
        value: true
      }
    });

    // Create a map of type IDs to their names
    const typeMap = types.reduce((acc, curr) => {
      acc[curr.id] = curr.value;
      return acc;
    }, {} as Record<number, string>);

    // Transform recommendations by type into the required format
    const typeStats = recommendationsByType.reduce((acc, curr) => {
      const typeName = typeMap[curr.typeId];
      if (typeName) {
        acc[typeName] = curr._count.typeId;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get episodes by week for the heatmap
    const episodesByWeek = await prisma.podcast.findMany({
      select: {
        date: true,
        length: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Process recommendations by host
    const hostStats = {
      dima: dimaCount,
      timur: timurCount,
      maksim: maksimCount,
      guests: guestCount
    };

    res.json({
      totalEpisodes,
      totalLength: totalLength._sum.length || 0,
      totalRecommendations,
      hostStats,
      typeStats,
      episodesByWeek
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router; 