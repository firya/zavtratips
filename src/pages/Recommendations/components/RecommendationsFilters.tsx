import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Check, Search, RotateCcw, Mic, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecommendationsStore } from '@/stores/recommendations'
import { usePodcastStore } from '@/stores/podcasts'
import { hostNameMap, isMainHost } from '@/lib/hostNames'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from '@/components/ui/calendar'
import { PodcastField, Podcast } from '@/components/common/PodcastField'

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyFilters()
                }
              }}
            />
          </div>

          <div className="sm:col-span-1">
            <Select
              value={localFilters.type}
              onValueChange={(value) => setLocalFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type">
                  {localFilters.type}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type.id} value={type.value}>
                    {type.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              value={localFilters.hosts.join(',')}
              onValueChange={(value) => setLocalFilter('hosts', value.split(','))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hosts">
                  {localFilters.hosts.map(host => hostNameMap[host] || host).join(', ')}
                </SelectValue>
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