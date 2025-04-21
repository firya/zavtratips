import { useRecommendationsStore } from '@/stores/recommendations'
import { useConfigStore } from '@/stores/config'
import { usePodcastStore } from '@/stores/podcasts'
import { RecommendationsFilters } from './components/RecommendationsFilters'
import { Pagination } from '@/components/ui/pagination'
import { RecommendationCard } from '@/pages/Recommendations/components/RecommendationCard'
import { useUrlParams } from '@/hooks/useUrlParams'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function Recommendations() {
  const { 
    recommendations, 
    isLoading, 
    error, 
    filters,
    totalCount,
    setFilter,
    setLocalFilter,
    applyFilters
  } = useRecommendationsStore()

  const { types, hosts, fetchConfigs } = useConfigStore()
  const { availablePodcasts, setPodcastSearch } = usePodcastStore()

  // Initialize URL parameters
  useUrlParams()

  // Fetch config data on mount
  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  // Show error in toast if there is one
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handlePodcastSearch = (search: string) => {
    setPodcastSearch(search)
  }

  const handlePageChange = async (page: number) => {
    setLocalFilter('page', page)
    try {
      await applyFilters()
      // Scroll to top of the page after changing page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (err) {
      // Error is already handled in the store
    }
  }

  const totalPages = Math.ceil(totalCount / filters.limit)

  return (
    <div>
      <div className="space-y-4">
        <RecommendationsFilters
          filters={filters}
          availableTypes={types}
          availablePodcasts={availablePodcasts}
          availableHosts={hosts}
          onPodcastSearch={handlePodcastSearch}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : recommendations.length > 0 ? (
          recommendations.map((recommendation) => {
            return (
              <RecommendationCard
                key={recommendation.id}
                image={recommendation.image}
                type={recommendation.type?.value || 'Unknown Type'}
                date={recommendation.podcast?.date || ''}
                name={recommendation.name}
                podcastName={recommendation.podcast?.showType || ''}
                podcastNumber={recommendation.podcast?.number || ''}
                link={recommendation.link}
                platforms={recommendation.platforms || undefined}
                genre={recommendation.genre || undefined}
                rate={recommendation.rate || undefined}
                length={recommendation.length || undefined}
                dima={recommendation.dima}
                timur={recommendation.timur}
                maksim={recommendation.maksim}
                guest={recommendation.guest}
              />
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No recommendations found</p>
          </div>
        )}
      </div>

      {totalCount > filters.limit && (
        <div className="flex justify-center">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
} 