"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useAutoRefresh } from "@/hooks/use-live-data"

interface LiveDataIndicatorProps {
  lastUpdated?: string
  onRefresh?: () => void
  isLoading?: boolean
}

export default function LiveDataIndicator({ lastUpdated, onRefresh, isLoading = false }: LiveDataIndicatorProps) {
  const { isAutoRefresh, setIsAutoRefresh, lastRefresh } = useAutoRefresh()

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleTimeString()
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        {isAutoRefresh ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
        <Badge variant={isAutoRefresh ? "default" : "secondary"}>
          {isAutoRefresh ? "Live Updates ON" : "Live Updates OFF"}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">Last updated: {formatTime(lastUpdated)}</div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
          {isAutoRefresh ? "Disable Auto" : "Enable Auto"}
        </Button>

        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  )
}
