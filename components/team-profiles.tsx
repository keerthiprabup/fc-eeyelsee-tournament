"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users } from "lucide-react"

import {
  fetchGoogleSheetsData,
  transformTeamsData,
  transformResultsData,
  GoogleSheetsTeam,
  GoogleSheetsResult,
} from "@/lib/excel-integration"

interface PlayerStat {
  name: string
  goals: number
  matches: number
  saves: number
  yellowCards: number
  redCards: number
  matchesSet?: Set<string>
}

interface TeamData extends GoogleSheetsTeam {
  logo: string
}

export default function TeamProfiles() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [teamStats, setTeamStats] = useState<{
    matchesPlayed: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    players: PlayerStat[]
  } | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const csvData = await fetchGoogleSheetsData("teams")
        const transformed = transformTeamsData(csvData)
        const teamsWithLogo: TeamData[] = transformed.map((team) => ({
          ...team,
          logo: `/team-logos/${team.teamName.replace(/\s+/g, "-").toLowerCase()}.jpg`,
        }))
        setTeams(teamsWithLogo)
      } catch (err) {
        console.error("Failed to fetch teams:", err)
      }
    }
    fetchTeams()
  }, [])

  const handleTeamClick = async (team: TeamData) => {
    setSelectedTeam(team)
    setIsModalOpen(true)

    try {
      const resultsCSV = await fetchGoogleSheetsData("results")
      const resultsData: GoogleSheetsResult[] = transformResultsData(resultsCSV)

      let wins = 0,
        draws = 0,
        losses = 0,
        goalsFor = 0,
        goalsAgainst = 0

      const players: Record<string, PlayerStat> = {}
      const matchesSet = new Set<string>() // unique matches for team

      resultsData.forEach((match, index) => {
        const matchId = `match-${index}`
        const isTeam1 = match.team1 === team.teamName
        const isTeam2 = match.team2 === team.teamName
        if (!isTeam1 && !isTeam2) return

        // ✅ Only count completed matches for team
        if (match.status === "Completed") {
          matchesSet.add(matchId)
        }

        // Result
        if (match.result === team.teamName) wins++
        else if (match.result === "Draw") draws++
        else if (match.result && match.result !== "—") losses++

        // Goals
        const processGoals = (scorersStr: string | undefined, teamName: string) => {
          if (teamName !== team.teamName || !scorersStr || scorersStr === "—") return
          const names = scorersStr.split(",").map((n) => n.trim()).filter(Boolean)
          names.forEach((name) => {
            if (!players[name]) {
              players[name] = { name, goals: 0, matches: 0, saves: 0, yellowCards: 0, redCards: 0, matchesSet: new Set() }
            }
            players[name].goals++
            if (match.status === "Completed") {
              players[name].matchesSet?.add(matchId)
            }
          })
          goalsFor += names.length
        }

        processGoals(match.goalScorersTeam1, match.team1)
        processGoals(match.goalScorersTeam2, match.team2)

        // Goals Against
        if (isTeam1 && match.goalScorersTeam2) {
          goalsAgainst += match.goalScorersTeam2.split(",").filter(Boolean).length
        }
        if (isTeam2 && match.goalScorersTeam1) {
          goalsAgainst += match.goalScorersTeam1.split(",").filter(Boolean).length
        }

        // Cards
        const processCards = (cardsStr: string | undefined, teamName: string) => {
          if (teamName !== team.teamName || !cardsStr || cardsStr === "—") return
          cardsStr.split(",").forEach((c) => {
            const name = c.split("(")[0].trim()
            const isYellow = c.includes("Yellow")
            if (!players[name]) {
              players[name] = { name, goals: 0, matches: 0, saves: 0, yellowCards: 0, redCards: 0, matchesSet: new Set() }
            }
            if (isYellow) players[name].yellowCards++
            else players[name].redCards++
            if (match.status === "Completed") {
              players[name].matchesSet?.add(matchId)
            }
          })
        }
        processCards(match.cardsTeam1, match.team1)
        processCards(match.cardsTeam2, match.team2)

        // Saves
        const processSaves = (savesStr: string | undefined, teamName: string) => {
          if (teamName !== team.teamName || !savesStr || savesStr === "—") return
          savesStr.split(",").forEach((entry) => {
            const [nameRaw, savesRaw] = entry.trim().split("*")
            const name = nameRaw?.trim()
            const saves = Number(savesRaw || 0)
            if (!name || saves <= 0) return
            if (!players[name]) {
              players[name] = { name, goals: 0, matches: 0, saves: 0, yellowCards: 0, redCards: 0, matchesSet: new Set() }
            }
            players[name].saves += saves
            if (match.status === "Completed") {
              players[name].matchesSet?.add(matchId)
            }
          })
        }
        processSaves(match.savesTeam1, match.team1)
        processSaves(match.savesTeam2, match.team2)
      })

      // Finalize player stats (convert match sets to counts)
      const playersFinal = Object.values(players).map((p) => ({
        ...p,
        matches: p.matchesSet ? p.matchesSet.size : 0,
      }))

      // ✅ Team matches = only completed appearances
      const matchesPlayed = matchesSet.size

      setTeamStats({
        matchesPlayed,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        players: playersFinal,
      })
    } catch (err) {
      console.error("Failed to fetch results for team stats:", err)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTeam(null)
    setTeamStats(null)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Team Profiles</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card
            key={team.teamName}
            className="cursor-pointer hover:bg-accent/10"
            onClick={() => handleTeamClick(team)}
          >
            <CardHeader className="flex items-center gap-4">
              <div className="w-16 h-16 relative">
                <Image src={team.logo} alt={team.teamName} fill className="rounded-full object-cover" />
              </div>
              <div className="flex-1">
                <CardTitle>{team.teamName}</CardTitle>
                <div className="text-sm text-muted-foreground">Captain: {team.captainName}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Department: {team.department} | Year: {team.yearOfStudy}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTeam && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-11/12 max-w-4xl overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedTeam.teamName}</h2>
              <Button onClick={closeModal}>Close</Button>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-4 space-y-2">
                <div>Captain: {selectedTeam.captainName}</div>
                <div>Department: {selectedTeam.department}</div>
                <div>Year: {selectedTeam.yearOfStudy}</div>
                {teamStats && (
                  <div className="mt-4 space-y-1">
                    <div>Matches: {teamStats.matchesPlayed}</div>
                    <div>Wins: {teamStats.wins} | Draws: {teamStats.draws} | Losses: {teamStats.losses}</div>
                    <div>Goals For: {teamStats.goalsFor} | Goals Against: {teamStats.goalsAgainst}</div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="players" className="p-4">
                {!teamStats ? (
                  <div>Loading player data...</div>
                ) : teamStats.players.length === 0 ? (
                  <div>No player stats available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamStats.players.map((p) => (
                      <Card key={p.name}>
                        <CardContent className="p-3">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{p.name}</h3>
                            <Badge variant="outline">{p.matches} matches</Badge>
                          </div>
                          <div className="text-sm mt-2">
                            Goals: {p.goals} | Saves: {p.saves} | Yellow: {p.yellowCards} | Red: {p.redCards}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
