"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, AlertTriangle, Shield } from "lucide-react"
import {
  fetchGoogleSheetsData,
  transformResultsData,
  GoogleSheetsResult,
} from "@/lib/excel-integration"

interface PlayerStat {
  name: string
  team: string
  goals: number
  matches: number
  yellowCards?: number
  redCards?: number
  saves?: number
  isTop?: boolean
}

export default function PlayerStatistics() {
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([])
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<PlayerStat[]>([])
  const [topSaves, setTopSaves] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const resultsCSV = await fetchGoogleSheetsData("results")
        const resultsData: GoogleSheetsResult[] = transformResultsData(resultsCSV)

        const scorersMap: Record<string, PlayerStat> = {}
        const cardsMap: Record<string, PlayerStat> = {}
        const savesMap: Record<string, PlayerStat> = {}
        const teamWins: Record<string, number> = {}

        resultsData.forEach((match) => {
          // Track team wins using Result column
          if (match.result && match.result !== "—") {
            teamWins[match.result] = (teamWins[match.result] || 0) + 1
          }

          // --- Goals ---
          const processGoals = (scorersStr: string | undefined, team: string) => {
            if (scorersStr && scorersStr !== "—") {
              const names = scorersStr.split(",").map((n) => n.trim()).filter(Boolean)
              const uniquePlayers = new Set(names)

              names.forEach((name) => {
                if (!scorersMap[name]) {
                  scorersMap[name] = { name, team, goals: 0, matches: 0 }
                }
                scorersMap[name].goals += 1
              })

              uniquePlayers.forEach((name) => {
                if (scorersMap[name]) scorersMap[name].matches += 1
              })
            }
          }

          processGoals(match.goalScorersTeam1, match.team1)
          processGoals(match.goalScorersTeam2, match.team2)

          // --- Cards ---
          const processCards = (cardsStr: string | undefined, team: string) => {
            if (cardsStr && cardsStr !== "—") {
              cardsStr.split(",").forEach((c) => {
                const name = c.split("(")[0].trim()
                const cardType = c.includes("Yellow") ? "yellowCards" : "redCards"
                if (!cardsMap[name]) {
                  cardsMap[name] = { name, team, goals: 0, matches: 0, yellowCards: 0, redCards: 0 }
                }
                cardsMap[name][cardType] = (cardsMap[name][cardType] || 0) + 1
              })
            }
          }

          processCards(match.cardsTeam1, match.team1)
          processCards(match.cardsTeam2, match.team2)

          // --- Saves ---
          const processSaves = (savesStr: string | undefined, team: string) => {
            if (!savesStr || savesStr === "—") return

            savesStr.split(",").forEach((entry) => {
              const parts = entry.trim().split("*")
              const name = (parts[0] || "").trim()
              const saves = Number(parts[1] || 0)

              // Skip invalid entries (no name or no saves)
              if (!name || saves <= 0) return

              if (!savesMap[name]) {
                savesMap[name] = { name, team, goals: 0, matches: 0, saves: 0 }
              }
              savesMap[name].saves = (savesMap[name].saves || 0) + saves
              savesMap[name].matches += 1
            })
          }

          processSaves(match.savesTeam1, match.team1)
          processSaves(match.savesTeam2, match.team2)
        })

        // --- Sort Scorers ---
        const sortedScorers = Object.values(scorersMap).sort((a, b) => {
          if (b.goals !== a.goals) return b.goals - a.goals
          const winsA = teamWins[a.team] || 0
          const winsB = teamWins[b.team] || 0
          if (winsB !== winsA) return winsB - winsA
          return a.matches - b.matches
        })
        const topScorerName = sortedScorers[0]?.name || null
        setTopScorers(sortedScorers.map((p) => ({ ...p, isTop: p.name === topScorerName })))

        // --- Sort Saves ---
        const sortedSaves = Object.values(savesMap).sort((a, b) => {
          if ((b.saves || 0) !== (a.saves || 0)) return (b.saves || 0) - (a.saves || 0)
          const winsA = teamWins[a.team] || 0
          const winsB = teamWins[b.team] || 0
          if (winsB !== winsA) return winsB - winsA
          const avgA = (a.saves || 0) / (a.matches || 1)
          const avgB = (b.saves || 0) / (b.matches || 1)
          return avgB - avgA
        })
        const topSaveName = sortedSaves[0]?.name || null
        setTopSaves(sortedSaves.map((p) => ({ ...p, isTop: p.name === topSaveName })))

        // --- Cards ---
        setDisciplinaryRecords(Object.values(cardsMap))
      } catch (err) {
        console.error("Failed to fetch player stats", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="text-center py-16">Loading player statistics...</div>

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="scorers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="scorers" className="flex items-center gap-2">
            <Target className="w-4 h-4" /> Scorers
          </TabsTrigger>
          <TabsTrigger value="discipline" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Discipline
          </TabsTrigger>
          <TabsTrigger value="saves" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Saves
          </TabsTrigger>
        </TabsList>

        {/* Scorers */}
        <TabsContent value="scorers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topScorers.map((player) => (
              <div key={`${player.name}-${player.team}`} className="relative">
                {player.isTop && (
                  <Badge className="absolute -top-2 -right-2 z-10 bg-yellow-500 text-yellow-900">#1</Badge>
                )}
                <Card className="bg-card border-border hover:bg-accent/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <Badge variant="outline" className="text-xs">{player.team}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{player.goals}</div>
                        <div className="text-xs text-muted-foreground">{player.matches} matches</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Discipline */}
        <TabsContent value="discipline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplinaryRecords.map((player) => (
              <Card key={`${player.name}-${player.team}`} className="bg-card border-border hover:bg-accent/10 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{player.name}</h3>
                      <Badge variant="outline" className="text-xs">{player.team}</Badge>
                    </div>
                    <div className="flex gap-1">
                      {player.yellowCards ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {player.yellowCards}Y
                        </Badge>
                      ) : null}
                      {player.redCards ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          {player.redCards}R
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Saves */}
        <TabsContent value="saves" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSaves.map((player) => (
              <div key={`${player.name}-${player.team}`} className="relative">
                {player.isTop && (
                  <Badge className="absolute -top-2 -right-2 z-10 bg-blue-500 text-white">#1</Badge>
                )}
                <Card className="bg-card border-border hover:bg-accent/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <Badge variant="outline" className="text-xs">{player.team}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{player.saves}</div>
                        <div className="text-xs text-muted-foreground">{player.matches} matches</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
