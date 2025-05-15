import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

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

function parseStreamDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return isNaN(date.getTime()) ? null : date;
}

function parseDuration(durationStr: string): number | null {
  if (!durationStr) return null;
  const [hours, minutes] = durationStr.split(':');
  if (!hours || !minutes) return null;
  return (parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000;
}

function parsePodcastDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  let day: string, month: string, year: string;
  if (dateStr.includes('.')) {
    [day, month, year] = dateStr.split('.');
  } else {
    [month, day, year] = dateStr.split('/');
  }
  if (!day || !month || !year) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return isNaN(date.getTime()) ? null : date;
}

function parsePodcastDuration(durationStr: string): number | null {
  if (!durationStr) return null;
  const [hours, minutes, seconds] = durationStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

async function parseBoolean(value: string): Promise<boolean | null> {
  if (value === '👍') return true;
  if (value === '❌') return false;
  return null;
}

async function getSheetData(sheetName: string) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_URL?.split('/')[5];
    if (!spreadsheetId) return [];

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

async function syncConfig() {
  const data = await getSheetData('Config');
  if (!data || data.length < 2) return;

  const headers = data[0];
  const rows = data.slice(1);

  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const type = headers[colIndex];
    if (!type) continue;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const value = rows[rowIndex][colIndex];
      if (!value) continue;

      try {
        const existingConfig = await prisma.config.findFirst({
          where: { type, value }
        });

        if (!existingConfig) {
          await prisma.config.create({
            data: {
              type,
              value,
              rowNumber: rowIndex + 2 // +2 because we skip header row and 1-based indexing
            }
          });
        } else {
          await prisma.config.update({
            where: { id: existingConfig.id },
            data: { rowNumber: rowIndex + 2 }
          });
        }
      } catch (error) {
        console.warn(`Failed to sync config entry for type=${type}, value=${value}:`, error);
      }
    }
  }
}

async function syncPodcasts() {
  const data = await getSheetData('Выпуски');
  if (!data || data.length < 3) return;

  const rows = data.slice(2); // Skip first two rows

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];

    const [dateStr, showType, number, , name, , duration] = row;
    const date = parsePodcastDate(dateStr);
    const length = parsePodcastDuration(duration);

    try {
      const existingPodcast = await prisma.podcast.findFirst({
        where: { showType, number }
      });

      if (existingPodcast) {
        await prisma.podcast.update({
          where: { id: existingPodcast.id },
          data: {
            date,
            name,
            length: length || 0,
            rowNumber: rowIndex + 3 // +3 because we skip two header rows and 1-based indexing
          }
        });
      } else {
        await prisma.podcast.create({
          data: {
            date,
            showType,
            number,
            name,
            length: length || 0,
            rowNumber: rowIndex + 3
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to sync podcast ${showType} ${number}:`, error);
    }
  }
}

async function syncStreams() {
  const data = await getSheetData('Стримы');
  if (!data || data.length < 3) return;

  const rows = data.slice(2); // Skip first two rows

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.length < 4) continue;

    const [dateStr, title, link, duration] = row;
    const date = parseStreamDate(dateStr);
    if (!date) continue;

    const length = parseDuration(duration);
    if (!length) continue;

    try {
      const existingStream = await prisma.stream.findFirst({
        where: { date, title }
      });

      if (existingStream) {
        await prisma.stream.update({
          where: { id: existingStream.id },
          data: {
            link,
            length,
            rowNumber: rowIndex + 3 // +3 because we skip two header rows and 1-based indexing
          }
        });
      } else {
        await prisma.stream.create({
          data: {
            date,
            title,
            link,
            length,
            rowNumber: rowIndex + 3
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to sync stream "${title}":`, error);
    }
  }
}

async function syncRecommendations() {
  const data = await getSheetData('Рекомендации');
  if (!data || data.length < 2) return;

  const rows = data.slice(1);
  console.log(`Total rows in spreadsheet: ${rows.length}`);

  let processedRows = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
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
      continue;
    }

    // Find corresponding podcast
    let podcast = null;
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

    // Find or create type in Config
    let typeConfig = await prisma.config.findFirst({
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

    if (!podcast) {
      continue;
    }

    const rowNumber = rowIndex + 2; // +2 because we skip header row and 1-based indexing

    // Find or create recommendation
    const existingRecommendation = await prisma.recommendation.findFirst({
      where: {
        podcastId: podcast.id,
        typeId: typeConfig.id,
        name,
        rowNumber // Add rowNumber to the uniqueness check
      }
    });

    if (existingRecommendation) {
      await prisma.recommendation.update({
        where: { id: existingRecommendation.id },
        data: {
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
          rowNumber
        }
      });
    } else {
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
          rowNumber
        }
      });
    }
    processedRows++;
  }

  console.log('Sync Recommendations Summary:');
  console.log(`Total rows in spreadsheet: ${rows.length}`);
  console.log(`Total rows processed: ${processedRows}`);
}

export async function syncWithDatabase() {
  try {
    console.log('Clearing existing data...');
    // Delete in reverse order of dependencies
    await prisma.recommendation.deleteMany();
    await prisma.podcast.deleteMany();
    await prisma.stream.deleteMany();
    await prisma.config.deleteMany();
    console.log('All tables cleared');

    // Sync in order of dependencies
    console.log('Starting sync...');
    await syncConfig();
    console.log('Config synced');
    await syncPodcasts();
    console.log('Podcasts synced');
    await syncRecommendations();
    console.log('Recommendations synced');
    await syncStreams();
    console.log('Streams synced');

    return { success: true, message: 'Database sync completed successfully' };
  } catch (error) {
    console.error('Failed to sync database with Google Sheets:', error);
    throw error;
  }
}

export async function addRowToSpreadsheet(sheetName: string, row: string[]) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_URL?.split('/')[5];
    if (!spreadsheetId) return;

    // Get current data to determine the next row number
    const data = await getSheetData(sheetName);
    const nextRowNumber = data.length + 1;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    return nextRowNumber;
  } catch (error) {
    console.error(`Failed to add row to ${sheetName}:`, error);
    throw error;
  }
}

export async function updateRowInSpreadsheet(sheetName: string, rowNumber: number, row: string[]) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_URL?.split('/')[5];
    if (!spreadsheetId) return;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowNumber}:Z${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });
  } catch (error) {
    console.error(`Failed to update row in ${sheetName}:`, error);
    throw error;
  }
}

export async function deleteRowFromSpreadsheet(sheetName: string, rowNumber: number) {
  try {
    console.log(`Attempting to delete row ${rowNumber} from sheet ${sheetName}`);
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_URL?.split('/')[5];
    if (!spreadsheetId) {
      console.error('No spreadsheetId found in environment variables');
      return;
    }

    console.log(`Using spreadsheetId: ${spreadsheetId}`);

    // Get the sheet ID first
    const sheet = await sheets.spreadsheets.get({
      spreadsheetId
    });

    const sheetId = sheet.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
    if (!sheetId) {
      console.error(`Sheet with name "${sheetName}" not found`);
      return;
    }

    console.log(`Found sheetId: ${sheetId} for sheet "${sheetName}"`);
    console.log(`Deleting row with startIndex: ${rowNumber - 1}, endIndex: ${rowNumber}`);

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }]
      }
    });

    console.log(`Successfully deleted row ${rowNumber} from sheet "${sheetName}"`);
  } catch (error) {
    console.error(`Failed to delete row from ${sheetName}:`, error);
    throw error;
  }
}

// Helper functions for specific sheet types
export async function addRecommendationToSpreadsheet(row: string[]) {
  return addRowToSpreadsheet('Рекомендации', row);
}

export async function updateRecommendationInSpreadsheet(rowNumber: number, row: string[]) {
  return updateRowInSpreadsheet('Рекомендации', rowNumber, row);
}

export async function deleteRecommendationFromSpreadsheet(rowNumber: number) {
  return deleteRowFromSpreadsheet('Рекомендации', rowNumber);
}

export async function addPodcastToSpreadsheet(row: string[]) {
  return addRowToSpreadsheet('Выпуски', row);
}

export async function updatePodcastInSpreadsheet(rowNumber: number, row: string[]) {
  return updateRowInSpreadsheet('Выпуски', rowNumber, row);
}

export async function deletePodcastFromSpreadsheet(rowNumber: number) {
  return deleteRowFromSpreadsheet('Выпуски', rowNumber);
}

export async function addStreamToSpreadsheet(row: string[]) {
  return addRowToSpreadsheet('Стримы', row);
}

export async function updateStreamInSpreadsheet(rowNumber: number, row: string[]) {
  return updateRowInSpreadsheet('Стримы', rowNumber, row);
}

export async function deleteStreamFromSpreadsheet(rowNumber: number) {
  return deleteRowFromSpreadsheet('Стримы', rowNumber);
}

export async function addConfigToSpreadsheet(row: string[]) {
  return addRowToSpreadsheet('Config', row);
}

export async function updateConfigInSpreadsheet(rowNumber: number, row: string[]) {
  return updateRowInSpreadsheet('Config', rowNumber, row);
}

export async function deleteConfigFromSpreadsheet(rowNumber: number) {
  return deleteRowFromSpreadsheet('Config', rowNumber);
}

export async function addRowsToSpreadsheet(sheetName: string, rows: string[][]) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_URL?.split('/')[5];
    if (!spreadsheetId) return [];

    // Get current data to determine the starting row number
    const data = await getSheetData(sheetName);
    const startRowNumber = data.length + 1;

    // Add all rows at once
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows
      }
    });

    // Return array of row numbers
    return Array.from({ length: rows.length }, (_, i) => startRowNumber + i);
  } catch (error) {
    console.error(`Failed to add rows to ${sheetName}:`, error);
    throw error;
  }
}

export async function addStreamsToSpreadsheet(rows: string[][]) {
  return addRowsToSpreadsheet('Стримы', rows);
}