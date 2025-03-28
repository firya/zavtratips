import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { CalendarIcon } from 'lucide-react'

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

interface RecommendationFormData {
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

export function CreateRecommendation() {
  const navigate = useNavigate()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [releaseDate, setReleaseDate] = useState<Date | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [podcastsResponse, typesResponse] = await Promise.all([
        api.get('/api/podcasts'),
        api.get('/api/recommendations/types')
      ])
      setPodcasts(podcastsResponse.data.podcasts)
      setTypes(typesResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data: RecommendationFormData = {
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

      await api.post('/api/recommendations', data)
      toast.success('Recommendation created successfully')
      navigate('/app/recommendations/edit')
    } catch (error) {
      toast.error('Failed to create recommendation')
      console.error('Error creating recommendation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Recommendation</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="podcastId">Podcast</Label>
          <Select name="podcastId" required>
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
          <Select name="typeId" required>
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
            placeholder="Enter recommendation link"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL (optional)</Label>
          <Input
            id="image"
            name="image"
            type="url"
            placeholder="Enter image URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="platforms">Platforms (optional)</Label>
          <Input
            id="platforms"
            name="platforms"
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
            placeholder="Enter rate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Genre (optional)</Label>
          <Input
            id="genre"
            name="genre"
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
              />
              <Label htmlFor="dima">Dima</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timur"
                name="timur"
              />
              <Label htmlFor="timur">Timur</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maksim"
                name="maksim"
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
            placeholder="Enter guest name"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Recommendation'}
        </Button>
      </form>
    </div>
  )
} 