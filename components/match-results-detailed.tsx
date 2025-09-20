"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Target, Users, ChevronDown, ChevronUp } from "lucide-react"
import { fetchGoogleSheetsData, transformResultsData, GoogleSheetsResult } from "@/lib/excel-integration"

interface GoalScorer {
  player: string
  team: string
  minute: number
  penalty?: boolean
}

interface DetailedMatch {
  id: string
  team1: string
  team2: string
  score: { team1: number; team2: number } // normal goals
  penalties?: { team1: number; team2: number }
  date: string
  time: string
  venue: string
  round: string
  goalScorers: GoalScorer[]
  possession?: { team1: number; team2: number }
  // shots?: { team1: number; team2: number }
  // corners?: { team1: number; team2: number }
}

// -------------------------
// Date Parser
// -------------------------
const parseDate = (dateStr?: string) => {
  if (!dateStr) return new Date()
  const parts = dateStr.split(/[-/]/)
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(dateStr)
}

// -------------------------
// Detailed Match Card
// -------------------------
const DetailedMatchCard = ({ match }: { match: DetailedMatch }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-3 text-balance">
              {match.team1} vs {match.team2}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{parseDate(match.date).toLocaleDateString()}</span>
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
          <Badge variant="outline">{match.round}</Badge>
        </div>

        {/* Score Display */}
        <div className="flex justify-center items-center gap-8 py-6">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">{match.team1}</div>
            <div
              className={`text-4xl font-bold ${
                match.score.team1 > match.score.team2 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {match.score.team1}
            </div>
            {match.penalties?.team1 != null && (
              <div className="text-sm text-muted-foreground">Penalties: {match.penalties.team1}</div>
            )}
          </div>
          <div className="text-2xl font-bold text-muted-foreground">-</div>
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">{match.team2}</div>
            <div
              className={`text-4xl font-bold ${
                match.score.team2 > match.score.team1 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {match.score.team2}
            </div>
            {match.penalties?.team2 != null && (
              <div className="text-sm text-muted-foreground">Penalties: {match.penalties.team2}</div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Goal Scorers */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goal Scorers
            </h4>
            <div className="space-y-2">
              {match.goalScorers.map((scorer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {scorer.minute}’ {scorer.penalty ? "P" : ""}
                    </Badge>
                    <span className="font-medium">{scorer.player}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {scorer.team}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Match Statistics */}
          {match.possession && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Match Statistics
              </h4>

              {/* Possession */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Possession</span>
                  <span>
                    {match.possession.team1}% - {match.possession.team2}%
                  </span>
                </div>
                <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: `${match.possession.team1}%` }} />
                  <div className="bg-secondary" style={{ width: `${match.possession.team2}%` }} />
                </div>
              </div>

              {/* Shots */}
              {match.shots && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm">Shots</span>
                  <span className="text-sm font-medium">
                    {match.shots.team1} - {match.shots.team2}
                  </span>
                </div>
              )}

              {/* Corners */}
              {match.corners && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Corners</span>
                  <span className="text-sm font-medium">
                    {match.corners.team1} - {match.corners.team2}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// -------------------------
// Main Component
// -------------------------
export default function MatchResultsDetailed() {
  const [matches, setMatches] = useState<DetailedMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const resultsCSV = await fetchGoogleSheetsData("results")
        const resultsData: GoogleSheetsResult[] = transformResultsData(resultsCSV)

        const detailedMatches: DetailedMatch[] = resultsData.map((match, idx) => {
          const parseScorers = (scorersStr: string | undefined, team: string) =>
            (scorersStr?.split(",") ?? []).map((g) => {
              const player = g.split("(")[0].trim()
              const minuteMatch = g.match(/\d+/)
              return {
                player,
                team,
                minute: minuteMatch ? Number(minuteMatch[0]) : 0,
                penalty: g.toLowerCase().includes("penalty"),
              }
            })

          const team1Scorers = parseScorers(match.goalScorersTeam1, match.team1)
          const team2Scorers = parseScorers(match.goalScorersTeam2, match.team2)

          return {
            id: `m${idx + 1}`,
            team1: match.team1,
            team2: match.team2,
            score: {
              team1: team1Scorers.filter((g) => !g.penalty).length,
              team2: team2Scorers.filter((g) => !g.penalty).length,
            },
            penalties: {
              team1: team1Scorers.filter((g) => g.penalty).length,
              team2: team2Scorers.filter((g) => g.penalty).length,
            },
            date: match.date,
            time: match.time,
            venue: match.venue,
            round: match.round,
            goalScorers: [...team1Scorers, ...team2Scorers],
            possession: match.possession,
            shots: match.shots,
            corners: match.corners,
          }
        })

        setMatches(detailedMatches)
      } catch (err) {
        console.error("Failed to fetch detailed matches:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="text-center py-16">Loading detailed match results...</div>

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-balance">Detailed Match Results</h2>
        <p className="text-muted-foreground text-balance">Complete match analysis with statistics and goal details</p>
      </div>

      {matches.map((match) => (
        <DetailedMatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}
