import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Search, ExternalLink, X } from 'lucide-react'
import { useConfigStore } from '@/stores/config'
import { useDebounce } from '@/hooks/useDebounce'
import { MediaDetailsCard } from './MediaDetailsCard/MediaDetailsCard'

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

interface MediaItem {
  name: string
  link: string
  image: string
  platforms: string
  rate: number
  genre: string
  releaseDate: string
  length: string | { gameplayMain: number; gameplayMainExtra: number; gameplayCompletionist: number }
}

interface Recommendation {
  id?: number
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
  dima: boolean | null
  timur: boolean | null
  maksim: boolean | null
  guest?: string
}

interface RecommendationFormProps {
  initialData?: Recommendation
  onSuccess?: () => void
  onCancel?: () => void
}

export function RecommendationForm({ initialData, onSuccess, onCancel }: RecommendationFormProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [podcastSearch, setPodcastSearch] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [isPodcastDropdownOpen, setIsPodcastDropdownOpen] = useState(false)
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(initialData?.releaseDate)
  const [isLoading, setIsLoading] = useState(false)
  const { types, isLoading: isConfigLoading, error: configError, fetchConfigs } = useConfigStore()

  const debouncedPodcastSearch = useDebounce(podcastSearch, 300)
  const debouncedNameSearch = useDebounce(nameSearch, 300)

  useEffect(() => {
    fetchData()
    fetchConfigs()
  }, [fetchConfigs])

  const fetchData = async () => {
    try {
      const podcastsResponse = await api.get('/api/podcasts')
      setPodcasts(podcastsResponse.data.podcasts)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchMedia = useCallback(async (search: string, typeId: string) => {
    if (!search || !typeId) {
      setMediaItems([])
      return
    }
    try {
      const response = await api.get(`/recommendations/search-media?search=${search}&typeId=${typeId}`)
      setMediaItems(response.data)
    } catch (error) {
      console.error('Error fetching media:', error)
    }
  }, [])

  useEffect(() => {
    if (configError) {
      toast.error(configError)
    }
  }, [configError])

  useEffect(() => {
    if (debouncedPodcastSearch) {
      const filteredPodcasts = podcasts.filter(podcast => 
        podcast.showType.toLowerCase().includes(debouncedPodcastSearch.toLowerCase()) ||
        podcast.number.toLowerCase().includes(debouncedPodcastSearch.toLowerCase()) ||
        podcast.name.toLowerCase().includes(debouncedPodcastSearch.toLowerCase())
      )
      setPodcasts(filteredPodcasts)
    } else {
      fetchData()
    }
  }, [debouncedPodcastSearch])

  useEffect(() => {
    if (debouncedNameSearch && initialData?.typeId) {
      fetchMedia(debouncedNameSearch, initialData.typeId.toString())
    }
  }, [debouncedNameSearch, initialData?.typeId, fetchMedia])

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media)
    // Update form values with media data
    const form = document.querySelector('form')
    if (form) {
      const nameInput = form.querySelector('[name="name"]') as HTMLInputElement
      const linkInput = form.querySelector('[name="link"]') as HTMLInputElement
      const imageInput = form.querySelector('[name="image"]') as HTMLInputElement
      const platformsInput = form.querySelector('[name="platforms"]') as HTMLInputElement
      const rateInput = form.querySelector('[name="rate"]') as HTMLInputElement
      const genreInput = form.querySelector('[name="genre"]') as HTMLInputElement
      const releaseDateInput = form.querySelector('[name="releaseDate"]') as HTMLInputElement
      const lengthInput = form.querySelector('[name="length"]') as HTMLInputElement

      if (nameInput) nameInput.value = media.name
      if (linkInput) linkInput.value = media.link
      if (imageInput) imageInput.value = media.image
      if (platformsInput) platformsInput.value = media.platforms
      if (rateInput) rateInput.value = media.rate?.toString() || ''
      if (genreInput) genreInput.value = media.genre || ''
      if (releaseDateInput) releaseDateInput.value = media.releaseDate || ''
      if (lengthInput) lengthInput.value = typeof media.length === 'string' ? media.length : JSON.stringify(media.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data: Recommendation = {
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
        dima: formData.get('dima') === 'true' ? true : formData.get('dima') === 'false' ? false : null,
        timur: formData.get('timur') === 'true' ? true : formData.get('timur') === 'false' ? false : null,
        maksim: formData.get('maksim') === 'true' ? true : formData.get('maksim') === 'false' ? false : null,
        guest: formData.get('guest') as string || undefined,
      }

      if (initialData?.id) {
        await api.put(`/api/recommendations/${initialData.id}`, data)
        toast.success('Recommendation updated successfully')
      } else {
        await api.post('/api/recommendations', data)
        toast.success('Recommendation created successfully')
      }
      
      onSuccess?.()
    } catch (error) {
      toast.error(initialData?.id ? 'Failed to update recommendation' : 'Failed to create recommendation')
      console.error('Error saving recommendation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="podcastId">Podcast</Label>
        <div className="relative">
          <Input
            placeholder="Search podcast..."
            value={podcastSearch}
            onChange={(e) => {
              setPodcastSearch(e.target.value)
              setIsPodcastDropdownOpen(true)
              const filteredPodcasts = podcasts.filter(podcast => 
                podcast.showType.toLowerCase().includes(e.target.value.toLowerCase()) ||
                podcast.number.toLowerCase().includes(e.target.value.toLowerCase()) ||
                podcast.name.toLowerCase().includes(e.target.value.toLowerCase())
              )
              setPodcasts(filteredPodcasts)
            }}
            onFocus={() => setIsPodcastDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsPodcastDropdownOpen(false), 200)}
            className="h-10"
          />
          {podcastSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => {
                setPodcastSearch('')
                fetchData()
                setIsPodcastDropdownOpen(false)
              }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {isPodcastDropdownOpen && podcasts.length > 0 && (
            <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10">
              {podcasts.map((podcast) => (
                <button
                  key={podcast.id}
                  type="button"
                  className="w-full p-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    const form = document.querySelector('form')
                    if (form) {
                      const podcastIdInput = form.querySelector('[name="podcastId"]') as HTMLInputElement
                      if (podcastIdInput) {
                        podcastIdInput.value = podcast.id.toString()
                        setPodcastSearch(`${podcast.showType} #${podcast.number} - ${podcast.name}`)
                        setIsPodcastDropdownOpen(false)
                      }
                    }
                  }}
                >
                  {podcast.showType} #{podcast.number} - {podcast.name}
                </button>
              ))}
            </div>
          )}
          <input type="hidden" name="podcastId" value={initialData?.podcastId} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="typeId">Type</Label>
        <Select name="typeId" defaultValue={initialData?.typeId.toString()} required>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="name"
            name="name"
            required
            placeholder="Search name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="pl-10"
          />
          {mediaItems.length > 0 && (
            <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg">
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full p-2 text-left hover:bg-gray-100"
                  onClick={() => handleMediaSelect(media)}
                >
                  {media.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <div className="flex gap-2">
          <Input
            id="link"
            name="link"
            required
            type="url"
            defaultValue={initialData?.link}
            placeholder="Enter recommendation link"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => window.open(initialData?.link, '_blank')}
            disabled={!initialData?.link}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MediaDetailsCard
        imageUrl={initialData?.image}
        platforms={initialData?.platforms}
        rate={initialData?.rate}
        genre={initialData?.genre}
        releaseDate={initialData?.releaseDate}
        length={initialData?.length}
      />

      <div className="space-y-2">
        <Label htmlFor="image">Image URL (optional)</Label>
        <Input
          id="image"
          name="image"
          type="url"
          defaultValue={initialData?.image}
          placeholder="Enter image URL"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platforms">Platforms (optional)</Label>
        <Input
          id="platforms"
          name="platforms"
          defaultValue={initialData?.platforms}
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
          defaultValue={initialData?.rate}
          placeholder="Enter rate"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="genre">Genre (optional)</Label>
        <Input
          id="genre"
          name="genre"
          defaultValue={initialData?.genre}
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
              onSelect={(date) => setReleaseDate(date as Date)}
              defaultMonth={releaseDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="length">Length (optional)</Label>
        <Input
          id="length"
          name="length"
          defaultValue={initialData?.length}
          placeholder="Enter length"
        />
      </div>

      <div className="space-y-4">
        <Label>Hosts</Label>
        <div className="grid grid-cols-3 gap-4">
          {['dima', 'timur', 'maksim'].map((host) => (
            <div key={host} className="space-y-2">
              <Label className="text-sm capitalize">{host}</Label>
              <Select
                name={host}
                defaultValue={initialData?.[host as keyof Recommendation]?.toString() || 'null'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Not specified</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest">Guest (optional)</Label>
        <Input
          id="guest"
          name="guest"
          defaultValue={initialData?.guest}
          placeholder="Enter guest name"
        />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isLoading || isConfigLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Saving...</span>
            </div>
          ) : (
            initialData?.id ? 'Save Changes' : 'Save Recommendation'
          )}
        </Button>
      </div>
    </form>
  )
} 