import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

interface PodcastFormData {
  date: Date
  showType: string
  number: string
  name: string
  length: number
}

export function CreatePodcast() {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!date) return

    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const data: PodcastFormData = {
        date,
        showType: formData.get('showType') as string,
        number: formData.get('number') as string,
        name: formData.get('name') as string,
        length: Number(formData.get('length')),
      }

      await api.post('/api/podcasts', data)
      toast.success('Podcast created successfully')
      navigate('/app/podcasts/edit')
    } catch (error) {
      toast.error('Failed to create podcast')
      console.error('Error creating podcast:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Podcast</h1>
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="showType">Show Type</Label>
          <Input
            id="showType"
            name="showType"
            required
            placeholder="Enter show type"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Number</Label>
          <Input
            id="number"
            name="number"
            required
            placeholder="Enter episode number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
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
            placeholder="Enter episode length in minutes"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Podcast'}
        </Button>
      </form>
    </div>
  )
} 