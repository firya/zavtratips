import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useConfigStore } from '@/stores/config'
import { usePodcastStore, Podcast as StorePodcast } from '@/stores/podcasts'
import { useRecommendationsStore, MediaItem } from '@/stores/recommendations'
import { useDebounce } from '@/hooks/useDebounce'
import { PodcastField, Podcast as PodcastFieldPodcast, ClearableSelect } from '@/components/common'

// Define our internal podcast interface matching what we need
interface PodcastInfo {
  id?: number
  showType: string
  number: string
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
  initialLatestPodcast?: PodcastInfo | null
  onSuccess?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

// Function to parse name from format: "{original name} / {other names} ({description})"
const parseRecommendationName = (fullName: string) => {
  let originalName = fullName;
  let otherNames = '';
  let description = '';

  // Extract description from parentheses at the end if it exists
  const descriptionMatch = fullName.match(/\s*\((.*?)\)\s*$/);
  if (descriptionMatch) {
    description = descriptionMatch[1];
    fullName = fullName.replace(/\s*\((.*?)\)\s*$/, '').trim();
  }

  // Split by " / " to separate original name and other names
  const nameParts = fullName.split(' / ');
  if (nameParts.length > 1) {
    originalName = nameParts[0].trim();
    // Take only the first other name to avoid duplicates
    otherNames = nameParts[1].trim();
  } else {
    originalName = fullName.trim();
  }

  return { originalName, otherNames, description };
};

// Function to compose name back to format: "{original name} / {other names} ({description})"
const composeRecommendationName = (originalName: string, otherNames: string, description: string) => {
  let fullName = originalName.trim();
  
  // Only add other names if they exist and are different from the original name
  if (otherNames.trim() && otherNames.trim() !== originalName.trim()) {
    fullName += ` / ${otherNames.trim()}`;
  }
  
  if (description.trim()) {
    fullName += ` (${description.trim()})`;
  }
  
  return fullName;
};

export function RecommendationForm({ 
  initialData, 
  initialLatestPodcast, 
  onSuccess, 
  onCancel, 
  isLoading: parentIsLoading 
}: RecommendationFormProps) {
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastInfo | null>(null)
  
  // Parse the initial name into components
  const initialParsedName = initialData?.name ? parseRecommendationName(initialData.name) : { originalName: '', otherNames: '', description: '' };
  
  // State for name components - each is independent
  const [originalName, setOriginalName] = useState(initialParsedName.originalName);
  const [otherNames, setOtherNames] = useState(initialParsedName.otherNames);
  const [nameDescription, setNameDescription] = useState(initialParsedName.description);
  
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(initialData?.releaseDate)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [selectedTypeId, setSelectedTypeId] = useState<string>(initialData?.typeId?.toString() || '')
  const [isSearching, setIsSearching] = useState(false)
  const [lastSearched, setLastSearched] = useState({ query: '', typeId: '' })
  const [linkValue, setLinkValue] = useState(initialData?.link || '')
  const [imageValue, setImageValue] = useState(initialData?.image || '')
  const [platformsValue, setPlatformsValue] = useState(initialData?.platforms || '')
  const [rateValue, setRateValue] = useState(initialData?.rate?.toString() || '')
  const [genreValue, setGenreValue] = useState(initialData?.genre || '')
  const [isMediaDetailsOpen, setIsMediaDetailsOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const { types, isLoading: isConfigLoading, error: configError, fetchConfigs } = useConfigStore()
  const { 
    availablePodcasts, 
    currentPodcast,
    fetchPodcasts, 
    fetchPodcast 
  } = usePodcastStore()
  
  const { 
    mediaItems, 
    isLoading: isRecommendationLoading,
    searchMedia,
    createRecommendation,
    updateRecommendation
  } = useRecommendationsStore()

  // Combined loading state from parent and local states
  const isFormLoading = parentIsLoading || isRecommendationLoading || isConfigLoading;

  const debouncedOriginalName = useDebounce(originalName, 300)

  // Update form state when initialData changes
  useEffect(() => {
    if (initialData) {
      // Parse the name into components
      const parsedName = initialData.name ? parseRecommendationName(initialData.name) : { originalName: '', otherNames: '', description: '' };
      setOriginalName(parsedName.originalName);
      setOtherNames(parsedName.otherNames);
      setNameDescription(parsedName.description);
      
      // Update all other form fields
      setReleaseDate(initialData.releaseDate);
      setSelectedTypeId(initialData.typeId?.toString() || '');
      setLinkValue(initialData.link || '');
      setImageValue(initialData.image || '');
      setPlatformsValue(initialData.platforms || '');
      setRateValue(initialData.rate?.toString() || '');
      setGenreValue(initialData.genre || '');
    }
  }, [initialData]);

  // Set the initial latest podcast if provided
  useEffect(() => {
    if (!initialData && initialLatestPodcast && !selectedPodcast) {
      setSelectedPodcast(initialLatestPodcast);
    }
  }, [initialLatestPodcast, initialData, selectedPodcast]);

  useEffect(() => {
    fetchConfigs()
    
    // If we have initialData, fetch the selected podcast
    if (initialData?.podcastId) {
      fetchPodcast(initialData.podcastId)
    }
  }, [fetchConfigs, initialData?.podcastId, fetchPodcast])

  useEffect(() => {
    if (currentPodcast) {
      setSelectedPodcast(currentPodcast)
    }
  }, [currentPodcast])

  const handlePodcastChange = (podcast: PodcastFieldPodcast | null) => {
    setSelectedPodcast(podcast)
  }

  const handlePodcastSearch = (search: string) => {
    if (!search) return
    
    // Only search for numbers in the input
    const numberMatch = search.match(/\d+/)
    if (numberMatch) {
      fetchPodcasts(numberMatch[0])
    }
  }

  useEffect(() => {
    if (configError) {
      toast.error(configError)
    }
  }, [configError])

  useEffect(() => {
    if (debouncedOriginalName && selectedTypeId && isSearching) {
      // Only search if query or typeId has changed since last search
      if (debouncedOriginalName !== lastSearched.query || selectedTypeId !== lastSearched.typeId) {
        searchMedia(debouncedOriginalName, selectedTypeId)
        setLastSearched({ query: debouncedOriginalName, typeId: selectedTypeId })
      }
    }
  }, [debouncedOriginalName, selectedTypeId, searchMedia, isSearching, lastSearched])

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media)
    
    // Parse the name into components
    if (media.name) {
      const parsed = parseRecommendationName(media.name);
      setOriginalName(parsed.originalName);
      setOtherNames(parsed.otherNames);
      setNameDescription(parsed.description);
    }
    
    setLinkValue(media.link || '')
    setImageValue(media.image || '')
    setPlatformsValue(media.platforms || '')
    setRateValue(media.rate?.toString() || '')
    setGenreValue(media.genre || '')
    
    // Set release date if available
    if (media.releaseDate) {
      try {
        const date = new Date(media.releaseDate)
        setReleaseDate(date)
      } catch (e) {
        console.error('Invalid date format:', e)
      }
    }
    
    setIsSearching(false)
    // Close the dropdown by clearing the search results
    searchMedia('', '')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const data: Record<string, any> = {}
    
    formData.forEach((value, key) => {
      // Skip the individual name component fields, as we'll compose them into a single name field
      if (key === 'originalName' || key === 'otherNames' || key === 'nameDescription') {
        return;
      }
      
      // Handle hosts fields from Select components
      if (key === 'dima' || key === 'timur' || key === 'maksim') {
        if (value === 'true') {
          data[key] = true;
        } else if (value === 'false') {
          data[key] = false;
        } else {
          data[key] = null;
        }
      } else if (key === 'rate' && value) {
        // Convert rate to number
        data[key] = parseFloat(value as string)
      } else if (key === 'podcastId' && value) {
        // If podcastId was submitted through the form
        data[key] = parseInt(value as string, 10)
      } else {
        data[key] = value === '' ? null : value
      }
    })
    
    // Compose the name from the three separate fields
    data.name = composeRecommendationName(
      formData.get('originalName') as string || '',
      formData.get('otherNames') as string || '',
      formData.get('nameDescription') as string || ''
    );
    
    // Add typeId from state
    if (selectedTypeId) {
      data.typeId = parseInt(selectedTypeId, 10)
    }
    
    // Handle release date explicitly (which is controlled by our state)
    // If undefined or null, explicitly set to null to clear it
    data.releaseDate = releaseDate || null;
    
    const toastId = toast.loading(initialData?.id ? 'Updating recommendation...' : 'Creating recommendation...');
    
    try {
      if (initialData?.id) {
        // Update
        await updateRecommendation(initialData.id, data)
        toast.success('Recommendation updated successfully', { id: toastId })
      } else {
        // Create
        await createRecommendation(data)
        toast.success('Recommendation created successfully', { id: toastId })
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.response?.data?.message || 'Failed to save recommendation', { id: toastId })
    }
  }

  // Handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearching(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="podcast">Podcast *</Label>
        <div className="relative">
          <PodcastField
            value={selectedPodcast}
            onChange={handlePodcastChange}
            availablePodcasts={availablePodcasts}
            onSearch={handlePodcastSearch}
            disabled={isFormLoading}
          />
          <input type="hidden" name="podcastId" value={selectedPodcast?.id ?? initialData?.podcastId ?? ''} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="typeId">Type</Label>
        <ClearableSelect 
          name="typeId" 
          value={selectedTypeId}
          onValueChange={setSelectedTypeId}
          placeholder="Select type"
          disabled={isFormLoading}
          clearable={false}
          required
        >
          {types.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              {type.value}
            </SelectItem>
          ))}
        </ClearableSelect>
      </div>

      {/* Original Name field that also serves as search field */}
      <div className="space-y-2">
        <Label htmlFor="originalName">Original Name *</Label>
        <div className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="originalName"
            name="originalName"
            required
            placeholder="Enter or search for original name..."
            value={originalName}
            onChange={(e) => {
              setOriginalName(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            className="pl-10"
            disabled={isFormLoading}
          />
          {mediaItems.length > 0 && isSearching && !isFormLoading && (
            <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg z-10">
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full p-2 text-left text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleMediaSelect(media)}
                >
                  {media.name}
                  {media.releaseDate && (() => {
                    try {
                      const date = new Date(media.releaseDate);
                      const year = date.getFullYear();
                      return !isNaN(year) ? ` (${year})` : '';
                    } catch (e) {
                      return '';
                    }
                  })()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherNames">Other Names</Label>
        <Input
          id="otherNames"
          name="otherNames"
          placeholder="Enter other names/translations"
          value={otherNames}
          onChange={(e) => setOtherNames(e.target.value)}
          disabled={isFormLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameDescription">Description</Label>
        <Input
          id="nameDescription"
          name="nameDescription"
          placeholder="Enter description (e.g. 2-й сезон)"
          value={nameDescription}
          onChange={(e) => setNameDescription(e.target.value)}
          disabled={isFormLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <div className="flex gap-2">
          <Input
            id="link"
            name="link"
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="Enter recommendation link"
            disabled={isFormLoading}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => window.open(linkValue, '_blank')}
            disabled={!linkValue || isFormLoading}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setIsMediaDetailsOpen(!isMediaDetailsOpen)}
          disabled={isFormLoading}
        >
          <span>Media Details</span>
          {isMediaDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isMediaDetailsOpen && (
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              <div className="mx-auto">
                <div style={{ height: "256px" }} className="flex items-center justify-center bg-black/5 rounded-md overflow-hidden">
                  {imageValue ? (
                    <img
                      src={imageValue}
                      alt="Media"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">No image</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image"></Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={imageValue}
                  onChange={(e) => setImageValue(e.target.value)}
                  placeholder="Enter image URL"
                  disabled={isFormLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platforms"></Label>
                <Input
                  id="platforms"
                  name="platforms"
                  value={platformsValue}
                  onChange={(e) => setPlatformsValue(e.target.value)}
                  placeholder="Enter platforms"
                  disabled={isFormLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate"></Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  placeholder="Enter rate"
                  disabled={isFormLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre"></Label>
                <Input
                  id="genre"
                  name="genre"
                  value={genreValue}
                  onChange={(e) => setGenreValue(e.target.value)}
                  placeholder="Enter genre"
                  disabled={isFormLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="releaseDate"></Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !releaseDate && "text-muted-foreground"
                        )}
                        disabled={isFormLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={releaseDate}
                        onSelect={(date) => !isFormLoading && setReleaseDate(date as Date)}
                        defaultMonth={releaseDate}
                      />
                    </PopoverContent>
                  </Popover>
                  {releaseDate && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setReleaseDate(undefined)}
                      disabled={isFormLoading}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length"></Label>
                <Input
                  id="length"
                  name="length"
                  defaultValue={initialData?.length}
                  placeholder="Enter length"
                  disabled={isFormLoading}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="space-y-4">
        <Label>Hosts</Label>
        <div className="grid grid-cols-3 gap-4">
          {['dima', 'timur', 'maksim'].map((host) => (
            <div key={host} className="space-y-2">
              <Label className="text-sm capitalize">{host}</Label>
              <Select
                name={host}
                defaultValue={initialData?.[host as keyof Recommendation]?.toString() || 'null'}
                disabled={isFormLoading}
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
          disabled={isFormLoading}
        />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isFormLoading}>
          {isFormLoading ? (
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