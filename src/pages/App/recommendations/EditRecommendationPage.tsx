import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RecommendationForm } from './components/RecommendationForm'
import { useRecommendationsStore } from '@/stores/recommendationsStore'

export function EditRecommendationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    currentRecommendation, 
    isLoading, 
    error,
    fetchRecommendation,
    deleteRecommendation
  } = useRecommendationsStore()

  useEffect(() => {
    if (id) {
      fetchRecommendation(id).catch(() => {
        toast.error('Failed to load recommendation')
      })
    }
  }, [id, fetchRecommendation])

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this recommendation?')) return

    try {
      await deleteRecommendation(id)
      toast.success('Recommendation deleted successfully')
      navigate('/app/recommendations')
    } catch (error) {
      toast.error('Failed to delete recommendation')
      console.error('Error deleting recommendation:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !currentRecommendation) {
    return <div>Recommendation not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Recommendation</h1>
      <div className="space-y-6">
        <RecommendationForm
          initialData={currentRecommendation}
          onSuccess={() => navigate('/app/recommendations')}
          onCancel={() => navigate('/app/recommendations')}
        />
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
        >
          Delete Recommendation
        </Button>
      </div>
    </div>
  )
} 