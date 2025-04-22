import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'
import { useStatsStore } from '@/stores/statsStore'
import { useConfigStore } from '@/stores/config'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Link } from 'react-router-dom'

interface HeatmapTooltipProps {
  week: number
  length: number
  yearIndex: number
  color: string
}

function HeatmapTooltip({ week, length, yearIndex, color }: HeatmapTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div 
          className="w-3 h-3 rounded-sm cursor-pointer" 
          style={{ backgroundColor: color }}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-background text-foreground text-xs p-2 rounded-md shadow-lg border z-50"
          side={yearIndex > 3 ? 'top' : 'bottom'}
          sideOffset={5}
        >
          <div className="font-medium">Week {week}</div>
          <div className="text-muted-foreground">{formatDuration(length)}</div>
          <Tooltip.Arrow className="fill-background" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function Stats() {
  const { stats, isLoading, error, fetchStats } = useStatsStore()
  const { types } = useConfigStore()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchStats()
    }
  }, [fetchStats])

  if (isLoading) {
    return <div className="container py-6">Loading...</div>
  }

  if (error || !stats) {
    return <div className="container py-6">Failed to load statistics</div>
  }

  // Group episodes by year and week
  const episodesByYear = stats.episodesByWeek.reduce((acc, episode) => {
    const date = new Date(episode.date)
    const year = date.getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(episode)
    return acc
  }, {} as Record<number, typeof stats.episodesByWeek>)

  // Calculate max length for color intensity
  const maxLength = Math.max(...stats.episodesByWeek.map(e => e.length))

  // Get week number (1-53) for a given date
  const getWeekNumber = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    return Math.floor(days / 7) + 1
  }

  // Format duration in years and days
  const formatYearsAndDays = (startDate: Date, endDate: Date): string => {
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const years = Math.floor(days / 365)
    const remainingDays = days % 365
    return `${years} years ${remainingDays} days`
  }

  // Create a map of type names to IDs
  const typeNameToId = types.reduce((acc, type) => {
    acc[type.value] = type.id
    return acc
  }, {} as Record<string, number>)

  return (
    <Tooltip.Provider>
      <div>
        <h1 className="text-2xl font-bold mb-6">Statistics</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Zavtracast Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalEpisodes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Zavtracast Length</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatDuration(stats.totalLength)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalRecommendations}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Years Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatYearsAndDays(new Date(stats.episodesByWeek[0].date), new Date())}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Episode Length Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <div className="min-w-[800px] h-[200px] p-4">
                <div className="grid grid-cols-[auto_1fr] gap-4 h-full">
                  {/* Year labels */}
                  <div className="grid grid-rows-[repeat(7,1fr)] gap-1">
                    {Object.keys(episodesByYear).map(year => (
                      <div key={year} className="h-3 text-[10px] font-medium text-muted-foreground">
                        {year}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap grid */}
                  <div className="grid grid-rows-[repeat(7,1fr)] gap-1">
                    {Object.entries(episodesByYear).map(([year, episodes], yearIndex) => (
                      <div key={year} className="grid grid-cols-[repeat(53,1fr)] gap-1">
                        {Array.from({ length: 53 }, (_, weekIndex) => {
                          const weekEpisodes = episodes.filter(episode => {
                            const date = new Date(episode.date)
                            const week = getWeekNumber(date)
                            return week === weekIndex + 1
                          })

                          if (weekEpisodes.length === 0) {
                            return <div key={weekIndex} className="w-3 h-3" />
                          }

                          const avgLength = weekEpisodes.reduce((sum, ep) => sum + ep.length, 0) / weekEpisodes.length
                          const intensity = Math.min(1, avgLength / maxLength)
                          // Green color with opacity based on intensity
                          const color = `rgb(${255 * (1 - intensity)}, ${255 * (1 - intensity * 0.5)}, ${255 * (1 - intensity)})`

                          return (
                            <HeatmapTooltip
                              key={weekIndex}
                              week={weekIndex + 1}
                              length={avgLength}
                              yearIndex={yearIndex}
                              color={color}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recommendations by Host</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/recommendations?hosts=dima"
                className="h-auto flex flex-col items-center p-4 hover:bg-accent border rounded-md"
              >
                <span className="text-sm font-medium text-muted-foreground">Дима</span>
                <span className="text-xl font-bold mt-1">{stats.hostStats.dima}</span>
              </Link>
              <Link
                to="/recommendations?hosts=timur"
                className="h-auto flex flex-col items-center p-4 hover:bg-accent border rounded-md"
              >
                <span className="text-sm font-medium text-muted-foreground">Тимур</span>
                <span className="text-xl font-bold mt-1">{stats.hostStats.timur}</span>
              </Link>
              <Link
                to="/recommendations?hosts=maksim"
                className="h-auto flex flex-col items-center p-4 hover:bg-accent border rounded-md"
              >
                <span className="text-sm font-medium text-muted-foreground">Максим</span>
                <span className="text-xl font-bold mt-1">{stats.hostStats.maksim}</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recommendations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stats.typeStats || {}).map(([type, count]) => (
                <Link
                  key={type}
                  to={`/recommendations?type=${typeNameToId[type]}`}
                  className="h-auto flex flex-col items-center p-4 hover:bg-accent border rounded-md"
                >
                  <span className="text-sm font-medium text-muted-foreground">{type}</span>
                  <span className="text-xl font-bold mt-1">{count}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Tooltip.Provider>
  )
} 