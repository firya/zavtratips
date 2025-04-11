import { useNavigate } from 'react-router-dom'
import { RecommendationForm } from './components/RecommendationForm'

export function CreateRecommendation() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Recommendation</h1>
      <RecommendationForm onSuccess={() => navigate('/app/recommendations/edit')} />
    </div>
  )
} 