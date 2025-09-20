"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Trophy, Star } from "lucide-react"

import { fetchGoogleSheetsData, transformTeamsData, GoogleSheetsTeam } from "@/lib/excel-integration"

interface TeamData extends GoogleSheetsTeam {
  logo: string
  // optional fields for demo
  stats?: {
    matchesPlayed?: number
    wins?: number
    draws?: number
    losses?: number
    goalsFor?: number
    goalsAgainst?: number
    points?: number
  }
  players?: any[]
  recentForm?: ("W" | "D" | "L")[]
  achievements?: string[]
}

export default function TeamProfiles() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const csvData = await fetchGoogleSheetsData("teams")
        const transformed = transformTeamsData(csvData)
        // add logo path
        const teamsWithLogo: TeamData[] = transformed.map((team) => ({
          ...team,
          logo: `/team-logos/${team.teamName.replace(/\s+/g, "-").toLowerCase()}.jpg`,
          stats: {}, // optional placeholder
          players: [],
          recentForm: [],
          achievements: [],
        }))
        setTeams(teamsWithLogo)
      } catch (err) {
        console.error("Failed to fetch teams:", err)
      }
    }

    fetchTeams()
  }, [])

  const handleTeamClick = (team: TeamData) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTeam(null)
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
                <Image
                  src={team.logo}
                  alt={team.teamName}
                  fill
                  className="rounded-full object-cover"
                />
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
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-4">
                <div>Captain: {selectedTeam.captainName}</div>
                <div>Department: {selectedTeam.department}</div>
                <div>Year: {selectedTeam.yearOfStudy}</div>
              </TabsContent>

              <TabsContent value="players" className="p-4">
                <div>No player data available</div>
              </TabsContent>

              <TabsContent value="achievements" className="p-4">
                <div>No achievements recorded</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
