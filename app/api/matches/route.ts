import { NextResponse } from "next/server"
import {
  fetchGoogleSheetsData,
  transformScheduleData,
  transformResultsData,
  combineScheduleAndResults,
} from "@/lib/excel-integration"

export async function GET() {
  try {
    // Fetch both schedule and results data from Google Sheets
    const [scheduleCSV, resultsCSV] = await Promise.all([
      fetchGoogleSheetsData("schedule"),
      fetchGoogleSheetsData("results"),
    ])

    const scheduleData = transformScheduleData(scheduleCSV)
    const resultsData = transformResultsData(resultsCSV)
    const combinedMatches = combineScheduleAndResults(scheduleData, resultsData)

    return NextResponse.json({
      success: true,
      data: combinedMatches,
      lastUpdated: new Date().toISOString(),
      totalMatches: combinedMatches.length,
      completedMatches: combinedMatches.filter((m) => m.status === "completed").length,
      upcomingMatches: combinedMatches.filter((m) => m.status === "upcoming").length,
    })
  } catch (error) {
    console.error("Error fetching match data:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch match data from Google Sheets",
        data: [],
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
