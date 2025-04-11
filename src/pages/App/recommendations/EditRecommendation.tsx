import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Pencil, Trash2, X, Check } from 'lucide-react'
import debounce from 'lodash/debounce'
import { cn } from '@/lib/utils'
import { usePodcastStore, Podcast } from '@/stores/podcasts'
import { useRecommendationsStore } from '@/stores/recommendationsStore'

export function EditRecommendation() {
  const { 
    recommendations, 
    setFiltersFromUrl,
    deleteRecommendation 
  } = useRecommendationsStore()
  const [searchInput, setSearchInput] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  const { 
    availablePodcasts, 
    podcastSearch, 
    setPodcastSearch,
    fetchPodcasts 
  } = usePodcastStore()

  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)

  useEffect(() => {
    fetchData()
    return () => {
      // Cleanup when leaving the page
      setPodcastSearch('')
      setSelectedPodcast(null)
    }
  }, [])

  const handlePodcastSelect = (podcast: Podcast) => {
    // First update the selected podcast
    setSelectedPodcast(podcast)
    // Then clear the search input to hide dropdown
    setPodcastSearch('')
    setSelectedIndex(-1)
    // Make request with the new podcast number
    const params: Record<string, string> = {
      podcastNumber: podcast.number
    }
    if (searchInput) {
      params.search = searchInput
    }
    fetchDataWithParams(params)
  }

  const fetchDataWithParams = async (params: Record<string, string>) => {
    try {
      setIsLoading(true)
      await setFiltersFromUrl(params)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchData = async (search = '') => {
    const params: Record<string, string> = {}

    if (search) {
      params.search = search
    }

    // Only add podcastNumber if we have a selected podcast
    if (selectedPodcast?.number) {
      params.podcastNumber = selectedPodcast.number
    }

    await fetchDataWithParams(params)
  }

  const handlePodcastSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPodcastSearch(value)
    setSelectedIndex(-1)
    if (!value) {
      setSelectedPodcast(null)
      fetchData(searchInput)
    } else {
      // Only search for numbers in the input
      const numberMatch = value.match(/\d+/)
      if (numberMatch) {
        fetchPodcasts(numberMatch[0])
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!podcastSearch) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < availablePodcasts.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < availablePodcasts.length) {
          handlePodcastSelect(availablePodcasts[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setPodcastSearch('')
        setSelectedPodcast(null)
        setSelectedIndex(-1)
        fetchData(searchInput)
        break
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) return

    try {
      await deleteRecommendation(id)
      toast.success('Recommendation deleted successfully')
    } catch (error) {
      toast.error('Failed to delete recommendation')
      console.error('Error deleting recommendation:', error)
    }
  }

  const handleClearPodcast = () => {
    setPodcastSearch('')
    setSelectedPodcast(null)
    setSelectedIndex(-1)
    // Make request without podcastNumber
    const params: Record<string, string> = {}
    if (searchInput) {
      params.search = searchInput
    }
    // Immediately fetch data with cleared podcast
    fetchDataWithParams(params)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recommendations</h1>
        <Button onClick={() => navigate('/app/recommendations/create')}>
          Create New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search recommendations..."
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value
              setSearchInput(value)
              if (value) {
                fetchData(value)
              } else {
                fetchData('')
              }
            }}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <div className="relative">
            <Input
              placeholder="Search podcast..."
              value={selectedPodcast ? `${selectedPodcast.showType} - ${selectedPodcast.number}` : podcastSearch}
              onChange={handlePodcastSearchChange}
              onKeyDown={handleKeyDown}
              className="h-10"
              disabled={!!selectedPodcast}
            />
            {(podcastSearch || selectedPodcast) && (
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

          {podcastSearch && !selectedPodcast && (
            <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 z-50">
              <div className="max-h-[300px] overflow-y-auto">
                {availablePodcasts.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No podcast found.
                  </div>
                ) : (
                  availablePodcasts.map((podcast: Podcast, index) => (
                    <div
                      key={`${podcast.showType}-${podcast.number}`}
                      onClick={() => handlePodcastSelect(podcast)}
                      className={cn(
                        "flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        index === selectedIndex && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPodcast?.showType === podcast.showType && 
                          selectedPodcast?.number === podcast.number ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {podcast.showType} - {podcast.number}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium">{recommendation.name}</h3>
                <p className="text-sm text-gray-500">{recommendation.link}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/app/recommendations/${recommendation.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(recommendation.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 