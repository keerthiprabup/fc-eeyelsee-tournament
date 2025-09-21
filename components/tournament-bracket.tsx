"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

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
  dateObj?: Date | null
}

const initialTournamentData: Match[] = []

const createTBDMatch = (idSuffix = ""): Match => ({
  id: `tbd-${idSuffix}-${Math.random().toString(36).slice(2, 8)}`,
  team1: { name: "TBD" },
  team2: { name: "TBD" },
  round: "TBD",
  completed: false,
  dateObj: null,
})

const safeSlice = (arr: Match[], start: number, end: number, expectedCount: number) => {
  const slice = arr.slice(start, end)
  const out = slice.slice(0, expectedCount)
  while (out.length < expectedCount) out.push(createTBDMatch(`slice-${start}-${out.length}`))
  return out
}

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

const TeamRow = ({ team }: { team: Team }) => (
  <div className="flex justify-between items-center text-sm">
    <span className={`truncate break-words max-w-[70%] ${team.winner ? "font-bold" : ""}`}>
      {team.name}
    </span>
    {team.score !== undefined && (
      <Badge variant={team.winner ? "default" : "secondary"} className="text-xs ml-2">
        {team.score}
      </Badge>
    )}
  </div>
)

const MatchCard = ({ match }: { match: Match }) => {
  return (
    <Card className="w-full sm:w-44 md:w-52 lg:w-56 h-auto bg-card border-border hover:bg-accent/10 transition-colors">
      <CardContent className="p-3 h-full flex flex-col justify-center gap-1">
        <TeamRow team={match.team1} />
        <TeamRow team={match.team2} />
      </CardContent>
    </Card>
  )
}

const HorizontalConnector = ({ length = "short" }: { length?: "short" | "long" }) => (
  <div aria-hidden className={`hidden lg:block bg-border h-0.5 ${length === "short" ? "w-12" : "w-24"} mx-4`} />
)

const VerticalConnector = ({ height = "short" }: { height?: "short" | "long" }) => (
  <div aria-hidden className={`hidden lg:block bg-border w-0.5 ${height === "short" ? "h-8" : "h-16"} mx-auto`} />
)

const MobileConnector = () => (
  <div aria-hidden className="flex items-center justify-center sm:hidden my-2">
    <div className="w-0.5 h-6 bg-border rounded" />
  </div>
)

export default function TournamentBracket() {
  const [tournamentData, setTournamentData] = useState<Match[]>(initialTournamentData)
  const [loading, setLoading] = useState<boolean>(true)
  const [mobileTab, setMobileTab] = useState<'round16' | 'quarters' | 'semis'>('round16')
  const [isWide, setIsWide] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1250 : false)

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 1250)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let mounted = true
    const normalize = (s: any) => (s === undefined || s === null) ? "" : String(s).trim().toLowerCase()

    const fetchMatchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/matches')
        const payload = await res.json()
        if (!mounted) return

        if (payload?.success && Array.isArray(payload.data)) {
          let matches: Match[] = payload.data.map((m: any, idx: number) => {
            const t1Raw = m.team1 ?? m.team_a ?? m.teamA ?? m.Team1 ?? `Team ${idx * 2 + 1}`
            const t2Raw = m.team2 ?? m.team_b ?? m.teamB ?? m.Team2 ?? `Team ${idx * 2 + 2}`
            const team1Name = String(t1Raw)
            const team2Name = String(t2Raw)

            const scoreObj = m.score ?? m.result_score ?? m.scores ?? undefined
            const team1Score = typeof scoreObj === 'object' ? (scoreObj.team1 ?? scoreObj.team_a ?? scoreObj.a) : (m.score1 ?? m.score_1 ?? undefined)
            const team2Score = typeof scoreObj === 'object' ? (scoreObj.team2 ?? scoreObj.team_b ?? scoreObj.b) : (m.score2 ?? m.score_2 ?? undefined)

            const rawResult = m.result ?? m.Result ?? m.winner ?? m.Winner ?? undefined
            const resultNormalized = normalize(rawResult)

            const t1Norm = normalize(team1Name)
            const t2Norm = normalize(team2Name)

            let team1Wins: boolean | undefined = undefined
            let team2Wins: boolean | undefined = undefined

            if (resultNormalized) {
              if (["team1", "1", "a"].includes(resultNormalized)) team1Wins = true
              else if (["team2", "2", "b"].includes(resultNormalized)) team2Wins = true
              else {
                if (resultNormalized === t1Norm) team1Wins = true
                else if (resultNormalized === t2Norm) team2Wins = true
                else if (t1Norm && t1Norm.includes(resultNormalized)) team1Wins = true
                else if (t2Norm && t2Norm.includes(resultNormalized)) team2Wins = true
              }
            }

            // parse date
            const dateStr = m.datetime ?? m.date ?? m.Date ?? null
            const dateObj = dateStr ? new Date(dateStr) : null

            return {
              id: m.id ?? `match-${idx + 1}`,
              team1: { name: team1Name, score: team1Score, winner: team1Wins },
              team2: { name: team2Name, score: team2Score, winner: team2Wins },
              round: m.round ?? undefined,
              completed: false,
              dateObj,
            }
          })

          // ✅ Sort by date (latest first)
          matches.sort((a, b) => {
            if (!a.dateObj && !b.dateObj) return 0
            if (!a.dateObj) return 1
            if (!b.dateObj) return -1
            return b.dateObj.getTime() - a.dateObj.getTime()
          })

          setTournamentData(matches)
        } else {
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
    const interval = setInterval(fetchMatchData, 60000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2 text-balance">7'S FOOTBALL TOURNAMENT</h2>
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
          <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2 text-balance">7'S FOOTBALL TOURNAMENT</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-muted-foreground">No tournament matches found. Please check the Google Sheets / API data.</div>
        </div>
      </div>
    )
  }

  /* ----------------------------- Split Rounds ------------------------------ */
  const roundOf16 = safeSlice(tournamentData, 0, 8, 8)
  const leftRound1Pairs = groupPairs(roundOf16.slice(0, 4))
  const rightRound1Pairs = groupPairs(roundOf16.slice(4, 8))

  const quarters = safeSlice(tournamentData, 8, 12, 4)
  const leftQuarters = [quarters[0], quarters[1]]
  const rightQuarters = [quarters[2], quarters[3]]

  const semiLeft = tournamentData[12] ?? createTBDMatch("semi-left")
  const semiRight = tournamentData[13] ?? createTBDMatch("semi-right")
  const finalMatch = tournamentData[14] ?? createTBDMatch("final")

  const allRoundOf16 = [...roundOf16.slice(0, 4), ...roundOf16.slice(4, 8)]
  const semisAndFinal = [semiLeft, semiRight, finalMatch]

  /* ------------------------------- Rendering ------------------------------- */
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">FC EEYELSEE PRESENTS</h1>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-primary mb-2 text-balance">7'S FOOTBALL TOURNAMENT</h2>
      </div>

      <div className="overflow-x-auto">
        {/* MOBILE view */}
        {!isWide && (
          <div className="block p-4">
            <div className="mb-4">
              <div role="tablist" aria-label="Tournament rounds" className="flex gap-2">
                <button
                  role="tab"
                  aria-selected={mobileTab === 'round16'}
                  onClick={() => setMobileTab('round16')}
                  className={`px-3 py-2 rounded-md text-sm font-medium w-full ${mobileTab === 'round16' ? 'bg-primary text-white' : 'bg-card border'}`}>
                  Round of 16
                </button>
                <button
                  role="tab"
                  aria-selected={mobileTab === 'quarters'}
                  onClick={() => setMobileTab('quarters')}
                  className={`px-3 py-2 rounded-md text-sm font-medium w-full ${mobileTab === 'quarters' ? 'bg-primary text-white' : 'bg-card border'}`}>
                  Quarterfinals
                </button>
                <button
                  role="tab"
                  aria-selected={mobileTab === 'semis'}
                  onClick={() => setMobileTab('semis')}
                  className={`px-3 py-2 rounded-md text-sm font-medium w-full ${mobileTab === 'semis' ? 'bg-primary text-white' : 'bg-card border'}`}>
                  Semis & Final
                </button>
              </div>
            </div>

            <div>
              {mobileTab === 'round16' && (
                <section aria-labelledby="mobile-r16">
                  <h3 id="mobile-r16" className="text-lg font-semibold mb-2">Round of 16</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {allRoundOf16.map((m) => (
                      <div key={m.id} className="p-3 bg-card border rounded">
                        <TeamRow team={m.team1} />
                        <TeamRow team={m.team2} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {mobileTab === 'quarters' && (
                <section aria-labelledby="mobile-qf">
                  <h3 id="mobile-qf" className="text-lg font-semibold mb-2">Quarterfinals</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {quarters.map((m) => (
                      <div key={m.id} className="p-3 bg-card border rounded">
                        <TeamRow team={m.team1} />
                        <TeamRow team={m.team2} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {mobileTab === 'semis' && (
                <section aria-labelledby="mobile-semis">
                  <h3 id="mobile-semis" className="text-lg font-semibold mb-2">Semifinals & Final</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {semisAndFinal.map((m) => (
                      <div key={m.id} className="p-3 bg-card border rounded">
                        <TeamRow team={m.team1} />
                        <TeamRow team={m.team2} />
                        {m.id === finalMatch.id && (m.team1.winner || m.team2.winner) && (
                          <div className="text-center mt-2">
                            <Trophy className="inline h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-semibold text-sm">
                              Winner: {m.team1.winner ? m.team1.name : m.team2.winner ? m.team2.name : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* DESKTOP view */}
        {isWide && (
          <div className="hidden lg:block">
            <div className="min-w-max flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
              {/* Round 1 Left */}
              <section aria-labelledby="round1-left" className="flex flex-col items-end gap-6 w-full sm:w-auto">
                <h3 id="round1-left" className="text-lg font-semibold text-center mb-1">Round 1</h3>
                <div className="flex flex-col gap-6 lg:gap-12 w-full">
                  {leftRound1Pairs.map((pair, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full">
                      <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <MatchCard match={pair[0]} />
                        <MobileConnector />
                        <MatchCard match={pair[1]} />
                      </div>
                      <div className="hidden lg:flex flex-col items-center">
                        <HorizontalConnector />
                        <VerticalConnector height="long" />
                        <HorizontalConnector />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Left Quarters */}
              <section aria-labelledby="quarters-left" className="flex flex-col items-center gap-6 w-full sm:w-auto">
                <h3 id="quarters-left" className="text-lg font-semibold mb-1">Quarterfinals</h3>
                <div className="flex flex-col gap-6 w-full sm:w-auto">
                  <MatchCard match={leftQuarters[0]} />
                  <MatchCard match={leftQuarters[1]} />
                </div>
                <div className="hidden lg:flex flex-col items-center">
                  <HorizontalConnector />
                </div>
              </section>

              {/* Semi Left */}
              <section aria-labelledby="semi-left" className="flex flex-col items-center gap-6 w-full sm:w-auto">
                <h3 id="semi-left" className="text-lg font-semibold mb-1">Semifinal</h3>
                <div className="mt-2 w-full sm:w-auto">
                  <MatchCard match={semiLeft} />
                </div>
              </section>

              {/* Final */}
              <section aria-labelledby="final" className="flex flex-col items-center mx-4 lg:mx-8 w-full sm:w-auto">
                <Trophy className="w-12 h-12 text-primary mb-2" />
                <h3 id="final" className="text-xl sm:text-2xl font-bold text-primary mb-3">FINAL</h3>
                <div className="mb-2 w-full sm:w-auto">
                  <MatchCard match={finalMatch} />
                </div>
                {finalMatch && (finalMatch.team1.winner || finalMatch.team2.winner) && (
                  <div className="flex flex-col items-center mt-4">
                    <div className="text-lg font-bold text-primary">🏆 WINNER 🏆</div>
                    <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                      {finalMatch.team1.winner ? finalMatch.team1.name : finalMatch.team2.winner ? finalMatch.team2.name : ""}
                    </div>
                  </div>
                )}
              </section>

              {/* Semi Right */}
              <section aria-labelledby="semi-right" className="flex flex-col items-center gap-6 w-full sm:w-auto">
                <h3 id="semi-right" className="text-lg font-semibold mb-1">Semifinal</h3>
                <div className="mt-2 w-full sm:w-auto">
                  <MatchCard match={semiRight} />
                </div>
              </section>

              {/* Right Quarters */}
              <section aria-labelledby="quarters-right" className="flex flex-col items-center gap-6 w-full sm:w-auto">
                <h3 id="quarters-right" className="text-lg font-semibold mb-1">Quarterfinals</h3>
                <div className="flex flex-col gap-6 w-full sm:w-auto">
                  <MatchCard match={rightQuarters[0]} />
                  <MatchCard match={rightQuarters[1]} />
                </div>
              </section>

              {/* Round 1 Right */}
              <section aria-labelledby="round1-right" className="flex flex-col items-start gap-6 w-full sm:w-auto">
                <h3 id="round1-right" className="text-lg font-semibold text-center mb-1">Round 1</h3>
                <div className="flex flex-col gap-6 lg:gap-12 w-full">
                  {rightRound1Pairs.map((pair, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
                      <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <MatchCard match={pair[0]} />
                        <MobileConnector />
                        <MatchCard match={pair[1]} />
                      </div>
                      <div className="hidden lg:flex flex-col items-center">
                        <HorizontalConnector />
                        <VerticalConnector height="long" />
                        <HorizontalConnector />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
