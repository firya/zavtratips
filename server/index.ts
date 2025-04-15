import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import recommendationsRouter from './routes/recommendations'
import podcastsRouter from './routes/podcasts'
import streamsRouter from './routes/streams'
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

const PORT = process.env.NODE_PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})