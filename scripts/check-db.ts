import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database contents...');
    
    const recommendations = await prisma.recommendation.findMany({
      include: {
        podcast: true,
        type: true,
      },
    });
    
    console.log('\nRecommendations:', recommendations.length);
    console.log('Sample recommendation:', recommendations[0]);
    
    const podcasts = await prisma.podcast.findMany();
    console.log('\nPodcasts:', podcasts.length);
    console.log('Sample podcast:', podcasts[0]);
    
    const configs = await prisma.config.findMany();
    console.log('\nConfigs:', configs.length);
    console.log('Sample config:', configs[0]);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 