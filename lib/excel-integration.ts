// Excel/Google Sheets integration utilities

export interface GoogleSheetsTeam {
  teamName: string
  captainName: string
  department: string
  yearOfStudy: string
}

export interface GoogleSheetsResult {
  match: string
  time: string
  team1: string
  score: string
  team2: string
  goalScorersTeam1: string
  goalScorersTeam2: string
  cardsTeam1: string
  cardsTeam2: string
  result: string
  penaltiesTeam1?: string
  penaltiesTeam2?: string
}

export interface GoogleSheetsSchedule {
  match: string
  date: string
  time: string
  team1: string
  vs: string
  team2: string
}

export interface TransformedMatch {
  id: string
  team1: string
  team2: string
  date: string
  time: string
  status: "upcoming" | "live" | "completed" | "postponed"
  score?: { team1: number; team2: number }
  goalScorers?: { team1: string[]; team2: string[] }
  cards?: { team1: string[]; team2: string[] }
  result?: string
  penalties?: { team1: number; team2: number }
}

export interface ExcelMatchData {
  matchId: string
  team1: string
  team2: string
  date: string
  time: string
  venue: string
  round: string
  status: "upcoming" | "live" | "completed" | "postponed"
  team1Score?: number
  team2Score?: number
  goalScorers?: string // JSON string of goal scorer data
  penalties?: string // JSON string of penalty data
  lastUpdated: string
}

export interface ExcelTeamData {
  teamName: string
  logo?: string
  players: string // JSON string of player data
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface GoalScorer {
  player: string
  team: string
  minute: number
}

export interface PenaltyData {
  team: string
  scored: number
}

export const GOOGLE_SHEETS_CONFIG = {
  SHEET_ID: "1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY",
  BASE_URL: "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/",
  TEAMS_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/export?format=csv&sheet=Teams&gid=0",
  RESULTS_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/export?format=csv&gid=1476600777",
  SCHEDULE_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/export?format=csv&gid=1206998445",
}

// ---------------- CSV Parsing ----------------
export function parseCSVData(csvText: string): string[][] {
  const lines = csvText.split("\n")
  const result: string[][] = []

  for (const line of lines) {
    if (line.trim()) {
      const row = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          row.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      row.push(current.trim())
      result.push(row)
    }
  }

  return result
}

// ---------------- Fetch Data ----------------
export async function fetchGoogleSheetsData(sheetType: "teams" | "results" | "schedule") {
  const urlMap = {
    teams: GOOGLE_SHEETS_CONFIG.TEAMS_CSV_URL,
    results: GOOGLE_SHEETS_CONFIG.RESULTS_CSV_URL,
    schedule: GOOGLE_SHEETS_CONFIG.SCHEDULE_CSV_URL,
  }

  const response = await fetch(urlMap[sheetType], { cache: "no-store" })
  if (!response.ok) throw new Error(`Failed to fetch ${sheetType}`)
  const csvText = await response.text()
  return parseCSVData(csvText)
}

// ---------------- Transform Functions ----------------
export function transformTeamsData(csvData: string[][]): GoogleSheetsTeam[] {
  if (csvData.length < 2) return []
  return csvData.slice(1)
    .filter((row) => row[0].trim())
    .map((row) => ({
      teamName: row[0],
      captainName: row[1],
      department: row[2],
      yearOfStudy: row[3],
    }))
}

export function transformResultsData(csvData: string[][]): GoogleSheetsResult[] {
  if (csvData.length < 2) return []
  return csvData.slice(1)
    .filter((row) => row[0].trim())
    .map((row) => ({
      match: row[0],
      time: row[1],
      team1: row[2],
      score: row[3],
      team2: row[4],
      goalScorersTeam1: row[5],
      goalScorersTeam2: row[6],
      cardsTeam1: row[7],
      cardsTeam2: row[8],
      result: row[9],
      penaltiesTeam1: row[10] || "0",
      penaltiesTeam2: row[11] || "0",
    }))
}

export function transformScheduleData(csvData: string[][]): GoogleSheetsSchedule[] {
  if (csvData.length < 2) return []
  return csvData.slice(1)
    .filter((row) => row[0].trim())
    .map((row) => ({
      match: row[0],
      date: row[1],
      time: row[2],
      team1: row[3],
      vs: row[4],
      team2: row[5],
    }))
}

// ---------------- Combine Schedule + Results ----------------
export function combineScheduleAndResults(
  scheduleData: GoogleSheetsSchedule[],
  resultsData: GoogleSheetsResult[],
): TransformedMatch[] {
  return scheduleData.map((sched) => {
    const result = resultsData.find((r) => r.match === sched.match)

    let score: { team1: number; team2: number } | undefined
    let status: "upcoming" | "completed" = "upcoming"
    let goalScorers: { team1: string[]; team2: string[] } | undefined
    let cards: { team1: string[]; team2: string[] } | undefined
    let penalties: { team1: number; team2: number } | undefined
    let resultText: string | undefined

    if (result && result.score && result.score !== "—") {
      status = "completed"
      const parts = result.score.split("–").map((s) => s.trim())
      score = { team1: Number(parts[0]) || 0, team2: Number(parts[1]) || 0 }
      goalScorers = {
        team1: result.goalScorersTeam1 ? result.goalScorersTeam1.split(",").map((s) => s.trim()) : [],
        team2: result.goalScorersTeam2 ? result.goalScorersTeam2.split(",").map((s) => s.trim()) : [],
      }
      cards = {
        team1: result.cardsTeam1 ? result.cardsTeam1.split(",").map((s) => s.trim()) : [],
        team2: result.cardsTeam2 ? result.cardsTeam2.split(",").map((s) => s.trim()) : [],
      }
      penalties = {
        team1: Number(result.penaltiesTeam1) || 0,
        team2: Number(result.penaltiesTeam2) || 0,
      }
      resultText = result.result
    }

    return {
      id: sched.match,
      team1: sched.team1,
      team2: sched.team2,
      date: sched.date,
      time: sched.time,
      status,
      score,
      goalScorers,
      cards,
      penalties,
      result: resultText,
    }
  })
}

// ---------------- Excel Conversion ----------------
export function transformCSVToMatches(csvData: string[][]): ExcelMatchData[] {
  if (csvData.length < 2) return []

  const headers = csvData[0]
  const rows = csvData.slice(1)

  return rows.map((row, index) => {
    const matchData: any = {}
    headers.forEach((header, i) => {
      matchData[header.toLowerCase().replace(/\s+/g, "")] = row[i] || ""
    })

    return {
      matchId: matchData.matchid || `m${index + 1}`,
      team1: matchData.team1 || "",
      team2: matchData.team2 || "",
      date: matchData.date || "",
      time: matchData.time || "",
      venue: matchData.venue || "Main Field",
      round: matchData.round || "Round 1",
      status: (matchData.status as any) || "upcoming",
      team1Score: matchData.team1score ? Number.parseInt(matchData.team1score) : undefined,
      team2Score: matchData.team2score ? Number.parseInt(matchData.team2score) : undefined,
      goalScorers: matchData.goalscorers || "[]",
      penalties: matchData.penalties || "[]",
      lastUpdated: new Date().toISOString(),
    }
  })
}
