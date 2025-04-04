import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PodcastForm } from './components/PodcastForm'

interface Podcast {
  id: number
  date: string
  showType: string
  number: string
  name: string
  length: number
}

function millisecondsToHHMMSS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function EditPodcastPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await api.get(`/api/podcasts/${id}`)
        setPodcast(response.data)
      } catch (error) {
        toast.error('Failed to fetch podcast')
        console.error('Error fetching podcast:', error)
        navigate('/app/podcasts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPodcast()
  }, [id, navigate])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!podcast) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Podcast</h1>
        <h2 className="text-xl font-semibold">
          {podcast.showType} #{podcast.number}
        </h2>
      </div>

      <PodcastForm
        initialData={{
          id: podcast.id,
          date: new Date(podcast.date),
          showType: podcast.showType,
          number: podcast.number,
          name: podcast.name,
          length: millisecondsToHHMMSS(podcast.length)
        }}
        onSuccess={() => navigate('/app/podcasts')}
        onCancel={() => navigate('/app/podcasts')}
      />
    </div>
  )
} 