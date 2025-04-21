import { create } from 'zustand'
import { api } from '@/lib/api'

export interface Podcast {
  id?: number
  showType: string
  number: string
  date: string
}

export interface PodcastState {
  availablePodcasts: Podcast[]
  currentPodcast: Podcast | null
  isPodcastSearchLoading: boolean
  isPodcastLoading: boolean
  podcastSearch: string
  error: string | null
  getLastEpisodeNumber: (showType: string) => Promise<number | null>
  setPodcastSearch: (search: string) => void
  fetchPodcasts: (search?: string) => Promise<void>
  fetchPodcast: (id: number) => Promise<void>
}

export const usePodcastStore = create<PodcastState>()((set, get) => ({
  availablePodcasts: [],
  currentPodcast: null,
  isPodcastSearchLoading: false,
  isPodcastLoading: false,
  podcastSearch: '',
  error: null,
  
  getLastEpisodeNumber: async (showType: string) => {
    try {
      const response = await api.get(`/podcasts/last-number?showType=${encodeURIComponent(showType)}`)
      return response.data.lastNumber
    } catch (error) {
      console.error('Failed to fetch last episode number:', error)
      return null
    }
  },

  setPodcastSearch: (search: string) => {
    set({ podcastSearch: search })
    if (search.trim()) {
      get().fetchPodcasts(search.trim())
    } else {
      set({ availablePodcasts: [] })
    }
  },

  fetchPodcasts: async (search?: string) => {
    if (!search?.trim() && search !== 'latest') {
      set({ availablePodcasts: [] })
      return
    }

    if (get().isPodcastSearchLoading) {
      return
    }

    set({ isPodcastSearchLoading: true })
    try {
      const params = new URLSearchParams()
      
      // Special case for fetching latest podcast
      if (search === 'latest') {
        params.append('latest', 'true')
      } else if (search) {
        params.append('search', search)
      }
      
      const response = await api.get(`/podcasts?${params}`)
      set({ 
        availablePodcasts: response.data.podcasts,
        error: null
      })
    } catch (error) {
      console.error('Failed to fetch podcasts:', error)
      set({ 
        availablePodcasts: [],
        error: error instanceof Error ? error.message : 'Failed to fetch podcasts'
      })
    } finally {
      set({ isPodcastSearchLoading: false })
    }
  },

  fetchPodcast: async (id: number) => {
    if (!id) return

    set({ isPodcastLoading: true, error: null })
    try {
      const response = await api.get(`/podcasts/${id}`)
      set({ 
        currentPodcast: response.data,
        isPodcastLoading: false
      })
    } catch (error) {
      console.error('Failed to fetch podcast:', error)
      set({ 
        currentPodcast: null,
        isPodcastLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch podcast'
      })
    }
  }
})) 