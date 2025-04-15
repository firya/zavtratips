import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useConfigStore } from '@/stores/config'
import { usePodcastStore } from '@/stores/podcasts'
import InputMask from 'react-input-mask'

interface Podcast {
  id?: number
  date: Date
  showType: string
  number: string
  name: string
  length: string
}

interface PodcastFormProps {
  initialData?: Podcast
  onSuccess?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

function HHMMSSToMilliseconds(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return (hours * 3600 + minutes * 60 + seconds) * 1000
}

export function PodcastForm({ initialData, onSuccess, onCancel, isLoading: parentIsLoading }: PodcastFormProps) {
  const [date, setDate] = useState<Date | undefined>(initialData?.date || new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [length, setLength] = useState(initialData?.length || '')
  const [selectedShowType, setSelectedShowType] = useState(initialData?.showType || '')
  const [episodeNumber, setEpisodeNumber] = useState(initialData?.number || '')
  const { showTypes, isLoading: isConfigLoading, error: configError, fetchConfigs } = useConfigStore()
  const { getLastEpisodeNumber } = usePodcastStore()
  
  // Combined loading state from parent and local state
  const isFormLoading = parentIsLoading || isLoading || isConfigLoading

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  useEffect(() => {
    if (configError) {
      toast.error(configError)
    }
  }, [configError])

  useEffect(() => {
    if (showTypes.length > 0 && !selectedShowType) {
      setSelectedShowType(showTypes[0].value)
    }
  }, [showTypes, selectedShowType])

  useEffect(() => {
    const fetchNextNumber = async () => {
      if (selectedShowType && !initialData?.id) {
        const lastNumber = await getLastEpisodeNumber(selectedShowType)
        if (lastNumber !== null) {
          setEpisodeNumber((lastNumber + 1).toString())
        } else {
          setEpisodeNumber('')
        }
      }
    }
    fetchNextNumber()
  }, [selectedShowType, getLastEpisodeNumber, initialData?.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!date || !selectedShowType || !episodeNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    const toastId = toast.loading(initialData?.id ? 'Updating podcast...' : 'Creating podcast...')
    
    try {
      const formData = new FormData(e.currentTarget)
      const data: Podcast = {
        date,
        showType: selectedShowType,
        number: episodeNumber,
        name: formData.get('name') as string || '',
        length: HHMMSSToMilliseconds(length).toString(),
      }

      if (initialData?.id) {
        await api.put(`/podcasts/${initialData.id}`, data)
        toast.success('Podcast updated successfully', { id: toastId })
      } else {
        await api.post('/podcasts', data)
        toast.success('Podcast created successfully', { id: toastId })
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Error saving podcast:', error)
      toast.error(initialData?.id ? 'Failed to update podcast' : 'Failed to create podcast', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={isFormLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => !isFormLoading && setDate(newDate as Date)}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="showType">Show Type</Label>
        <Select value={selectedShowType} onValueChange={setSelectedShowType} disabled={isFormLoading || isConfigLoading}>
          <SelectTrigger>
            <SelectValue placeholder={isConfigLoading ? "Loading..." : "Select show type"} />
          </SelectTrigger>
          <SelectContent>
            {showTypes.map((showType) => (
              <SelectItem key={showType.id} value={showType.value}>
                {showType.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Number</Label>
        <Input
          id="number"
          name="number"
          required
          value={episodeNumber}
          onChange={(e) => setEpisodeNumber(e.target.value)}
          placeholder="Enter episode number"
          disabled={isFormLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="Enter episode name"
          disabled={isFormLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="length">Length (HH:MM:SS)</Label>
        <InputMask
          mask="99:99:99"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="00:00:00"
          disabled={isFormLoading}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="length"
              name="length"
              disabled={isFormLoading}
            />
          )}
        </InputMask>
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
            initialData?.id ? 'Save Changes' : 'Save Podcast'
          )}
        </Button>
      </div>
    </form>
  )
} 