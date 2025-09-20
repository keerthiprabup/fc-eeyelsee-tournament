"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"

interface Team {
  name: string
  score?: number
  winner?: boolean
}

interface Match {
  id: string
  team1: Team
  team2: Team
  round: string
  completed: boolean
}

interface GoogleSheetsMatch {
  id: string
  team1: string
  team2: string
  score?: { team1: number; team2: number }
  status: string
}

const initialTournamentData: Match[] = []

const MatchCard = ({ match }: { match: Match }) => (
  <Card className="w-48 h-20 bg-card border-border hover:bg-accent/10 transition-colors">
    <CardContent className="p-3 h-full flex flex-col justify-center gap-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium truncate">{match.team1.name}</span>
        {match.team1.score !== undefined && (
          <Badge variant={match.team1.winner ? "default" : "secondary"} className="text-xs">
            {match.team1.score}
          </Badge>
        )}
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium truncate">{match.team2.name}</span>
        {match.team2.score !== undefined && (
          <Badge variant={match.team2.winner ? "default" : "secondary"} className="text-xs">
            {match.team2.score}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
)

const ConnectorLine = ({
  direction = "horizontal",
  length = "short",
}: { direction?: "horizontal" | "vertical"; length?: "short" | "long" }) => (
  <div
    className={`bg-border ${
      direction === "horizontal"
        ? `h-0.5 ${length === "short" ? "w-8" : "w-16"}`
        : `w-0.5 ${length === "short" ? "h-8" : "h-16"}`
    }`}
  />
)

export default function TournamentBracket() {
  const [tournamentData, setTournamentData] = useState<Match[]>(initialTournamentData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        console.log("[v1] Fetching match data...")
        setLoading(true)

        const response = await fetch("/api/matches")
        const data = await response.json()

        console.log("[v1] Match data response:", data)

        if (data.success && data.data) {
          const matches: Match[] = data.data.map((match: any, index: number) => ({
            id: match.id || `match-${index + 1}`,
            team1: {
              name: match.team1,
              score: match.score?.team1,
              winner: match.score && match.score.team1 > match.score.team2,
            },
            team2: {
              name: match.team2,
              score: match.score?.team2,
              winner: match.score && match.score.team2 > match.score.team1,
            },
            round: match.round || "Round 1",
            completed: match.status === "completed",
          }))

          console.log("[v1] Processed matches:", matches)

          setTournamentData(matches)
        }
      } catch (error) {
        console.error("[v1] Error fetching match data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatchData()
    const interval = setInterval(fetchMatchData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
          </div>
          <h2 className="text-5xl font-bold text-primary mb-2 text-balance">7'S FOOTBALL TOURNAMENT</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-muted-foreground">Loading tournament data...</div>
        </div>
      </div>
    )
  }

  if (tournamentData.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
          </div>
          <h2 className="text-5xl font-bold text-primary mb-2 text-balance">7'S FOOTBALL TOURNAMENT</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-muted-foreground">
            No tournament matches found. Please check the Google Sheets data.
          </div>
        </div>
      </div>
    )
  }

  // Split tournament data into stages
  const round1Matches = tournamentData.slice(0, 8)     // 16 teams → 8 matches
  const qualifierMatches = tournamentData.slice(8, 12) // 8 teams → 4 matches
  const semifinalMatches = tournamentData.slice(12, 14) // 4 teams → 2 matches
  const finalMatch = tournamentData.slice(14, 15)       // 2 teams → 1 match

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Tournament Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
        </div>
        <h2 className="text-5xl font-bold text-primary mb-2 text-balance">
          7'S FOOTBALL TOURNAMENT
        </h2>
      </div>

      <div className="flex justify-center items-center gap-8">
        {/* Round 1 */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-center mb-4">Round 1</h3>
          {round1Matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {/* Round 1 → Qualifier connectors */}
        <div className="flex flex-col items-center gap-6">
          {round1Matches.map((_, i) => (
            <div key={i} className="flex items-center">
              <ConnectorLine direction="horizontal" />
            </div>
          ))}
        </div>

        {/* Qualifiers */}
        <div className="flex flex-col gap-8">
          <h3 className="text-lg font-semibold text-center mb-4">Qualifiers</h3>
          {qualifierMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {/* Qualifier → Semifinal connectors */}
        <div className="flex flex-col items-center gap-8">
          {qualifierMatches.map((_, i) => (
            <div key={i} className="flex items-center">
              <ConnectorLine direction="horizontal" />
            </div>
          ))}
        </div>

        {/* Semifinals */}
        <div className="flex flex-col gap-12">
          <h3 className="text-lg font-semibold text-center mb-4">Semifinals</h3>
          {semifinalMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {/* Semifinal → Final connectors */}
        <div className="flex flex-col items-center gap-12">
          {semifinalMatches.map((_, i) => (
            <div key={i} className="flex items-center">
              <ConnectorLine direction="horizontal" length="long" />
            </div>
          ))}
        </div>

        {/* Final */}
        <div className="flex flex-col items-center">
          <Trophy className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-2xl font-bold text-primary mb-6">FINAL</h3>
          {finalMatch.length > 0 ? (
            <MatchCard match={finalMatch[0]} />
          ) : (
            <Card className="w-56 h-24 bg-gradient-to-br from-primary/20 to-accent/20 border-primary">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <span className="text-primary font-semibold">Championship Match</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
