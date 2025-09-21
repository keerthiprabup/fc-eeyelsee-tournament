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
  savesTeam1?: string
  savesTeam2?: string
  status?: string
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
  saves?: { team1: number; team2: number }
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
  savesTeam1?: number
  savesTeam2?: number
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
  BASE_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/",
  TEAMS_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/export?format=csv&sheet=Teams&gid=0",
  RESULTS_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/export?format=csv&sheet=Results&gid=1476600777",
  SCHEDULE_CSV_URL:
    "https://docs.google.com/spreadsheets/d/1ZNg1Y2dpb8Z1Tm4N31o-hN1oojQs1UZ89FgSohxktKY/export?format=csv&sheet=Schedule&gid=1206998445",
}

// ---------------- CSV Parsing ----------------
export function parseCSVData(csvText: string): string[][] {
  // simple CSV parser that handles quoted fields and commas inside quotes
  const lines = csvText.split(/\r?\n/)
  const result: string[][] = []

  for (const line of lines) {
    if (line.trim() === "") continue
    const row: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        // peek next char to support escaped quotes ("")
        const next = line[i + 1]
        if (next === '"') {
          // escaped quote, consume both
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
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

  return result
}

// ---------------- Fetch Data ----------------
export async function fetchGoogleSheetsData(
  sheetType: "teams" | "results" | "schedule"
) {
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
  return csvData
    .slice(1)
    .filter((row) => (row[0] || "").toString().trim() !== "")
    .map((row) => ({
      teamName: row[0] || "",
      captainName: row[1] || "",
      department: row[2] || "",
      yearOfStudy: row[3] || "",
    }))
}

export function transformResultsData(csvData: string[][]): GoogleSheetsResult[] {
  if (csvData.length < 2) return []

  // Normalize headers to simple keys
  const rawHeaders = csvData[0].map((h) => (h || "").toString())
  const headers = rawHeaders.map((h) =>
    h
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[()]/g, "")
  )
  const rows = csvData.slice(1)

  const find = (...possible: string[]) => {
    for (const p of possible) {
      const idx = headers.findIndex((h) => h === p)
      if (idx >= 0) return idx
    }
    return -1
  }

  const idx = {
    match: find("match", "matchid", "fixture", "game"),
    time: find("time", "kickoff", "starttime"),
    team1: find("team1", "home", "teama"),
    score: find("score", "resultscore", "scoreline"),
    team2: find("team2", "away", "teamb"),
    goalScorersTeam1: find(
      "goalscorersteam1",
      "goalscorers1",
      "scorers1",
      "goalsscored1",
      "goals(team1)",
      "goals1"
    ),
    goalScorersTeam2: find(
      "goalscorersteam2",
      "goalscorers2",
      "scorers2",
      "goalsscored2",
      "goals(team2)",
      "goals2"
    ),
    cardsTeam1: find("cardsteam1", "cards1", "cards(team1)"),
    cardsTeam2: find("cardsteam2", "cards2", "cards(team2)"),
    result: find("result", "outcome", "final", "winner"),
    penaltiesTeam1: find("penaltiesteam1", "penalties1", "pens1", "penalties(team1)"),
    penaltiesTeam2: find("penaltiesteam2", "penalties2", "pens2", "penalties(team2)"),
    savesTeam1: find("savesteam1", "saves1", "saves(team1)"),
    savesTeam2: find("savesteam2", "saves2", "saves(team2)"),
    status: find("status", "matchstatus", "state"),
  }

  return rows
    .filter((row) => (row[0] || "").toString().trim() !== "")
    .map((row) => {
      return {
        match: (row[idx.match] || row[0] || "").toString().trim(),
        time: (idx.time >= 0 && row[idx.time]) ? row[idx.time].toString().trim() : "",
        team1: (idx.team1 >= 0 && row[idx.team1]) ? row[idx.team1].toString().trim() : "",
        score: (idx.score >= 0 && row[idx.score]) ? row[idx.score].toString().trim() : "",
        team2: (idx.team2 >= 0 && row[idx.team2]) ? row[idx.team2].toString().trim() : "",
        goalScorersTeam1:
          (idx.goalScorersTeam1 >= 0 && row[idx.goalScorersTeam1]) ? row[idx.goalScorersTeam1].toString().trim() : "",
        goalScorersTeam2:
          (idx.goalScorersTeam2 >= 0 && row[idx.goalScorersTeam2]) ? row[idx.goalScorersTeam2].toString().trim() : "",
        cardsTeam1: (idx.cardsTeam1 >= 0 && row[idx.cardsTeam1]) ? row[idx.cardsTeam1].toString().trim() : "",
        cardsTeam2: (idx.cardsTeam2 >= 0 && row[idx.cardsTeam2]) ? row[idx.cardsTeam2].toString().trim() : "",
        result: (idx.result >= 0 && row[idx.result]) ? row[idx.result].toString().trim() : "",
        penaltiesTeam1: (idx.penaltiesTeam1 >= 0 && row[idx.penaltiesTeam1]) ? row[idx.penaltiesTeam1].toString().trim() : "0",
        penaltiesTeam2: (idx.penaltiesTeam2 >= 0 && row[idx.penaltiesTeam2]) ? row[idx.penaltiesTeam2].toString().trim() : "0",
        savesTeam1: (idx.savesTeam1 >= 0 && row[idx.savesTeam1]) ? row[idx.savesTeam1].toString().trim() : "0",
        savesTeam2: (idx.savesTeam2 >= 0 && row[idx.savesTeam2]) ? row[idx.savesTeam2].toString().trim() : "0",
        status: (idx.status >= 0 && row[idx.status]) ? row[idx.status].toString().trim() : "",
      } as GoogleSheetsResult
    })
}

export function transformScheduleData(csvData: string[][]): GoogleSheetsSchedule[] {
  if (csvData.length < 2) return []
  return csvData
    .slice(1)
    .filter((row) => (row[0] || "").toString().trim() !== "")
    .map((row) => ({
      match: row[0] || "",
      date: row[1] || "",
      time: row[2] || "",
      team1: row[3] || "",
      vs: row[4] || "",
      team2: row[5] || "",
    }))
}

// ---------------- Combine Schedule + Results ----------------
export function combineScheduleAndResults(
  scheduleData: GoogleSheetsSchedule[],
  resultsData: GoogleSheetsResult[]
): TransformedMatch[] {
  return scheduleData.map((sched) => {
    const result = resultsData.find((r) => r.match === sched.match)

    let score: { team1: number; team2: number } | undefined
    let status: "upcoming" | "live" | "completed" | "postponed" = "upcoming"
    let goalScorers: { team1: string[]; team2: string[] } | undefined
    let cards: { team1: string[]; team2: string[] } | undefined
    let penalties: { team1: number; team2: number } | undefined
    let saves: { team1: number; team2: number } | undefined
    let resultText: string | undefined

    if (result) {
      // prefer explicit status from sheet if provided (normalize happens elsewhere)
      if (result.status && result.status.toString().trim() !== "") {
        const raw = result.status.toString().trim().toLowerCase()
        if (raw === "live" || raw === "inprogress" || raw === "in progress") status = "live"
        else if (raw === "postponed") status = "postponed"
        else if (raw === "completed" || raw === "finished" || raw === "done") status = "completed"
        else status = "upcoming"
      }

      // parse score if present
      if (result.score && result.score !== "—" && result.score.trim() !== "") {
        const parts = result.score.split(/[-–:]/).map((s) => s.trim())
        if (parts.length >= 2) {
          const a = Number(parts[0]) || 0
          const b = Number(parts[1]) || 0
          score = { team1: a, team2: b }
          // If a score exists but sheet didn't explicitly say status, assume completed
          if ((!result.status || result.status.toString().trim() === "") && !isNaN(a) && !isNaN(b)) {
            status = "completed"
          }
        }
      }

      // goal scorers
      goalScorers = {
        team1: result.goalScorersTeam1
          ? result.goalScorersTeam1.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        team2: result.goalScorersTeam2
          ? result.goalScorersTeam2.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      }

      // cards
      cards = {
        team1: result.cardsTeam1
          ? result.cardsTeam1.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        team2: result.cardsTeam2
          ? result.cardsTeam2.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      }

      // penalties
      const p1 = Number(result.penaltiesTeam1 ?? "")
      const p2 = Number(result.penaltiesTeam2 ?? "")
      penalties = { team1: Number.isNaN(p1) ? 0 : p1, team2: Number.isNaN(p2) ? 0 : p2 }

      // saves
      const s1 = Number(result.savesTeam1 ?? "")
      const s2 = Number(result.savesTeam2 ?? "")
      saves = { team1: Number.isNaN(s1) ? 0 : s1, team2: Number.isNaN(s2) ? 0 : s2 }

      resultText = result.result || undefined
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
      saves,
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
      const key = (header || "").toLowerCase().replace(/\s+/g, "").replace(/[()]/g, "")
      matchData[key] = row[i] || ""
    })

    const parseOptionalNumber = (v: any) => {
      if (v === undefined || v === null || v === "") return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    }

    return {
      matchId: matchData.matchid || `m${index + 1}`,
      team1: matchData.team1 || "",
      team2: matchData.team2 || "",
      date: matchData.date || "",
      time: matchData.time || "",
      venue: matchData.venue || "Main Field",
      round: matchData.round || "Round 1",
      status: (matchData.status as any) || "upcoming",
      team1Score: parseOptionalNumber(matchData.team1score),
      team2Score: parseOptionalNumber(matchData.team2score),
      goalScorers: matchData.goalscorers || "[]",
      penalties: matchData.penalties || "[]",
      savesTeam1: parseOptionalNumber(matchData.savesteam1 || matchData.saves1),
      savesTeam2: parseOptionalNumber(matchData.savesteam2 || matchData.saves2),
      lastUpdated: new Date().toISOString(),
    } as ExcelMatchData
  })
}
