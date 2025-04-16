import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Pencil, Trash2 } from 'lucide-react'
import { usePodcastStore } from '@/stores/podcasts'
import { useRecommendationsStore } from '@/stores/recommendations'
import { PodcastField, Podcast as PodcastFieldPodcast } from '@/components/common/PodcastField'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export function RecommendationList() {
  const { 
    recommendations, 
    setFiltersFromUrl,
    deleteRecommendation 
  } = useRecommendationsStore()
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [recommendationToDelete, setRecommendationToDelete] = useState<number | null>(null)
  const navigate = useNavigate()
  
  const { 
    availablePodcasts, 
    setPodcastSearch,
    fetchPodcasts 
  } = usePodcastStore()

  const [selectedPodcast, setSelectedPodcast] = useState<PodcastFieldPodcast | null>(null)

  useEffect(() => {
    fetchData()
    return () => {
      // Cleanup when leaving the page
      setPodcastSearch('')
      setSelectedPodcast(null)
    }
  }, [])

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

  const handlePodcastChange = (podcast: PodcastFieldPodcast | null) => {
    setSelectedPodcast(podcast)
    setPodcastSearch('')
    
    // Make request with the new podcast or cleared podcast
    const params: Record<string, string> = {}
    if (searchInput) {
      params.search = searchInput
    }
    
    if (podcast?.number) {
      params.podcastNumber = podcast.number
    }
    
    // Immediately fetch data with updated podcast filter
    fetchDataWithParams(params)
  }

  const handlePodcastSearch = (search: string) => {
    if (!search) return
    
    // Only search for numbers in the input
    const numberMatch = search.match(/\d+/)
    if (numberMatch) {
      fetchPodcasts(numberMatch[0])
    }
  }

  const handleDeleteClick = (id: number) => {
    setRecommendationToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!recommendationToDelete) return

    try {
      await deleteRecommendation(recommendationToDelete.toString())
      toast.success('Recommendation deleted successfully')
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error('Failed to delete recommendation')
      console.error('Error deleting recommendation:', error)
    }
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
          <PodcastField
            value={selectedPodcast}
            onChange={handlePodcastChange}
            availablePodcasts={availablePodcasts.map(p => ({
              showType: p.showType,
              number: p.number,
              date: p.date
            }))}
            onSearch={handlePodcastSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white cursor-pointer"
              onClick={() => navigate(`/app/recommendations/${recommendation.id}`)}
            >
              <div>
                <h3 className="font-medium">{recommendation.name}</h3>
                <p className="text-sm text-gray-500">
                  {recommendation.podcast?.showType} #{recommendation.podcast?.number}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/recommendations/${recommendation.id}`);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(recommendation.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recommendation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recommendation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 