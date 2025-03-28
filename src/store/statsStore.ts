import { create } from 'zustand'
import { api } from '@/lib/api'

interface HostStats {
  dima: number
  timur: number
  maksim: number
  guests: number
}

interface TypeStats {
  [key: string]: number
}

interface EpisodeWeek {
  date: string
  length: number
}

interface StatsData {
  totalEpisodes: number
  totalLength: number
  totalRecommendations: number
  hostStats: HostStats
  typeStats: TypeStats
  episodesByWeek: EpisodeWeek[]
}

interface StatsStore {
  stats: StatsData | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/api/stats')
      set({ stats: response.data, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isLoading: false,
      })
    }
  },
})) 