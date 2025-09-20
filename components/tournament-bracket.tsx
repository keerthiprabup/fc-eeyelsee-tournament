"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

/**
 * TournamentBracket.tsx
 *
 * - 16 teams assumed:
 *   - Round of 16: indices 0..7   (8 matches)
 *   - Quarterfinals: indices 8..11 (4 matches)
 *   - Semifinals: indices 12..13   (2 matches)
 *   - Final: index 14              (1 match)
 *
 * The code is defensive: if the API returns fewer matches it renders "TBD" placeholders.
 */

/* ----------------------------- Types / Helpers ----------------------------- */

interface Team {
  name: string
  score?: number
  winner?: boolean
}

interface Match {
  id: string
  team1: Team
  team2: Team
  round?: string
  completed?: boolean
}

const initialTournamentData: Match[] = []

const createTBDMatch = (idSuffix = ""): Match => ({
  id: `tbd-${idSuffix}-${Math.random().toString(36).slice(2, 8)}`,
  team1: { name: "TBD" },
  team2: { name: "TBD" },
  round: "TBD",
  completed: false,
})

/* safe slice that returns expectedCount matches (fills with TBD if missing) */
const safeSlice = (arr: Match[], start: number, end: number, expectedCount: number) => {
  const slice = arr.slice(start, end)
  const out = slice.slice(0, expectedCount)
  while (out.length < expectedCount) out.push(createTBDMatch(`slice-${start}-${out.length}`))
  return out
}

/* group pairs: [ [m0,m1], [m2,m3], ... ] */
const groupPairs = (matches: Match[]) => {
  const pairs: [Match, Match][] = []
  for (let i = 0; i < matches.length; i += 2) {
    const a = matches[i] ?? createTBDMatch(`pair-a-${i}`)
    const b = matches[i + 1] ?? createTBDMatch(`pair-b-${i + 1}`)
    pairs.push([a, b])
  }
  return pairs
}

/* ----------------------------- UI Components ------------------------------ */

const MatchCard = ({ match }: { match: Match }) => {
  return (
    <Card className="w-44 sm:w-48 md:w-52 lg:w-56 h-20 bg-card border-border hover:bg-accent/10 transition-colors">
      <CardContent className="p-3 h-full flex flex-col justify-center gap-1">
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
}

/* simple decorative connectors - visible on large screens; vertical on mobile */
const HorizontalConnector = ({ length = "short" }: { length?: "short" | "long" }) => (
  <div
    aria-hidden
    className={`hidden lg:block bg-border h-0.5 ${length === "short" ? "w-12" : "w-24"} mx-4`}
  />
)

const VerticalConnector = ({ height = "short" }: { height?: "short" | "long" }) => (
  <div
    aria-hidden
    className={`hidden lg:block bg-border w-0.5 ${height === "short" ? "h-8" : "h-16"} mx-auto`}
  />
)

/* ----------------------------- Main Component ----------------------------- */

export default function TournamentBracket() {
  const [tournamentData, setTournamentData] = useState<Match[]>(initialTournamentData)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    const fetchMatchData = async () => {
      try {
        setLoading(true)
        // fetch from your api route; adjust if your endpoint differs
        const res = await fetch("/api/matches")
        const payload = await res.json()
        if (!mounted) return

        if (payload?.success && Array.isArray(payload.data)) {
          // normalize incoming data -> Match[]
          const matches: Match[] = payload.data.map((m: any, idx: number) => {
            const score = m.score ?? m.result ?? undefined
            const t1 = m.team1 ?? m.team_a ?? m.teamA ?? `Team ${idx * 2 + 1}`
            const t2 = m.team2 ?? m.team_b ?? m.teamB ?? `Team ${idx * 2 + 2}`
            const team1Score = score?.team1 ?? score?.team_a ?? score?.a
            const team2Score = score?.team2 ?? score?.team_b ?? score?.b
            const team1Wins = (typeof team1Score === "number" && typeof team2Score === "number")
              ? team1Score > team2Score
              : undefined
            const team2Wins = (typeof team1Score === "number" && typeof team2Score === "number")
              ? team2Score > team1Score
              : undefined

            return {
              id: m.id ?? `match-${idx + 1}`,
              team1: { name: t1, score: typeof team1Score === "number" ? team1Score : undefined, winner: team1Wins },
              team2: { name: t2, score: typeof team2Score === "number" ? team2Score : undefined, winner: team2Wins },
              round: m.round ?? undefined,
              completed: m.status === "completed" || m.status === "finished" || m.completed === true,
            } as Match
          })

          // guarantee we return a predictable length array (at least 15 entries expected)
          setTournamentData(matches)
        } else {
          // if unexpected response shape, clear and allow placeholders
          setTournamentData([])
        }
      } catch (err) {
        console.error("Error fetching match data:", err)
        setTournamentData([])
      } finally {
        setLoading(false)
      }
    }

    fetchMatchData()
    const interval = setInterval(fetchMatchData, 60000) // refresh every 60s
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  /* --------------------------- Loading / Empty UI --------------------------- */
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2 text-balance">
            7'S FOOTBALL TOURNAMENT
          </h2>
        </div>
        <div className="flex justify-center items-center h-48">
          <div className="text-lg text-muted-foreground">Loading tournament data...</div>
        </div>
      </div>
    )
  }

  if (!tournamentData || tournamentData.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2 text-balance">
            7'S FOOTBALL TOURNAMENT
          </h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-muted-foreground">
            No tournament matches found. Please check the Google Sheets / API data.
          </div>
        </div>
      </div>
    )
  }

  /* ----------------------------- Split Rounds ------------------------------ */
  // Round of 16 (8 matches)
  const roundOf16 = safeSlice(tournamentData, 0, 8, 8)
  const leftRound1Pairs = groupPairs(roundOf16.slice(0, 4)) // 2 pairs (4 matches)
  const rightRound1Pairs = groupPairs(roundOf16.slice(4, 8)) // 2 pairs (4 matches)

  // Quarterfinals (4 matches)
  const quarters = safeSlice(tournamentData, 8, 12, 4)
  const leftQuarters = [quarters[0] ?? createTBDMatch("q-l-0"), quarters[1] ?? createTBDMatch("q-l-1")]
  const rightQuarters = [quarters[2] ?? createTBDMatch("q-r-0"), quarters[3] ?? createTBDMatch("q-r-1")]

  // Semifinals
  const semiLeft = tournamentData[12] ?? createTBDMatch("semi-left")
  const semiRight = tournamentData[13] ?? createTBDMatch("semi-right")

  // Final
  const finalMatch = tournamentData[14] ?? createTBDMatch("final")

  /* ------------------------------- Rendering ------------------------------- */
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2 text-balance">
          7'S FOOTBALL TOURNAMENT
        </h2>
      </div>

      {/* Bracket Container - horizontally scrollable on small screens; wide layout on large screens */}
      <div className="overflow-x-auto">
        <div className="min-w-max flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
          {/* --------------------------- LEFT SIDE --------------------------- */}
          <div className="flex flex-col items-end gap-6">
            <h3 className="text-lg font-semibold text-center mb-1">Round 1</h3>

            {/* leftRound1Pairs contains two pairs (each pair contains two MatchCards stacked) */}
            <div className="flex flex-col gap-8 lg:gap-12">
              {leftRound1Pairs.map((pair, idx) => (
                <div key={idx} className="flex items-center lg:items-end gap-4">
                  <div className="flex flex-col gap-3">
                    <MatchCard match={pair[0]} />
                    <MatchCard match={pair[1]} />
                  </div>

                  {/* connector from pair -> quarter (decorative on large screens) */}
                  <div className="hidden lg:flex flex-col items-center">
                    <HorizontalConnector />
                    <VerticalConnector height="long" />
                    <HorizontalConnector />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quarterfinals (left) */}
          <div className="flex flex-col items-center gap-10">
            <h3 className="text-lg font-semibold mb-1">Quarterfinals</h3>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-3">
                <MatchCard match={leftQuarters[0]} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <MatchCard match={leftQuarters[1]} />
              </div>
            </div>

            {/* connectors from quarters -> semi (decorative) */}
            <div className="hidden lg:flex flex-col items-center">
              <HorizontalConnector />
            </div>
          </div>

          {/* Semifinal (left) */}
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-lg font-semibold mb-1">Semifinal</h3>
            <div className="mt-2">
              <MatchCard match={semiLeft} />
            </div>
          </div>

          {/* ----------------------------- FINAL ----------------------------- */}
          <div className="flex flex-col items-center mx-4 lg:mx-8">
            <Trophy className="w-12 h-12 text-primary mb-2" />
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3">FINAL</h3>
            <div className="mb-2">
              <MatchCard match={finalMatch} />
            </div>
          </div>

          {/* ------------------------- RIGHT (mirror) ------------------------ */}
          {/* Semifinal (right) */}
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-lg font-semibold mb-1">Semifinal</h3>
            <div className="mt-2">
              <MatchCard match={semiRight} />
            </div>
            <div className="hidden lg:flex flex-col items-center">
              <HorizontalConnector />
            </div>
          </div>

          {/* Quarterfinals (right) */}
          <div className="flex flex-col items-center gap-10">
            <h3 className="text-lg font-semibold mb-1">Quarterfinals</h3>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-3">
                <MatchCard match={rightQuarters[0]} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <MatchCard match={rightQuarters[1]} />
              </div>
            </div>
          </div>

          {/* Round 1 (right) */}
          <div className="flex flex-col items-start gap-6">
            <h3 className="text-lg font-semibold text-center mb-1">Round 1</h3>
            <div className="flex flex-col gap-8 lg:gap-12">
              {rightRound1Pairs.map((pair, idx) => (
                <div key={idx} className="flex items-center lg:items-start gap-4">
                  {/* connector from quarter -> pair (decorative on large screens) */}
                  <div className="hidden lg:flex flex-col items-center">
                    <HorizontalConnector />
                    <VerticalConnector height="long" />
                    <HorizontalConnector />
                  </div>

                  <div className="flex flex-col gap-3">
                    <MatchCard match={pair[0]} />
                    <MatchCard match={pair[1]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
