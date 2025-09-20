import { NextResponse } from "next/server"
import { fetchGoogleSheetsData, transformCSVToMatches, transformExcelMatchData } from "@/lib/excel-integration"

export async function GET() {
  try {
    const csvData = await fetchGoogleSheetsData("results")
    const excelData = transformCSVToMatches(csvData)
    const transformedData = transformExcelMatchData(excelData)

    // Find currently live matches
    const liveMatches = transformedData.filter((match) => match.status === "live")
    const currentLiveMatch = liveMatches.length > 0 ? liveMatches[0] : null

    if (currentLiveMatch) {
      // Transform to live match format with additional live data
      const liveMatchData = {
        ...currentLiveMatch,
        minute: calculateCurrentMinute(currentLiveMatch.lastUpdated),
        possession: { team1: 45, team2: 55 }, // This would come from sheets
        shots: { team1: 4, team2: 6 }, // This would come from sheets
        corners: { team1: 3, team2: 2 }, // This would come from sheets
        events:
          currentLiveMatch.goalScorers?.map((goal, index) => ({
            id: `goal-${index}`,
            type: "goal" as const,
            minute: goal.minute,
            player: goal.player,
            team: goal.team,
            description: `${goal.player} scores for ${goal.team}`,
            timestamp: new Date().toISOString(),
          })) || [],
      }

      return NextResponse.json({
        success: true,
        data: liveMatchData,
        lastUpdated: new Date().toISOString(),
        connectionStatus: "connected",
      })
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "No live matches currently",
      lastUpdated: new Date().toISOString(),
      connectionStatus: "connected",
    })
  } catch (error) {
    console.error("Error fetching live match data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch live match data",
        data: null,
        connectionStatus: "disconnected",
      },
      { status: 500 },
    )
  }
}

function calculateCurrentMinute(lastUpdated: string): number {
  // Simple calculation - in real app this would be more sophisticated
  const now = new Date()
  const updated = new Date(lastUpdated)
  const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60))
  return Math.min(diffMinutes, 90)
}
