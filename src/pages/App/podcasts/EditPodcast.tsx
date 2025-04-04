import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'

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

export function EditPodcast() {
  const navigate = useNavigate()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const fetchPodcasts = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }
      const response = await api.get(`/api/podcasts?${params}`, { signal })
      setPodcasts(response.data.podcasts)
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Error fetching podcasts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    fetchPodcasts(signal)

    return () => {
      controller.abort()
    }
  }, [fetchPodcasts])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return

    try {
      await api.delete(`/api/podcasts/${id}`)
      toast.success('Podcast deleted successfully')
      fetchPodcasts()
    } catch (error) {
      toast.error('Failed to delete podcast')
      console.error('Error deleting podcast:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Podcasts</h1>
        <Button onClick={() => navigate('/app/podcasts/create')}>
          Create Podcast
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search podcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Podcast</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {podcasts.map((podcast) => (
                <TableRow key={podcast.id}>
                  <TableCell>
                    <div className="font-medium">
                      {podcast.showType} #{podcast.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(podcast.date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/podcasts/${podcast.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(podcast.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 