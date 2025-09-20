import MatchSchedule from "@/components/match-schedule"
import Navigation from "@/components/navigation"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <MatchSchedule />
      </main>
    </div>
  )
}
