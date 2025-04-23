import { Router } from 'express';
import { PrismaClient, Podcast, Prisma } from '@prisma/client';
import { addPodcastToSpreadsheet, updateRowInSpreadsheet, deleteRowFromSpreadsheet } from '../sheets';
import { ParsedQs } from 'qs';

const router = Router();
const prisma = new PrismaClient();

// Get all podcasts with pagination
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const latest = req.query.latest === 'true';

    let podcasts = [];
    let total = 0;

    if (latest) {
      // Get the most recent podcast
      const latestPodcast = await prisma.podcast.findFirst({
        orderBy: { date: 'desc' }
      });
      
      podcasts = latestPodcast ? [latestPodcast] : [];
      total = latestPodcast ? 1 : 0;
    }
    else if (search) {
      // First get exact matches
      const [exactMatches, exactCount] = await Promise.all([
        prisma.podcast.findMany({
          where: { number: search },
          orderBy: { date: 'desc' }
        }),
        prisma.podcast.count({ where: { number: search } })
      ]);

      // Then get contains matches, excluding exact matches
      const [containsMatches, containsCount] = await Promise.all([
        prisma.podcast.findMany({
          where: {
            number: { contains: search },
            NOT: { number: search }
          },
          orderBy: { date: 'desc' },
          skip: Math.max(0, skip - exactCount),
          take: limit - exactMatches.length
        }),
        prisma.podcast.count({
          where: {
            number: { contains: search },
            NOT: { number: search }
          }
        })
      ]);

      podcasts = [...exactMatches, ...containsMatches];
      total = exactCount + containsCount;
    } else {
      [podcasts, total] = await Promise.all([
        prisma.podcast.findMany({
          orderBy: { date: 'desc' },
          skip,
          take: limit
        }),
        prisma.podcast.count()
      ]);
    }

    res.json({
      podcasts,
      total
    });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

// Helper function to convert HH:MM:SS to milliseconds
function timeToMilliseconds(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

// Helper function to convert milliseconds to HH:MM:SS
function millisecondsToTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Create new podcast
router.post('/', async (req, res) => {
  try {
    // Check if podcast with same showType and number already exists
    const existingPodcast = await prisma.podcast.findFirst({
      where: {
        showType: req.body.showType,
        number: req.body.number
      }
    });

    if (existingPodcast) {
      return res.status(400).json({ error: 'Podcast with this show type and number already exists' });
    }

    const podcast = await prisma.podcast.create({
      data: {
        ...req.body,
        length: req.body.length ? timeToMilliseconds(req.body.length) : 0
      },
    });

    // Add to Google Spreadsheet
    const rowNumber = await addPodcastToSpreadsheet([
      podcast.date.toLocaleDateString(),
      podcast.showType,
      podcast.number,
      `${podcast.showType} #${podcast.number}`,
      podcast.name,
      `${podcast.showType} #${podcast.number}${podcast.name ? ' - ' : ''}${podcast.name}`,
      req.body.length || '00:00:00' // Use original HH:MM:SS format for spreadsheet
    ]);

    // Update the rowNumber in the database
    await prisma.podcast.update({
      where: { id: podcast.id },
      data: { rowNumber }
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
    const { date, showType, number, name, length } = req.body;

    const updateData = {
      date,
      showType,
      number,
      name,
      length: length ? timeToMilliseconds(length) : 0
    };

    const podcast = await prisma.podcast.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Update in Google Spreadsheet
    if (podcast.rowNumber) {
      await updateRowInSpreadsheet('Выпуски', podcast.rowNumber, [
        podcast.date.toLocaleDateString(),
        podcast.showType,
        podcast.number,
        `${podcast.showType} #${podcast.number}`,
        podcast.name,
        `${podcast.showType} #${podcast.number}${podcast.name ? ' - ' : ''}${podcast.name}`,
        length || '00:00:00'
      ]);
    }

    // If date was changed, update all recommendations linked to this podcast
    if (date) {
      const recommendations = await prisma.recommendation.findMany({
        where: { podcastId: podcast.id },
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

      // Update each recommendation's row in the spreadsheet
      for (const recommendation of recommendations) {
        if (recommendation.rowNumber) {
          await updateRowInSpreadsheet('Рекомендации', recommendation.rowNumber, [
            podcast.date.toLocaleDateString(), // Use updated podcast date
            `${podcast.showType} #${podcast.number}`,
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
      }
    }

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
    const podcastId = Number(id);
    
    // Get the podcast first to get the row number
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
      select: { rowNumber: true, name: true, showType: true, number: true }
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    // First, find all recommendations associated with this podcast
    const recommendations = await prisma.recommendation.findMany({
      where: { podcastId: podcastId },
      select: { id: true, rowNumber: true }
    });

    console.log(`Found ${recommendations.length} recommendations associated with podcast ${podcastId}`);

    // Delete all associated recommendations from spreadsheet and database
    for (const recommendation of recommendations) {
      try {
        // Clear the row in Google Spreadsheet
        if (recommendation.rowNumber) {
          console.log(`Clearing recommendation row ${recommendation.rowNumber} from spreadsheet`);
          const emptyRow = Array(16).fill('');
          await updateRowInSpreadsheet('Рекомендации', recommendation.rowNumber, emptyRow);
        }

        // Delete from database
        console.log(`Deleting recommendation ${recommendation.id} from database`);
        await prisma.recommendation.delete({
          where: { id: recommendation.id }
        });
      } catch (recError) {
        console.error(`Error deleting recommendation ${recommendation.id}:`, recError);
        // Continue with other recommendations even if one fails
      }
    }

    // Now that all associated recommendations are deleted, delete the podcast
    console.log(`Deleting podcast ${podcastId} (${podcast.showType} #${podcast.number} - ${podcast.name})`);
    
    // Delete from database
    await prisma.podcast.delete({
      where: { id: podcastId },
    });

    // Delete from Google Spreadsheet
    if (podcast?.rowNumber) {
      await deleteRowFromSpreadsheet('Выпуски', podcast.rowNumber);
    }

    res.json({ 
      success: true, 
      message: `Successfully deleted podcast and ${recommendations.length} associated recommendations`
    });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    res.status(500).json({ 
      error: 'Failed to delete podcast',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to format duration from HH:MM to HH:MM:SS
function formatDuration(timeStr: string): string {
  // If the time string already has seconds, return it as is
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return `${timeStr}:00`;
    }
    return timeStr;
  }
  return timeStr;
}

// Get available show types
router.get('/show-types', async (req, res) => {
  try {
    const showTypes = await prisma.config.findMany({
      where: {
        type: 'showTypeList'
      },
      select: {
        id: true,
        value: true,
      },
    });
    res.json(showTypes);
  } catch (error) {
    console.error('Error fetching show types:', error);
    res.status(500).json({ error: 'Failed to fetch show types' });
  }
});

// Get last episode number for a show type
router.get('/last-number', async (req, res) => {
  try {
    const { showType } = req.query

    if (!showType) {
      return res.status(400).json({ error: 'Show type is required' })
    }

    const lastPodcast = await prisma.podcast.findFirst({
      where: {
        showType: showType as string
      },
      orderBy: {
        rowNumber: 'desc'
      },
      select: {
        number: true
      }
    })

    res.json({ lastNumber: lastPodcast ? parseInt(lastPodcast.number) : null })
  } catch (error) {
    console.error('Error fetching last episode number:', error)
    res.status(500).json({ error: 'Failed to fetch last episode number' })
  }
})

// Get single podcast by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await prisma.podcast.findUnique({
      where: { id: Number(id) },
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    res.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({ error: 'Failed to fetch podcast' });
  }
});

export default router; 