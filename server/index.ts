import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import cron from 'node-cron'
import recommendationsRouter from './routes/recommendations'
import podcastsRouter from './routes/podcasts'
import streamsRouter, { syncYouTubePlaylist } from './routes/streams'
import statsRouter from './routes/stats'
import bot from './bot'
import configRouter from './routes/config'
import { syncWithDatabase } from './sheets'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// API routes
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/podcasts', podcastsRouter)
app.use('/api/streams', streamsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/config', configRouter)

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

const PORT = process.env.NODE_PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('Daily sync tasks scheduled for midnight')
})