"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Award, AlertTriangle, Clock } from "lucide-react"
import {
  fetchGoogleSheetsData,
  transformResultsData,
  transformTeamsData,
  GoogleSheetsResult,
  GoogleSheetsTeam,
} from "@/lib/excel-integration"

interface PlayerStat {
  name: string
  team: string
  goals: number
  // assists?: number
  yellowCards?: number
  redCards?: number
  minutesPlayed?: number
}

const PlayerStatCard = ({ player, statType }: { player: PlayerStat; statType: "goals" | "cards" }) => (
  <Card className="bg-card border-border hover:bg-accent/10 transition-colors">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{player.name}</h3>
          <Badge variant="outline" className="text-xs">
            {player.team}
          </Badge>
        </div>
        <div className="text-right">
          {statType === "goals" && <div className="text-2xl font-bold text-primary">{player.goals}</div>}
          {/* {statType === "assists" && <div className="text-2xl font-bold text-blue-500">{player.assists || 0}</div>} */}
          {statType === "cards" && (
            <div className="flex items-center gap-1">
              {player.yellowCards && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{player.yellowCards}Y</Badge>
              )}
              {player.redCards && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{player.redCards}R</Badge>
              )}
            </div>
          )}
        </div>
      </div>
      {/* <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{player.minutesPlayed || 0}'</span>
        </div>
        {statType === "goals" && player.assists && (
          <div className="flex items-center gap-1">
            <span>Assists: {player.assists}</span>
          </div>
        )}
      </div> */}
    </CardContent>
  </Card>
)

export default function PlayerStatistics() {
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([])
  // const [topAssists, setTopAssists] = useState<PlayerStat[]>([])
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch Google Sheets results & teams
        const resultsCSV = await fetchGoogleSheetsData("results")
        const teamsCSV = await fetchGoogleSheetsData("teams")

        const resultsData: GoogleSheetsResult[] = transformResultsData(resultsCSV)
        const teamsData: GoogleSheetsTeam[] = transformTeamsData(teamsCSV)

        // Aggregate top scorers & assists
        const scorersMap: Record<string, PlayerStat> = {}
        // const assistsMap: Record<string, PlayerStat> = {}
        const cardsMap: Record<string, PlayerStat> = {}

        resultsData.forEach((match) => {
          // Parse goal scorers
          if (match.goalScorersTeam1 && match.goalScorersTeam1 !== "—") {
            match.goalScorersTeam1.split(",").forEach((g) => {
              const [name] = g.trim().split(" (")
              if (!scorersMap[name]) {
                scorersMap[name] = { name, team: match.team1, goals: 1 }
              } else {
                scorersMap[name].goals += 1
              }
            })
          }
          if (match.goalScorersTeam2 && match.goalScorersTeam2 !== "—") {
            match.goalScorersTeam2.split(",").forEach((g) => {
              const [name] = g.trim().split(" (")
              if (!scorersMap[name]) {
                scorersMap[name] = { name, team: match.team2, goals: 1 }
              } else {
                scorersMap[name].goals += 1
              }
            })
          }

          // // Parse assists (optional)
          // if (match.goalScorersTeam1 && match.goalScorersTeam1 !== "—") {
          //   match.goalScorersTeam1.split(",").forEach((g) => {
          //     const [name] = g.trim().split(" (")
          //     if (!assistsMap[name]) {
          //       assistsMap[name] = { name, team: match.team1, goals: 0, assists: 1 }
          //     } else {
          //       assistsMap[name].assists = (assistsMap[name].assists || 0) + 1
          //     }
          //   })
          // }
          // if (match.goalScorersTeam2 && match.goalScorersTeam2 !== "—") {
          //   match.goalScorersTeam2.split(",").forEach((g) => {
          //     const [name] = g.trim().split(" (")
          //     if (!assistsMap[name]) {
          //       assistsMap[name] = { name, team: match.team2, goals: 0, assists: 1 }
          //     } else {
          //       assistsMap[name].assists = (assistsMap[name].assists || 0) + 1
          //     }
          //   })
          // }

          // Parse disciplinary cards
          if (match.cardsTeam1 && match.cardsTeam1 !== "—") {
            match.cardsTeam1.split(",").forEach((c) => {
              const name = c.split("(")[0].trim()
              const cardType = c.includes("Yellow") ? "yellowCards" : "redCards"
              if (!cardsMap[name]) {
                cardsMap[name] = { name, team: match.team1, goals: 0, yellowCards: 0, redCards: 0 }
              }
              cardsMap[name][cardType] = (cardsMap[name][cardType] || 0) + 1
            })
          }
          if (match.cardsTeam2 && match.cardsTeam2 !== "—") {
            match.cardsTeam2.split(",").forEach((c) => {
              const name = c.split("(")[0].trim()
              const cardType = c.includes("Yellow") ? "yellowCards" : "redCards"
              if (!cardsMap[name]) {
                cardsMap[name] = { name, team: match.team2, goals: 0, yellowCards: 0, redCards: 0 }
              }
              cardsMap[name][cardType] = (cardsMap[name][cardType] || 0) + 1
            })
          }
        })

        setTopScorers(Object.values(scorersMap).sort((a, b) => b.goals - a.goals))
        // setTopAssists(Object.values(assistsMap).sort((a, b) => (b.assists || 0) - (a.assists || 0)))
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
      {/* <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-balance">Player Statistics</h2>
        <p className="text-muted-foreground text-balance">Individual performance metrics from completed matches</p>
      </div> */}

      <Tabs defaultValue="scorers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="scorers" className="flex items-center gap-2">
            <Target className="w-4 h-4" /> Scorers
          </TabsTrigger>
          {/* <TabsTrigger value="assists" className="flex items-center gap-2">
            <Award className="w-4 h-4" /> Most Assists
          </TabsTrigger> */}
          <TabsTrigger value="discipline" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Discipline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scorers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topScorers.map((player, index) => (
              <div key={`${player.name}-${player.team}`} className="relative">
                {index < 3 && (
                  <Badge
                    className={`absolute -top-2 -right-2 z-10 ${
                      index === 0 ? "bg-yellow-500 text-yellow-900" : index === 1 ? "bg-gray-400 text-gray-900" : "bg-amber-600 text-amber-100"
                    }`}
                  >
                    #{index + 1}
                  </Badge>
                )}
                <PlayerStatCard player={player} statType="goals" />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* <TabsContent value="assists" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAssists.map((player, index) => (
              <div key={`${player.name}-${player.team}`} className="relative">
                <Badge className="absolute -top-2 -right-2 z-10 bg-blue-500 text-blue-100">#{index + 1}</Badge>
                <PlayerStatCard player={player} statType="assists" />
              </div>
            ))}
          </div>
        </TabsContent> */}

        <TabsContent value="discipline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplinaryRecords.map((player) => (
              <PlayerStatCard key={`${player.name}-${player.team}`} player={player} statType="cards" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
