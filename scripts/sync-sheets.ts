import { syncWithDatabase } from '../server/sheets';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database sync with Google Sheets...');
    const result = await syncWithDatabase();
    console.log('Sync completed:', result);
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 