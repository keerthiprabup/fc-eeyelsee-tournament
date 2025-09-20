import TournamentBracket from "@/components/tournament-bracket"
import Navigation from "@/components/navigation"
import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold text-balance">FC EEYELSEE</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              7's Football Tournament – September 19-21, 2025 | Live Scores & Stats
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                16 Teams
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Tournament Active
              </Badge>
              {/* <Badge variant="secondary" className="px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />4 Matches Completed
              </Badge> */}
            </div>
          </div>
        </div>
      </div>

        {/* Tournament Bracket */}
        <section className="py-12 overflow-x-auto">
          <div className="flex justify-center min-w-full">
            <div className="inline-flex min-w-max">
              <TournamentBracket />
            </div>
          </div>
        </section>


      {/* Upcoming Matches */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-balance">Matches</h2>
            <Button asChild variant="outline">
              <Link href="/schedule" className="flex items-center gap-2">
                View All Matches
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {upcomingMatches.map((match, index) => (
              <Card key={index} className="bg-card border-border hover:bg-accent/10 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-balance">{match.teams}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{match.time}</span>
                  </div>
                  <Badge variant="outline" className="mt-3">
                    {match.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div> */}
        </div>
      </section>

      {/* Quick Stats
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-balance">Tournament Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">4</div>
                <p className="text-muted-foreground">Matches Completed</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">12</div>
                <p className="text-muted-foreground">Matches Remaining</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">16</div>
                <p className="text-muted-foreground">Teams Competing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
    </div>
  )
}
