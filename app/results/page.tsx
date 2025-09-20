import Navigation from "@/components/navigation"
import TournamentStandings from "@/components/tournament-standings"
import PlayerStatistics from "@/components/player-statistics"
import MatchResultsDetailed from "@/components/match-results-detailed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-balance">Player Statistics</h1>
            <p className="text-xl text-muted-foreground text-balance">
              Tournament player stats
            </p>
          </div>
{/* 
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8"> */}
              {/* <TabsTrigger value="standings">Standings</TabsTrigger> */}
              {/* <TabsTrigger value="matches">Match Details</TabsTrigger>
              <TabsTrigger value="players">Player Stats</TabsTrigger>
              
            </TabsList> */}

            {/* <TabsContent value="standings" className="space-y-8">
              <TournamentStandings />
            </TabsContent> */}

            {/* <TabsContent value="matches" className="space-y-8">
              <MatchResultsDetailed />
            </TabsContent>

            <TabsContent value="players" className="space-y-8"> */}
              <PlayerStatistics />
            {/* </TabsContent>

            
          </Tabs> */}
        </div>
      </main>
    </div>
  )
}
