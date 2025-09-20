import Navigation from "@/components/navigation"
import TeamProfiles from "@/components/team-profiles"

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        <TeamProfiles />
      </main>
    </div>
  )
}
