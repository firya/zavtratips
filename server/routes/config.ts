import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all config data
router.get('/', async (req, res) => {
  try {
    // Get all configs
    const configs = await prisma.config.findMany({
      select: {
        id: true,
        type: true,
        value: true,
      },
    });

    // Group configs by type
    const groupedConfigs = configs.reduce((acc, config) => {
      if (!acc[config.type]) {
        acc[config.type] = [];
      }
      acc[config.type].push({
        id: config.id,
        value: config.value
      });
      return acc;
    }, {} as Record<string, { id: number; value: string }[]>);

    // Get unique hosts from recommendations
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

    res.json({
      showTypes: groupedConfigs.showList || [],
      types: groupedConfigs.typeList || [],
      hosts: Array.from(uniqueHosts),
      reactions: groupedConfigs.reactionList || []
    });
  } catch (error) {
    console.error('Error fetching configs:', error);
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

export default router; 