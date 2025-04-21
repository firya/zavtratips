import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { google, youtube_v3 } from 'googleapis';
import { addStreamToSpreadsheet, addStreamsToSpreadsheet } from '../sheets';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const prisma = new PrismaClient();

// Setup YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
});

// Format YouTube duration to HH:MM
function formatDuration(duration: string): string {
  // ISO 8601 duration format: PT#H#M#S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '00:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Convert YouTube duration to milliseconds
function durationToMilliseconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}

// Function to sync YouTube playlist with database
export async function syncYouTubePlaylist() {
  try {
    if (!process.env.YOUTUBE_PLAYLIST_ID) {
      throw new Error('YOUTUBE_PLAYLIST_ID not set in environment variables');
    }

    console.log('Starting YouTube playlist sync...');
    let pageToken: string | undefined = undefined;
    let shouldContinue = true;
    let newVideosFound = [];

    // Step 1: Collect all new videos
    while (shouldContinue) {
      // Fetch videos from playlist
      const response: youtube_v3.Schema$PlaylistItemListResponse = await youtube.playlistItems.list({
        part: ['snippet,contentDetails'],
        playlistId: process.env.YOUTUBE_PLAYLIST_ID,
        maxResults: 50,
        pageToken: pageToken
      }).then(res => res.data);

      if (!response.items || response.items.length === 0) {
        break;
      }

      // Process videos in order (newest first)
      for (const item of response.items) {
        const videoId = item.contentDetails?.videoId;
        const title = item.snippet?.title || '';
        const publishedAt = item.snippet?.publishedAt;
        
        if (!videoId || !publishedAt) continue;

        // Convert publishedAt to Date
        const videoDate = new Date(publishedAt);
        
        // Check if this video already exists in the database
        const existingVideo = await prisma.stream.findFirst({
          where: {
            link: `https://www.youtube.com/watch?v=${videoId}`
          }
        });

        if (existingVideo) {
          // Found an existing video, stop processing
          shouldContinue = false;
          break;
        }

        // Get video details to get duration
        const videoDetails = await youtube.videos.list({
          part: ['contentDetails'],
          id: [videoId]
        });

        if (!videoDetails.data.items || videoDetails.data.items.length === 0) continue;
        
        const duration = videoDetails.data.items[0].contentDetails?.duration || 'PT0M0S';
        const formattedDuration = formatDuration(duration);
        const lengthMs = durationToMilliseconds(duration);

        // Format date as DD.MM.YYYY for spreadsheet
        const dateStr = `${videoDate.getDate().toString().padStart(2, '0')}.${(videoDate.getMonth() + 1).toString().padStart(2, '0')}.${videoDate.getFullYear()}`;

        // Add to the collection of new videos
        newVideosFound.push({
          videoId,
          title,
          videoDate,
          lengthMs,
          dateStr,
          formattedDuration
        });
      }

      // Check if there are more pages
      pageToken = response.nextPageToken || undefined;
      if (!pageToken) {
        break;
      }
    }

    // Step 2: Sort videos from oldest to newest
    newVideosFound.sort((a, b) => a.videoDate.getTime() - b.videoDate.getTime());
    
    console.log(`Found ${newVideosFound.length} new videos to add.`);
    
    if (newVideosFound.length === 0) {
      console.log('No new videos to add.');
      return { success: true, added: 0 };
    }

    // Step 3: Prepare data for batch operations
    const spreadsheetRows = newVideosFound.map(video => [
      video.dateStr,
      video.title,
      `https://www.youtube.com/watch?v=${video.videoId}`,
      video.formattedDuration
    ]);
    
    // Step 4: Add all rows to spreadsheet in a single request
    console.log('Adding videos to spreadsheet...');
    const rowNumbers = await addStreamsToSpreadsheet(spreadsheetRows);
    
    // Step 5: Add videos to database and update with rowNumbers
    console.log('Adding videos to database...');
    const newStreams = await prisma.$transaction(
      newVideosFound.map((video, index) => 
        prisma.stream.create({
          data: {
            date: video.videoDate,
            title: video.title,
            link: `https://www.youtube.com/watch?v=${video.videoId}`,
            length: video.lengthMs,
            rowNumber: rowNumbers[index]
          }
        })
      )
    );

    console.log(`YouTube playlist sync completed. Added ${newVideosFound.length} new videos.`);
    return { success: true, added: newVideosFound.length };
  } catch (error) {
    console.error('Error syncing YouTube playlist:', error);
    throw error;
  }
}

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

// Endpoint to manually trigger YouTube playlist sync
router.post('/sync-youtube', async (req, res) => {
  try {
    const result = await syncYouTubePlaylist();
    res.json(result);
  } catch (error) {
    console.error('Error running YouTube sync:', error);
    res.status(500).json({ error: 'Failed to sync YouTube playlist' });
  }
});

export default router; 