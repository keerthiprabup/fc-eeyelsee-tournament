"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Play, CheckCircle, AlertCircle } from "lucide-react"
import { useLiveMatches } from "@/hooks/use-live-data"
import LiveDataIndicator from "@/components/live-data-indicator"

interface Match {
  id: string
  team1: string
  team2: string
  date: string
  time: string
  venue: string
  round: string
  status: "upcoming" | "live" | "completed" | "postponed"
  score?: { team1: number; team2: number }
  goalScorers?: { team1: string[]; team2: string[] }
  penalties?: { team1: number; team2: number }
  cards?: { team1: string[]; team2: string[] }
}

// -------------------------
// Utility: Parse DD-MM-YYYY
// -------------------------
function parseDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null
  const [day, month, year] = dateStr.split("-").map(Number)
  if (!day || !month || !year) return null

  if (timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return new Date(year, month - 1, day, hours || 0, minutes || 0)
  }
  return new Date(year, month - 1, day)
}

// -------------------------
// Status helpers
// -------------------------
function normalizeStatus(status: string): Match["status"] {
  switch (status.toLowerCase()) {
    case "completed":
    case "finished":
    case "done":
      return "completed"
    case "live":
      return "live"
    case "postponed":
      return "postponed"
    case "upcoming":
    default:
      return "upcoming"
  }
}

const getStatusIcon = (status: Match["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "live":
      return <Play className="w-4 h-4 text-red-500 animate-pulse" />
    case "upcoming":
      return <Clock className="w-4 h-4 text-blue-500" />
    case "postponed":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
  }
}

const getStatusColor = (status: Match["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-600/20 text-green-400 border border-green-500/30"
    case "live":
      return "bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse"
    case "upcoming":
      return "bg-blue-600/20 text-blue-400 border border-blue-500/30"
    case "postponed":
      return "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
    default:
      return "bg-gray-600/20 text-gray-400 border border-gray-500/30"
  }
}

// -------------------------
// MatchCard component
// -------------------------
const MatchCard = ({ match }: { match: Match }) => {
  return (
    <Card className="bg-card border-border hover:bg-accent/10 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-balance mb-2">
              {match.team1} vs {match.team2}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{parseDateTime(match.date, match.time)?.toLocaleDateString() || match.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{match.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{match.venue}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(match.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(match.status)}
                <span className="capitalize">{match.status}</span>
              </div>
            </Badge>
            <Badge variant="outline" className="text-xs">
              {match.round}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {match.score && (
          <div className="mb-4">
            <div className="flex justify-center items-center gap-4 text-2xl font-bold">
              <span className={match.score.team1 > match.score.team2 ? "text-primary" : "text-muted-foreground"}>
                {match.score.team1}
              </span>
              <span className="text-muted-foreground">-</span>
              <span className={match.score.team2 > match.score.team1 ? "text-primary" : "text-muted-foreground"}>
                {match.score.team2}
              </span>
            </div>
          </div>
        )}

        {match.penalties &&
          ((Number(match.penalties.team1) > 0) || (Number(match.penalties.team2) > 0)) && (
            <div className="mb-4 text-sm text-muted-foreground flex justify-center gap-4">
              <span className={Number(match.penalties.team1) > Number(match.penalties.team2) ? "text-primary font-bold" : ""}>
                {match.team1} Penalties: {match.penalties.team1}
              </span>
              <span className={Number(match.penalties.team2) > Number(match.penalties.team1) ? "text-primary font-bold" : ""}>
                {match.team2} Penalties: {match.penalties.team2}
              </span>
            </div>
          )}

        {match.goalScorers && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Goal Scorers</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium">{match.team1}</h5>
                <ul className="list-disc list-inside">
                  {match.goalScorers.team1.length > 0
                    ? match.goalScorers.team1.map((p, i) => <li key={i}>{p}</li>)
                    : <li>-</li>}
                </ul>
              </div>
              <div>
                <h5 className="font-medium">{match.team2}</h5>
                <ul className="list-disc list-inside">
                  {match.goalScorers.team2.length > 0
                    ? match.goalScorers.team2.map((p, i) => <li key={i}>{p}</li>)
                    : <li>-</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {match.cards && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Cards</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium">{match.team1}</h5>
                <ul className="list-disc list-inside">
                  {match.cards.team1.length > 0 ? (
                    match.cards.team1.map((c, i) => {
                      const isRed = c.toLowerCase().includes("red")
                      const isYellow = c.toLowerCase().includes("yellow")
                      return (
                        <li
                          key={i}
                          className={isRed ? "text-red-500" : isYellow ? "text-yellow-500" : ""}
                        >
                          {c}
                        </li>
                      )
                    })
                  ) : (
                    <li>-</li>
                  )}
                </ul>
              </div>
              <div>
                <h5 className="font-medium">{match.team2}</h5>
                <ul className="list-disc list-inside">
                  {match.cards.team2.length > 0 ? (
                    match.cards.team2.map((c, i) => {
                      const isRed = c.toLowerCase().includes("red")
                      const isYellow = c.toLowerCase().includes("yellow")
                      return (
                        <li
                          key={i}
                          className={isRed ? "text-red-500" : isYellow ? "text-yellow-500" : ""}
                        >
                          {c}
                        </li>
                      )
                    })
                  ) : (
                    <li>-</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// -------------------------
// Main component
// -------------------------
export default function MatchSchedule() {
  const { matches: rawMatches, isLoading, lastUpdated, refresh } = useLiveMatches()

  // ✅ Normalize + sort matches
  const matches = [...rawMatches]
    .map((m) => ({ ...m, status: normalizeStatus(m.status) }))
    .sort((a, b) => {
      const order = { live: 0, upcoming: 1, postponed: 2, completed: 3 }
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]

      const dateA = parseDateTime(a.date, a.time)?.getTime() || 0
      const dateB = parseDateTime(b.date, b.time)?.getTime() || 0
      return dateB - dateA
    })

  const today = new Date()

  const todayMatches = matches.filter((match) => {
    const matchDate = parseDateTime(match.date, match.time)
    return matchDate?.toDateString() === today.toDateString()
  })

  const liveMatches = matches.filter((match) => match.status === "live")
  const completedMatches = matches.filter((match) => match.status === "completed")

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-balance">Match Schedule</h1>
        <p className="text-muted-foreground text-balance">
          Complete fixture list with live updates and detailed match information
        </p>
      </div>

      <div className="mb-8">
        <LiveDataIndicator lastUpdated={lastUpdated} onRefresh={refresh} isLoading={isLoading} />
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="live" className="text-red-500">Live</TabsTrigger>
          <TabsTrigger value="today" className="text-blue-500">Today</TabsTrigger>
          <TabsTrigger value="all" className="text-blue-500">All Matches</TabsTrigger>
          <TabsTrigger value="completed" className="text-green-500">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Live Matches</h2>
            <Badge variant="secondary" className="px-4 py-2">
              <Play className="w-4 h-4 mr-2" />
              {liveMatches.length} live
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Today's Matches</h2>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {todayMatches.length} matches
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {todayMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Match Results</h2>
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              {completedMatches.length} matches completed
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
