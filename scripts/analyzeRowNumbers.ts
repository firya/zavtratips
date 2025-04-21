import { PrismaClient, Podcast, Config } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Known gaps from the analysis
const knownGaps = [
  558,
  1098,
  1307,
  1418, 1419, 1420, 1421, // range 1418-1421
  1491,
  1693,
  1702,
  1759,
  2392
];

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function getSheetData(sheetName: string) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_URL?.split('/')[5];
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID not found in environment variables');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
}

// Helper functions for parsing data
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  let [day, month, year] = dateStr.split('.');
  if (!month) {
    [month, day, year] = dateStr.split('/');
  }
  if (!day || !month || !year) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return isNaN(date.getTime()) ? null : date;
}

async function parseBoolean(value: string | null): Promise<boolean | null> {
  if (!value) return null;
  if (value === '👍') return true;
  if (value === '❌') return false;
  return null;
}

async function syncGapRows() {
  try {
    console.log('Fetching data from spreadsheet...');
    const spreadsheetData = await getSheetData('Рекомендации');
    if (!spreadsheetData || spreadsheetData.length < 2) {
      console.log('No data found in spreadsheet');
      return;
    }

    // Clear recommendations table
    console.log('\nClearing recommendations table...');
    await prisma.recommendation.deleteMany();
    console.log('Recommendations table cleared');

    // Get rows for known gaps
    const gapRows: Array<{ rowNum: number; data: string[] }> = [];
    for (const rowNum of knownGaps) {
      const rowIndex = rowNum - 2; // -2 because spreadsheet is 1-based and has header
      if (rowIndex >= 0 && rowIndex < spreadsheetData.length) {
        gapRows.push({ rowNum, data: spreadsheetData[rowIndex] });
      }
    }

    console.log(`\nFound ${gapRows.length} rows to sync`);

    // Try to add gap rows
    let successCount = 0;
    for (const { rowNum, data: row } of gapRows) {
      try {
        const [
          dateStr = '',
          showAndNumber = '',
          type = '',
          name = '',
          link = '',
          image = null,
          description = null,
          platforms = null,
          rate = null,
          genre = null,
          releaseDate = null,
          length = null,
          dima = null,
          timur = null,
          maksim = null,
          guest = null
        ] = row;

        if (!type || !name) {
          console.log(`Skipping invalid row: ${row.join(', ')}`);
          continue;
        }

        // Find corresponding podcast
        let podcast: Podcast | null = null;
        const match = showAndNumber.match(/^(.+?)\s+#(\d+)/);
        if (match) {
          const [_, showType, number] = match;
          podcast = await prisma.podcast.findFirst({
            where: { showType, number }
          });
        }

        if (!podcast && dateStr) {
          const date = parseDate(dateStr);
          if (date) {
            podcast = await prisma.podcast.findFirst({
              where: {
                date: {
                  gte: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
                  lte: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)
                }
              },
              orderBy: { date: 'desc' }
            });
          }
        }

        if (!podcast) {
          console.log(`Could not find podcast for row: ${showAndNumber}`);
          continue;
        }

        // Find or create type in Config
        let typeConfig: Config | null = await prisma.config.findFirst({
          where: { type: 'typeList', value: type }
        });

        if (!typeConfig) {
          typeConfig = await prisma.config.create({
            data: {
              type: 'typeList',
              value: type
            }
          });
        }

        // Create recommendation
        await prisma.recommendation.create({
          data: {
            podcastId: podcast.id,
            typeId: typeConfig.id,
            name,
            link,
            image,
            platforms,
            rate: rate ? parseFloat(rate) : null,
            genre,
            releaseDate: releaseDate ? parseDate(releaseDate) : null,
            length,
            dima: await parseBoolean(dima),
            timur: await parseBoolean(timur),
            maksim: await parseBoolean(maksim),
            guest,
            rowNumber: rowNum
          }
        });
        successCount++;
        console.log(`Successfully synced row ${rowNum}: ${name}`);
      } catch (error) {
        console.error(`Error adding row: ${row.join(', ')}`, error);
      }
    }

    console.log(`\nSync completed! Successfully synced ${successCount} out of ${gapRows.length} rows`);

  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncGapRows(); 