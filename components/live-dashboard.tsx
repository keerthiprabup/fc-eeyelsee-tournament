"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLiveMatches, useLiveTeams } from "@/hooks/use-live-data"
import LiveDataIndicator from "@/components/live-data-indicator"
import { Activity, Users, Trophy, Target, Clock, TrendingUp } from "lucide-react"

interface LiveStats {
  totalMatches: number
  liveMatches: number
  completedToday: number
  totalGoals: number
  topScorer: { name: string; goals: number; team: string }
  leadingTeam: { name: string; points: number }
}

export default function LiveDashboard() {
  const { matches, isLoading: matchesLoading, lastUpdated: matchesUpdated, refresh: refreshMatches } = useLiveMatches()
  const { teams, isLoading: teamsLoading, lastUpdated: teamsUpdated, refresh: refreshTeams } = useLiveTeams()

  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalMatches: 8,
    liveMatches: 1,
    completedToday: 4,
    totalGoals: 12,
    topScorer: { name: "Josh Martinez", goals: 1, team: "MOODESH FC" },
    leadingTeam: { name: "SYNERGY FC", points: 3 },
  })

  const refreshAll = () => {
    refreshMatches()
    refreshTeams()
  }

  const recentActivity = [
    {
      id: "1",
      type: "goal",
      message: "Omar Ali scores for FC EEYELSEE B",
      time: "2 minutes ago",
      match: "CHICKEN FC vs FC EEYELSEE B",
    },
    {
      id: "2",
      type: "match_start",
      message: "CHICKEN FC vs FC EEYELSEE B kicks off",
      time: "38 minutes ago",
      match: "CHICKEN FC vs FC EEYELSEE B",
    },
    {
      id: "3",
      type: "goal",
      message: "Josh Martinez scores for MOODESH FC",
      time: "2 hours ago",
      match: "MOODESH FC vs MANAL MAFIA",
    },
    {
      id: "4",
      type: "match_end",
      message: "MOODESH FC defeats MANAL MAFIA 4-1",
      time: "2 hours ago",
      match: "MOODESH FC vs MANAL MAFIA",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "goal":
        return <Target className="w-4 h-4 text-green-500" />
      case "match_start":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "match_end":
        return <Trophy className="w-4 h-4 text-primary" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Activity className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-balance">Live Tournament Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-balance">
          Real-time tournament overview with live statistics and updates
        </p>
      </div>

      {/* Live Data Indicator */}
      <div className="mb-8">
        <LiveDataIndicator
          lastUpdated={matchesUpdated || teamsUpdated}
          onRefresh={refreshAll}
          isLoading={matchesLoading || teamsLoading}
        />
      </div>

      {/* Live Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Matches</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-red-500">{liveStats.liveMatches}</p>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-primary">{liveStats.completedToday}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold text-green-500">{liveStats.totalGoals}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leading Team</p>
                <p className="text-lg font-bold text-primary">{liveStats.leadingTeam.name}</p>
                <p className="text-sm text-muted-foreground">{liveStats.leadingTeam.points} points</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.match}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Top Scorer</p>
                    <p className="text-sm text-muted-foreground">{liveStats.topScorer.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{liveStats.topScorer.goals}</p>
                  <Badge variant="outline" className="text-xs">
                    {liveStats.topScorer.team}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Best Defense</p>
                    <p className="text-sm text-muted-foreground">MALABAARRRR</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-500">0</p>
                  <p className="text-xs text-muted-foreground">Goals Conceded</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Most Active</p>
                    <p className="text-sm text-muted-foreground">MOODESH FC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">4</p>
                  <p className="text-xs text-muted-foreground">Goals Scored</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button variant="outline" onClick={() => (window.location.href = "/schedule")}>
          View Full Schedule
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/results")}>
          See All Results
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/teams")}>
          Team Profiles
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/gallery")}>
          Photo Gallery
        </Button>
      </div>
    </div>
  )
}
