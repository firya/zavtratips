import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, Search, RotateCcw, Mic, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { useRecommendationsStore } from '@/store/recommendationsStore'
import { hostNameMap, isMainHost } from '@/lib/hostNames'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface Podcast {
  showType: string
  number: string
}

interface Filters {
  search: string
  type: string
  podcastShowType: string
  podcastNumber: string
  hosts: string[]
  page: number
  limit: number
  dateRange?: DateRange
}

interface RecommendationsFiltersProps {
  filters: Filters
  availableTypes: string[]
  availablePodcasts: Podcast[]
  availableHosts: string[]
  setFilter: (key: keyof Filters, value: any) => void
  onPodcastSearch: (search: string) => void
}

export function RecommendationsFilters({
  filters,
  availableTypes,
  availablePodcasts,
  availableHosts,
  setFilter,
  onPodcastSearch
}: RecommendationsFiltersProps) {
  const { podcastSearch, setPodcastSearch, localFilters, setLocalFilter, resetFilters, applyFilters } = useRecommendationsStore()
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const mainHosts = availableHosts.filter(isMainHost)
  const otherHosts = availableHosts.filter(host => !isMainHost(host))

  const filteredPodcasts = availablePodcasts.filter(podcast => {
    const searchValue = podcastSearch.toLowerCase()
    const podcastValue = `${podcast.showType} - ${podcast.number}`.toLowerCase()
    return podcastValue.includes(searchValue)
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!podcastSearch || localFilters.podcastShowType) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredPodcasts.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredPodcasts.length) {
          const podcast = filteredPodcasts[selectedIndex]
          setLocalFilter('podcastShowType', podcast.showType)
          setLocalFilter('podcastNumber', podcast.number)
          setPodcastSearch('')
          setSelectedIndex(-1)
        }
        break
      case 'Escape':
        e.preventDefault()
        setPodcastSearch('')
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium mb-4">Filters</h3>
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Input
              placeholder="Search..."
              value={localFilters.search}
              onChange={(e) => setLocalFilter('search', e.target.value)}
            />
          </div>

          <div className="sm:col-span-1">
            <Select
              value={localFilters.type}
              onValueChange={(value) => setLocalFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative sm:col-span-1">
            <div className="relative">
              <Input
                placeholder="Search podcast..."
                value={localFilters.podcastShowType ? `${localFilters.podcastShowType} - ${localFilters.podcastNumber}` : podcastSearch}
                onChange={(e) => {
                  setPodcastSearch(e.target.value)
                  setSelectedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="h-10"
                disabled={!!localFilters.podcastShowType}
              />
              {(podcastSearch || localFilters.podcastShowType) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => {
                    setPodcastSearch('')
                    setLocalFilter('podcastShowType', '')
                    setLocalFilter('podcastNumber', '')
                    setSelectedIndex(-1)
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {podcastSearch && !localFilters.podcastShowType && (
              <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 z-50">
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredPodcasts.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No podcast found.
                    </div>
                  ) : (
                    filteredPodcasts.map((podcast, index) => (
                      <div
                        key={`${podcast.showType}-${podcast.number}`}
                        onClick={() => {
                          setLocalFilter('podcastShowType', podcast.showType)
                          setLocalFilter('podcastNumber', podcast.number)
                          setPodcastSearch('')
                          setSelectedIndex(-1)
                        }}
                        className={cn(
                          "flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          index === selectedIndex && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            localFilters.podcastShowType === podcast.showType ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {podcast.showType} - {podcast.number}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {localFilters.podcastShowType && (
              <div className="absolute -top-2 left-2 px-1 text-xs bg-background text-muted-foreground">
                Selected podcast
              </div>
            )}
          </div>

          <div className="sm:col-span-1">
            <Select
              value={localFilters.hosts.join(',')}
              onValueChange={(value) => setLocalFilter('hosts', value.split(','))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hosts" />
              </SelectTrigger>
              <SelectContent>
                {mainHosts.map((host) => (
                  <SelectItem key={host} value={host} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <span>{hostNameMap[host]}</span>
                    </div>
                  </SelectItem>
                ))}
                {otherHosts.length > 0 && (
                  <>
                    <SelectSeparator />
                    {otherHosts.map((host) => (
                      <SelectItem key={host} value={host}>
                        {host}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full min-w-0 sm:col-span-1">
            <DateRangePicker
              dateRange={localFilters.dateRange}
              onSelect={(range) => setLocalFilter('dateRange', range)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 sm:col-span-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetFilters()
                applyFilters()
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={applyFilters}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 