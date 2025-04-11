import { create } from 'zustand'
import { api } from '@/lib/api'

export interface Podcast {
  showType: string
  number: string
  date: string
}

export interface PodcastState {
  availablePodcasts: Podcast[]
  isPodcastSearchLoading: boolean
  podcastSearch: string
  getLastEpisodeNumber: (showType: string) => Promise<number | null>
  setPodcastSearch: (search: string) => void
  fetchPodcasts: (search?: string) => Promise<void>
}

export const usePodcastStore = create<PodcastState>()((set, get) => ({
  availablePodcasts: [],
  isPodcastSearchLoading: false,
  podcastSearch: '',
  
  getLastEpisodeNumber: async (showType: string) => {
    try {
      const response = await api.get(`/api/podcasts/last-number?showType=${encodeURIComponent(showType)}`)
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
    if (!search?.trim()) {
      set({ availablePodcasts: [] })
      return
    }

    if (get().isPodcastSearchLoading) {
      return
    }

    set({ isPodcastSearchLoading: true })
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append('search', search)
      }
      const response = await api.get(`/api/podcasts?${params}`)
      set({ availablePodcasts: response.data.podcasts })
    } catch (error) {
      console.error('Failed to fetch podcasts:', error)
      set({ availablePodcasts: [] })
    } finally {
      set({ isPodcastSearchLoading: false })
    }
  }
})) 