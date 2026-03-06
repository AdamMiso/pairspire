import { Header } from '@/components/header'
import { TournamentCard } from '@/components/tournament-card'
import { EmptyTournaments } from '@/components/empty-tournaments'
import { listTournaments } from '@/lib/tournament/actions'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const tournaments = await listTournaments()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tournaments</h1>
          <p className="text-muted-foreground">
            Manage your chess tournaments with Swiss-system pairings
          </p>
        </div>

        {tournaments.length === 0 ? (
          <EmptyTournaments />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
