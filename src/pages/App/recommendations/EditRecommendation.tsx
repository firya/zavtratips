import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, DateRange } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Search } from 'lucide-react'

interface Podcast {
  id: number
  showType: string
  number: string
  name: string
}

interface Type {
  id: number
  value: string
}

interface Recommendation {
  id: number
  podcastId: number
  typeId: number
  name: string
  link: string
  image?: string
  platforms?: string
  rate?: number
  genre?: string
  releaseDate?: Date
  length?: string
  dima: boolean
  timur: boolean
  maksim: boolean
  guest?: string
}

export function EditRecommendation() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [releaseDate, setReleaseDate] = useState<Date | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recommendationsResponse, podcastsResponse, typesResponse] = await Promise.all([
        api.get('/api/recommendations'),
        api.get('/api/podcasts'),
        api.get('/api/recommendations/types')
      ])
      setRecommendations(recommendationsResponse.data.recommendations)
      setPodcasts(podcastsResponse.data.podcasts)
      setTypes(typesResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRecommendation) return

    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        podcastId: Number(formData.get('podcastId')),
        typeId: Number(formData.get('typeId')),
        name: formData.get('name') as string,
        link: formData.get('link') as string,
        image: formData.get('image') as string || undefined,
        platforms: formData.get('platforms') as string || undefined,
        rate: formData.get('rate') ? Number(formData.get('rate')) : undefined,
        genre: formData.get('genre') as string || undefined,
        releaseDate: releaseDate,
        length: formData.get('length') as string || undefined,
        dima: formData.get('dima') === 'on',
        timur: formData.get('timur') === 'on',
        maksim: formData.get('maksim') === 'on',
        guest: formData.get('guest') as string || undefined,
      }

      await api.put(`/api/recommendations/${selectedRecommendation.id}`, data)
      toast.success('Recommendation updated successfully')
      fetchData()
      setSelectedRecommendation(null)
    } catch (error) {
      toast.error('Failed to update recommendation')
      console.error('Error updating recommendation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) return

    try {
      await api.delete(`/api/recommendations/${id}`)
      toast.success('Recommendation deleted successfully')
      fetchData()
      setSelectedRecommendation(null)
    } catch (error) {
      toast.error('Failed to delete recommendation')
      console.error('Error deleting recommendation:', error)
    }
  }

  const filteredRecommendations = recommendations.filter((recommendation) =>
    recommendation.name.toLowerCase().includes(searchInput.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Recommendation</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search recommendations..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {selectedRecommendation ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="podcastId">Podcast</Label>
            <Select name="podcastId" defaultValue={selectedRecommendation.podcastId.toString()} required>
              <SelectTrigger>
                <SelectValue placeholder="Select podcast" />
              </SelectTrigger>
              <SelectContent>
                {podcasts.map((podcast) => (
                  <SelectItem key={podcast.id} value={podcast.id.toString()}>
                    {podcast.showType} #{podcast.number} - {podcast.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeId">Type</Label>
            <Select name="typeId" defaultValue={selectedRecommendation.typeId.toString()} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={selectedRecommendation.name}
              placeholder="Enter recommendation name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              name="link"
              required
              type="url"
              defaultValue={selectedRecommendation.link}
              placeholder="Enter recommendation link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              name="image"
              type="url"
              defaultValue={selectedRecommendation.image}
              placeholder="Enter image URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platforms">Platforms (optional)</Label>
            <Input
              id="platforms"
              name="platforms"
              defaultValue={selectedRecommendation.platforms}
              placeholder="Enter platforms"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Rate (0-10, optional)</Label>
            <Input
              id="rate"
              name="rate"
              type="number"
              min="0"
              max="10"
              step="0.1"
              defaultValue={selectedRecommendation.rate}
              placeholder="Enter rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre (optional)</Label>
            <Input
              id="genre"
              name="genre"
              defaultValue={selectedRecommendation.genre}
              placeholder="Enter genre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDate">Release Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !releaseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={releaseDate}
                  onSelect={(date: Date | DateRange | undefined) => {
                    if (date instanceof Date) {
                      setReleaseDate(date)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Length (optional)</Label>
            <Input
              id="length"
              name="length"
              defaultValue={selectedRecommendation.length}
              placeholder="Enter length"
            />
          </div>

          <div className="space-y-4">
            <Label>Hosts</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dima"
                  name="dima"
                  defaultChecked={selectedRecommendation.dima}
                />
                <Label htmlFor="dima">Dima</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timur"
                  name="timur"
                  defaultChecked={selectedRecommendation.timur}
                />
                <Label htmlFor="timur">Timur</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maksim"
                  name="maksim"
                  defaultChecked={selectedRecommendation.maksim}
                />
                <Label htmlFor="maksim">Maksim</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest">Guest (optional)</Label>
            <Input
              id="guest"
              name="guest"
              defaultValue={selectedRecommendation.guest}
              placeholder="Enter guest name"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDelete(selectedRecommendation.id)}
            >
              Delete
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedRecommendation(recommendation)
                setReleaseDate(recommendation.releaseDate)
              }}
            >
              <div>
                <h3 className="font-medium">{recommendation.name}</h3>
                <p className="text-sm text-gray-500">{recommendation.link}</p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 