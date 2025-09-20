"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TeamStanding {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: ("W" | "D" | "L")[]
  logo?: string
}

const standingsData: TeamStanding[] = [
  {
    position: 1,
    team: "SYNERGY FC",
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 3,
    goalsAgainst: 1,
    goalDifference: 2,
    points: 3,
    form: ["W"],
  },
  {
    position: 2,
    team: "MOODESH FC",
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 4,
    goalsAgainst: 1,
    goalDifference: 3,
    points: 3,
    form: ["W"],
  },
  {
    position: 3,
    team: "SFC",
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 1,
    goalDifference: 1,
    points: 3,
    form: ["W"],
  },
  {
    position: 4,
    team: "MALABAARRRR",
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 3,
    form: ["W"],
  },
  {
    position: 5,
    team: "FALCONS FC",
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 1,
    goalsAgainst: 3,
    goalDifference: -2,
    points: 0,
    form: ["L"],
  },
  {
    position: 6,
    team: "PHANTOM FC",
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 1,
    goalsAgainst: 2,
    goalDifference: -1,
    points: 0,
    form: ["L"],
  },
]

const FormBadge = ({ result }: { result: "W" | "D" | "L" }) => {
  const colors = {
    W: "bg-green-500/20 text-green-400 border-green-500/30",
    D: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    L: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return <Badge className={`w-6 h-6 p-0 flex items-center justify-center text-xs ${colors[result]}`}>{result}</Badge>
}

const PositionIndicator = ({ position, previousPosition }: { position: number; previousPosition?: number }) => {
  if (!previousPosition || position === previousPosition) {
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  if (position < previousPosition) {
    return <TrendingUp className="w-4 h-4 text-green-500" />
  }

  return <TrendingDown className="w-4 h-4 text-red-500" />
}

export default function TournamentStandings() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Tournament Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold">#</th>
                <th className="text-left p-3 font-semibold">Team</th>
                <th className="text-center p-3 font-semibold">P</th>
                <th className="text-center p-3 font-semibold">W</th>
                <th className="text-center p-3 font-semibold">D</th>
                <th className="text-center p-3 font-semibold">L</th>
                <th className="text-center p-3 font-semibold">GF</th>
                <th className="text-center p-3 font-semibold">GA</th>
                <th className="text-center p-3 font-semibold">GD</th>
                <th className="text-center p-3 font-semibold">Pts</th>
                <th className="text-center p-3 font-semibold">Form</th>
              </tr>
            </thead>
            <tbody>
              {standingsData.map((team, index) => (
                <tr
                  key={team.team}
                  className={`border-b border-border hover:bg-accent/10 transition-colors ${
                    index < 4 ? "bg-green-500/5" : ""
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{team.position}</span>
                      <PositionIndicator position={team.position} />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{team.team.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{team.team}</span>
                    </div>
                  </td>
                  <td className="text-center p-3">{team.played}</td>
                  <td className="text-center p-3">{team.won}</td>
                  <td className="text-center p-3">{team.drawn}</td>
                  <td className="text-center p-3">{team.lost}</td>
                  <td className="text-center p-3">{team.goalsFor}</td>
                  <td className="text-center p-3">{team.goalsAgainst}</td>
                  <td className="text-center p-3">
                    <span
                      className={
                        team.goalDifference > 0
                          ? "text-green-500"
                          : team.goalDifference < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }
                    >
                      {team.goalDifference > 0 ? "+" : ""}
                      {team.goalDifference}
                    </span>
                  </td>
                  <td className="text-center p-3">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {team.points}
                    </Badge>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-1">
                      {team.form.map((result, idx) => (
                        <FormBadge key={idx} result={result} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
            <span>Qualification Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">P: Played</span>
            <span className="text-xs">W: Won</span>
            <span className="text-xs">D: Drawn</span>
            <span className="text-xs">L: Lost</span>
            <span className="text-xs">GF: Goals For</span>
            <span className="text-xs">GA: Goals Against</span>
            <span className="text-xs">GD: Goal Difference</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
