import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Podcast {
  id?: number
  showType: string
  number: string
  date?: string
}

export interface PodcastFieldProps {
  value?: Podcast | null
  onChange: (podcast: Podcast | null) => void
  availablePodcasts: Podcast[]
  onSearch?: (search: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PodcastField({
  value,
  onChange,
  availablePodcasts,
  onSearch,
  placeholder = 'Search podcast...',
  className = '',
  disabled = false
}: PodcastFieldProps) {
  const [podcastSearch, setPodcastSearch] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  
  // Ensure availablePodcasts is a properly typed array
  const podcasts = availablePodcasts as Podcast[]

  const handlePodcastSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPodcastSearch(value)
    if (onSearch) {
      onSearch(value)
    }
    setSelectedIndex(-1)
  }

  const handleClearPodcast = () => {
    setPodcastSearch('')
    onChange(null)
    setSelectedIndex(-1)
  }

  const handlePodcastSelect = (podcast: Podcast) => {
    onChange(podcast)
    setPodcastSearch('')
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!podcastSearch || podcasts.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < podcasts.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handlePodcastSelect(podcasts[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setPodcastSearch('')
      setSelectedIndex(-1)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value ? `${value.showType} - ${value.number}` : podcastSearch}
          onChange={handlePodcastSearchChange}
          onKeyDown={handleKeyDown}
          className="h-10"
          disabled={!!value || disabled}
        />
        {(podcastSearch || value) && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleClearPodcast}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {podcastSearch && !value && podcasts.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 z-50">
          <div className="max-h-[300px] overflow-y-auto">
            {podcasts.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No podcast found.
              </div>
            ) : (
              podcasts.map((podcast, index) => {
                const typedPodcast = podcast as Podcast;
                return (
                  <div
                    key={`${typedPodcast.showType}-${typedPodcast.number}`}
                    onClick={() => handlePodcastSelect(typedPodcast)}
                    className={cn(
                      "flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      index === selectedIndex && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.showType === typedPodcast.showType && 
                        value?.number === typedPodcast.number ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {typedPodcast.showType} - {typedPodcast.number}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
} 