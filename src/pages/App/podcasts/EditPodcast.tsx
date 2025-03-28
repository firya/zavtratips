import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Pencil, Trash2 } from 'lucide-react'

interface Podcast {
  id: number
  date: string
  showType: string
  number: string
  name: string
  length: number
}

export function EditPodcast() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const fetchPodcasts = async () => {
    try {
      const response = await api.get('/api/podcasts')
      setPodcasts(response.data.podcasts)
    } catch (error) {
      console.error('Error fetching podcasts:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPodcast) return

    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        date: new Date(formData.get('date') as string),
        showType: formData.get('showType') as string,
        number: formData.get('number') as string,
        name: formData.get('name') as string,
        length: Number(formData.get('length')),
      }

      await api.put(`/api/podcasts/${selectedPodcast.id}`, data)
      toast.success('Podcast updated successfully')
      setSelectedPodcast(null)
      fetchPodcasts()
    } catch (error) {
      toast.error('Failed to update podcast')
      console.error('Error updating podcast:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const filteredPodcasts = podcasts.filter(podcast => {
    const searchLower = search.toLowerCase()
    return (
      podcast.showType.toLowerCase().includes(searchLower) ||
      podcast.number.toLowerCase().includes(searchLower) ||
      podcast.name.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Podcasts</h1>

      {selectedPodcast ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Editing: {selectedPodcast.showType} #{selectedPodcast.number}</h2>
            <Button
              variant="ghost"
              onClick={() => setSelectedPodcast(null)}
            >
              Cancel
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={format(new Date(selectedPodcast.date), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="showType">Show Type</Label>
              <Input
                id="showType"
                name="showType"
                required
                defaultValue={selectedPodcast.showType}
                placeholder="Enter show type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input
                id="number"
                name="number"
                required
                defaultValue={selectedPodcast.number}
                placeholder="Enter episode number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={selectedPodcast.name}
                placeholder="Enter episode name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length (minutes)</Label>
              <Input
                id="length"
                name="length"
                type="number"
                required
                min="1"
                defaultValue={selectedPodcast.length}
                placeholder="Enter episode length in minutes"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Search podcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <div className="border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredPodcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="font-medium">
                    {podcast.showType} #{podcast.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {podcast.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPodcast(podcast)}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 