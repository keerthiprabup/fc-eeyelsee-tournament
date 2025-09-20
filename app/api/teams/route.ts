import { NextResponse } from "next/server"
import { fetchGoogleSheetsData, transformTeamsData } from "@/lib/excel-integration"

export async function GET() {
  try {
    // Fetch teams data from Google Sheets
    const teamsCSV = await fetchGoogleSheetsData("teams")
    const teamsData = transformTeamsData(teamsCSV)

    return NextResponse.json({
      success: true,
      data: teamsData,
      lastUpdated: new Date().toISOString(),
      totalTeams: teamsData.length,
    })
  } catch (error) {
    console.error("Error fetching teams data:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch teams data from Google Sheets",
        data: [],
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
