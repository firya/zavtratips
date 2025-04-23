import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, RotateCcw, Mic, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useRecommendationsStore } from '@/stores/recommendations'
import { usePodcastStore } from '@/stores/podcasts'
import { hostNameMap, isMainHost } from '@/lib/hostNames'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from '@/components/ui/calendar'
import { PodcastField, Podcast, ClearableSelect } from '@/components/common'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Type {
  id: number
  value: string
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
  availableTypes: Type[]
  availablePodcasts: Podcast[]
  availableHosts: string[]
  onPodcastSearch: (search: string) => void
}

export function RecommendationsFilters({
  availableTypes,
  availablePodcasts,
  availableHosts,
  onPodcastSearch
}: RecommendationsFiltersProps) {
  const { localFilters, setLocalFilter, resetFilters, applyFilters } = useRecommendationsStore()
  const { setPodcastSearch } = usePodcastStore()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const mainHosts = availableHosts.filter(isMainHost)
  const otherHosts = availableHosts.filter(host => !isMainHost(host))

  const selectedPodcast = localFilters.podcastShowType ? {
    showType: localFilters.podcastShowType,
    number: localFilters.podcastNumber
  } : null

  const handlePodcastChange = (podcast: Podcast | null) => {
    if (podcast) {
      setLocalFilter('podcastShowType', podcast.showType)
      setLocalFilter('podcastNumber', podcast.number)
    } else {
      setLocalFilter('podcastShowType', '')
      setLocalFilter('podcastNumber', '')
    }
    setPodcastSearch('')
  }

  const clearSearch = () => {
    setLocalFilter('search', '')
  }

  const clearType = () => {
    setLocalFilter('type', '')
  }

  const clearHosts = () => {
    setLocalFilter('hosts', [])
  }

  const clearDateRange = () => {
    setLocalFilter('dateRange', undefined)
  }

  return (
    <Card className="overflow-hidden">
      {/* Mobile toggle button - visible only on mobile */}
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between sm:hidden"
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
      >
        <span className="text-sm font-medium">Filters</span>
        {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* Desktop header - visible only on desktop */}
      <div className="p-4 hidden sm:block">
        <h3 className="text-sm font-medium mb-4">Filters</h3>
      </div>

      {/* Filter content - always visible on desktop, toggleable on mobile */}
      <CardContent className={`p-4 pt-0 sm:pt-0 sm:block ${isFiltersOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="relative sm:col-span-1">
              <Input
                placeholder="Search..."
                value={localFilters.search}
                onChange={(e) => setLocalFilter('search', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    applyFilters()
                  }
                }}
                className={localFilters.search ? "pr-8" : ""}
              />
              {localFilters.search && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="sm:col-span-1">
              <ClearableSelect
                value={localFilters.type}
                onValueChange={(value) => setLocalFilter('type', value)}
                clearable={true}
                onClear={clearType}
                placeholder="Select type"
              >
                {availableTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.value}
                  </SelectItem>
                ))}
              </ClearableSelect>
            </div>

            <div className="relative sm:col-span-1">
              <PodcastField
                value={selectedPodcast}
                onChange={handlePodcastChange}
                availablePodcasts={availablePodcasts}
                onSearch={onPodcastSearch}
              />
            </div>

            <div className="sm:col-span-1">
              <ClearableSelect
                value={localFilters.hosts.join(',')}
                onValueChange={(value) => setLocalFilter('hosts', value.split(','))}
                clearable={localFilters.hosts.length > 0}
                onClear={clearHosts}
                placeholder="Select hosts"
              >
                {mainHosts.map((host) => (
                  <SelectItem key={host} value={host} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <span>{hostNameMap[host]}</span>
                    </div>
                  </SelectItem>
                ))}
              </ClearableSelect>
            </div>

            <div className="w-full min-w-0 sm:col-span-1 relative">
              <DateRangePicker
                dateRange={localFilters.dateRange}
                onSelect={(range) => setLocalFilter('dateRange', range)}
                className="w-full"
              />
              {localFilters.dateRange && (
                <button 
                  type="button"
                  onClick={clearDateRange}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear date range"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
                onClick={() => {
                  setLocalFilter('page', 1);
                  applyFilters();
                }}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 