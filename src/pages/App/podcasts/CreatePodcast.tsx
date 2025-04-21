import { useNavigate } from 'react-router-dom'
import { PodcastForm } from './components/PodcastForm'

export function CreatePodcast() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Podcast</h1>
      <PodcastForm
        onSuccess={() => navigate('/app/podcasts')}
        mode="create"
      />
    </div>
  )
} 