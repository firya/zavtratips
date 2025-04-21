import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import cron from 'node-cron'
import path from 'path'
import { fileURLToPath } from 'url'
import recommendationsRouter from './routes/recommendations'
import podcastsRouter from './routes/podcasts'
import streamsRouter, { syncYouTubePlaylist } from './routes/streams'
import statsRouter from './routes/stats'
import bot, { initBot } from './bot'
import configRouter from './routes/config'
import { syncWithDatabase } from './sheets'

dotenv.config()

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const prisma = new PrismaClient()

// Function to test database connection with retry logic
const connectToDatabase = async (retries = 5, delay = 5000) => {
  let currentAttempt = 0;
  
  while (currentAttempt < retries) {
    try {
      console.log(`Attempting to connect to database (attempt ${currentAttempt + 1}/${retries})...`);
      // Try to execute a simple query to test the connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('Successfully connected to database!');
      
      // If we're here, connection was successful - run migrations if needed
      try {
        console.log('Running database migrations...');
        // Run prisma migrate deploy using exec
        const { exec } = await import('child_process');
        await new Promise((resolve, reject) => {
          exec('npx prisma migrate deploy', (error, stdout, stderr) => {
            if (error) {
              console.error(`Migration error: ${error.message}`);
              reject(error);
              return;
            }
            if (stderr) {
              console.log(`Migration stderr: ${stderr}`);
            }
            console.log(`Migration stdout: ${stdout}`);
            resolve(stdout);
          });
        });
        console.log('Database migrations completed successfully');
      } catch (migrationError) {
        console.error('Failed to run migrations:', migrationError);
        // Continue anyway since the database is connected
      }
      
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      currentAttempt++;
      
      if (currentAttempt >= retries) {
        console.error('Maximum connection attempts reached. Giving up.');
        return false;
      }
      
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

// CORS configuration based on environment
const isDevelopment = process.env.NODE_ENV !== 'production'
const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:5173', 'http://127.0.0.1:5173'] // Development origins
    : process.env.ALLOWED_ORIGINS?.split(',') || [], // Production origins from env
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())

// API routes
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/podcasts', podcastsRouter)
app.use('/api/streams', streamsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/config', configRouter)

// Serve static files from the React app build directory
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))

app.post('/api/sync', async (req, res) => {
  try {
    // Send initial response
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    })

    // Use the syncWithDatabase function with progress callbacks
    const result = await syncWithDatabase()
    
    // Send final result
    res.write(JSON.stringify(result))
    res.end()
  } catch (error) {
    console.error('Failed to sync database:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to sync database' })
    } else {
      res.write(JSON.stringify({ error: 'Failed to sync database' }))
      res.end()
    }
  }
})

// Serve React SPA for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Schedule YouTube playlist sync daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily sync tasks')
  try {
    // First sync YouTube playlist
    console.log('Starting YouTube playlist sync...')
    await syncYouTubePlaylist()
    console.log('YouTube playlist sync completed successfully')
    
    // Then sync spreadsheet data with database
    console.log('Starting database sync with spreadsheet...')
    await syncWithDatabase()
    console.log('Database sync with spreadsheet completed successfully')
  } catch (error) {
    console.error('Error in daily sync tasks:', error)
  }
})

const PORT = parseInt(process.env.NODE_PORT || '3001', 10)

// Start the server
const startServer = async () => {
  try {
    // First make sure we can connect to the database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      console.error('Could not connect to database after multiple attempts. Starting server anyway...');
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
      console.log('Daily sync tasks scheduled for midnight')
      console.log(`Serving frontend from ${distPath}`)
    })
    
    // Initialize bot with localtunnel if we're in development mode
    if (isDevelopment) {
      const { tunnel, bot } = await initBot(PORT)
      console.log('Telegram bot initialized')
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('Shutting down server and bot')
        server.close()
        tunnel?.close()
        process.exit(0)
      })
    } else {
      console.log('Skipping localtunnel in production mode')
    }
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()