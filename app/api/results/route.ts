import { NextResponse } from "next/server"
import { fetchGoogleSheetsData, transformResultsData, parseGoalScorers, parseCards } from "@/lib/excel-integration"

export async function GET() {
  try {
    const resultsCSV = await fetchGoogleSheetsData("results")
    const resultsData = transformResultsData(resultsCSV)

    // Transform results data to include parsed goal scorers and cards
    const transformedResults = resultsData.map((result) => {
      const scoreParts = result.score && result.score !== "—" ? result.score.split("–").map((s) => s.trim()) : null

      return {
        id: result.match,
        match: result.match,
        time: result.time,
        team1: result.team1,
        team2: result.team2,
        score: scoreParts
          ? {
              team1: Number.parseInt(scoreParts[0]) || 0,
              team2: Number.parseInt(scoreParts[1]) || 0,
            }
          : null,
        goalScorers: {
          team1: parseGoalScorers(result.goalScorersTeam1),
          team2: parseGoalScorers(result.goalScorersTeam2),
        },
        cards: {
          team1: parseCards(result.cardsTeam1),
          team2: parseCards(result.cardsTeam2),
        },
        result: result.result,
        status: result.score && result.score !== "—" ? "completed" : "upcoming",
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedResults,
      lastUpdated: new Date().toISOString(),
      totalResults: transformedResults.length,
    })
  } catch (error) {
    console.error("Error fetching results data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch results data from Google Sheets",
        data: [],
      },
      { status: 500 },
    )
  }
}
