import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecommendationForm } from './components/RecommendationForm'
import { usePodcastStore } from '@/stores/podcasts'

export function CreateRecommendation() {
  const navigate = useNavigate()
  const { 
    availablePodcasts,
    currentPodcast,
    fetchPodcasts,
    setPodcastSearch
  } = usePodcastStore()

  // Fetch the latest podcast when the component mounts
  useEffect(() => {
    // Clear any previous podcast state
    setPodcastSearch('')
    
    // Fetch the latest podcasts to populate the dropdown
    fetchPodcasts('latest')
    
    // Cleanup function to clear state when unmounting
    return () => {
      setPodcastSearch('')
    }
  }, [fetchPodcasts, setPodcastSearch])

  // Handle successful form submission by redirecting back to create page
  const handleSuccess = () => {
    // Redirect to the same page to reset the form while keeping the podcast dropdown filled
    navigate('/app/recommendations/create', { replace: true })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Recommendation</h1>
      <RecommendationForm 
        onSuccess={handleSuccess} 
        initialLatestPodcast={availablePodcasts.length > 0 ? availablePodcasts[0] : null}
      />
    </div>
  )
} 