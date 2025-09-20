"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useLiveMatches(refreshInterval = 30000) {
  const { data, error, mutate } = useSWR("/api/matches", fetcher, {
    refreshInterval, // Refresh every 30 seconds by default
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    matches: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    lastUpdated: data?.lastUpdated,
    refresh: mutate,
    fallback: data?.fallback || false,
  }
}

export function useLiveTeams(refreshInterval = 60000) {
  const { data, error, mutate } = useSWR("/api/teams", fetcher, {
    refreshInterval, // Refresh every minute by default
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    teams: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    lastUpdated: data?.lastUpdated,
    refresh: mutate,
  }
}

export function useLiveResults(refreshInterval = 15000) {
  const { data, error, mutate } = useSWR("/api/results", fetcher, {
    refreshInterval, // Refresh every 15 seconds for live results
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    results: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    lastUpdated: data?.lastUpdated,
    refresh: mutate,
  }
}

export function useLiveMatchTracker(matchId?: string, refreshInterval = 10000) {
  const { data, error, mutate } = useSWR(matchId ? `/api/matches/${matchId}/live` : "/api/matches/live", fetcher, {
    refreshInterval, // Refresh every 10 seconds for live tracking
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    liveMatch: data?.data,
    isLoading: !error && !data,
    isError: error,
    lastUpdated: data?.lastUpdated,
    refresh: mutate,
    connectionStatus: data?.connectionStatus || "disconnected",
  }
}

export function useAutoRefresh() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date())
      }, 30000) // Update timestamp every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isAutoRefresh])

  return {
    isAutoRefresh,
    setIsAutoRefresh,
    lastRefresh,
  }
}
