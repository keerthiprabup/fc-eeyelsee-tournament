"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLiveMatchTracker, useLiveResults } from "@/hooks/use-live-data"
import {
  Play,
  Pause,
  Clock,
  Target,
  AlertTriangle,
  Users,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react"

interface LiveEvent {
  id: string
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "kickoff" | "halftime" | "fulltime"
  minute: number
  player: string
  team: string
  description: string
  timestamp: string
}

interface LiveMatch {
  id: string
  team1: string
  team2: string
  score: { team1: number; team2: number }
  status: "upcoming" | "live" | "halftime" | "completed"
  minute: number
  events: LiveEvent[]
  possession: { team1: number; team2: number }
  shots: { team1: number; team2: number }
  corners: { team1: number; team2: number }
  lastUpdated: string
  round?: string
}

const getEventIcon = (type: LiveEvent["type"]) => {
  switch (type) {
    case "goal":
      return <Target className="w-4 h-4 text-green-500" />
    case "yellow_card":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case "red_card":
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case "substitution":
      return <Users className="w-4 h-4 text-blue-500" />
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />
  }
}

const getEventColor = (type: LiveEvent["type"]) => {
  switch (type) {
    case "goal":
      return "border-l-green-500 bg-green-500/5"
    case "yellow_card":
      return "border-l-yellow-500 bg-yellow-500/5"
    case "red_card":
      return "border-l-red-500 bg-red-500/5"
    case "substitution":
      return "border-l-blue-500 bg-blue-500/5"
    default:
      return "border-l-muted-foreground bg-muted/5"
  }
}

const LiveEventCard = ({ event }: { event: LiveEvent }) => (
  <div className={`p-3 border-l-4 rounded-r-lg ${getEventColor(event.type)} mb-3`}>
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {getEventIcon(event.type)}
        <Badge variant="outline" className="text-xs">
          {event.minute}'
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold">{event.player}</span>
          {event.team && (
            <Badge variant="secondary" className="text-xs">
              {event.team}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </div>
    </div>
  </div>
)

export default function LiveMatchTracker() {
  const { liveMatch, isLoading, isError, lastUpdated, refresh, connectionStatus } = useLiveMatchTracker()
  const { results } = useLiveResults()
  const [isAutoUpdate, setIsAutoUpdate] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastEventId, setLastEventId] = useState<string>("")

  const match = liveMatch || null

  useEffect(() => {
    if (match?.events && match.events.length > 0) {
      const latestEvent = match.events[match.events.length - 1]
      if (latestEvent.id !== lastEventId && soundEnabled) {
        console.log("New event:", latestEvent.description)
        setLastEventId(latestEvent.id)
      }
    }
  }, [match?.events, lastEventId, soundEnabled])

  const refreshData = () => {
    refresh()
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live match data...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-balance mb-4">Live Match Tracker</h1>
          <p className="text-muted-foreground text-balance">No live matches currently in progress</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
            <p className="text-muted-foreground mb-4">Check back later or view completed results below</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
            <div className="grid gap-4">
              {results.slice(0, 3).map((result: any) => (
                <Card key={result.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{result.team1}</span>
                        <Badge variant="outline">{result.score?.team1 || 0}</Badge>
                        <span className="text-muted-foreground">-</span>
                        <Badge variant="outline">{result.score?.team2 || 0}</Badge>
                        <span className="font-semibold">{result.team2}</span>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-semibold">LIVE</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">Live Match Tracker</h1>
        </div>
        <p className="text-muted-foreground text-balance">Real-time updates from Google Sheets</p>
      </div>

      <div className="flex items-center justify-between mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
                  Disconnected
                </Badge>
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsAutoUpdate(!isAutoUpdate)}>
            {isAutoUpdate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoUpdate ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-8 border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                LIVE
              </Badge>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{match.minute}'</span>
              </div>
            </div>
            <Badge variant="outline">{match.round || "Round 1"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center gap-8 py-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{match.team1}</div>
              <div className="text-6xl font-bold text-primary">{match.score.team1}</div>
            </div>
            <div className="text-3xl font-bold text-muted-foreground">-</div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{match.team2}</div>
              <div className="text-6xl font-bold text-primary">{match.score.team2}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Match Progress</span>
              <span>{match.minute}/90 minutes</span>
            </div>
            <Progress value={(match.minute / 90) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Live Events</TabsTrigger>
          <TabsTrigger value="stats">Match Stats</TabsTrigger>
          <TabsTrigger value="commentary">Commentary</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                {match.events && match.events.length > 0 ? (
                  match.events
                    .sort((a, b) => b.minute - a.minute)
                    .map((event) => <LiveEventCard key={event.id} event={event} />)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No events recorded yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Possession</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{match.team1}</span>
                    <span>{match.possession.team1}%</span>
                  </div>
                  <div className="flex h-4 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary" style={{ width: `${match.possession.team1}%` }} />
                    <div className="bg-secondary" style={{ width: `${match.possession.team2}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{match.team2}</span>
                    <span>{match.possession.team2}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shots</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{match.shots.team1}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-semibold">{match.shots.team2}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Corners</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{match.corners.team1}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-semibold">{match.corners.team2}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Goals</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-primary">{match.score.team1}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-semibold text-primary">{match.score.team2}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commentary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Commentary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      38'
                    </Badge>
                    <span className="text-sm font-semibold">Current Play</span>
                  </div>
                  <p className="text-sm">
                    FC EEYELSEE B is maintaining possession in the midfield. They're looking for an opening to extend
                    their lead.
                  </p>
                </div>

                <div className="p-3 bg-green-500/5 border-l-4 border-l-green-500 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      35'
                    </Badge>
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold">GOAL!</span>
                  </div>
                  <p className="text-sm">
                    What a finish by Omar Ali! FC EEYELSEE B takes the lead again with a brilliant individual effort.
                    The striker received the ball on the edge of the box and slotted it home with precision.
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      32'
                    </Badge>
                    <span className="text-sm font-semibold">Play Update</span>
                  </div>
                  <p className="text-sm">
                    Both teams are creating chances now. The match has really opened up after that equalizer from
                    CHICKEN FC.
                  </p>
                </div>

                <div className="p-3 bg-green-500/5 border-l-4 border-l-green-500 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      25'
                    </Badge>
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold">GOAL!</span>
                  </div>
                  <p className="text-sm">
                    Chris Wilson equalizes for CHICKEN FC! A perfectly placed header from the corner kick finds the back
                    of the net. Game on!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
