import Link from 'next/link'
import { Header } from '@/components/header'
import { TournamentCard } from '@/components/tournament-card'
import { EmptyTournaments } from '@/components/empty-tournaments'
import { listTournaments } from '@/lib/tournament/actions'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let tournaments: Awaited<ReturnType<typeof listTournaments>> = []
  try {
    tournaments = await listTournaments()
    console.log("[v0] Tournaments loaded:", tournaments.length)
  } catch (error) {
    console.error("[v0] Error loading tournaments:", error)
  }

  const activeCount = tournaments.filter((tournament) => tournament.status === 'active').length
  const totalPlayers = tournaments.reduce((sum, tournament) => sum + (tournament.playerCount ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-8 rounded-lg border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Turnaje</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Jednoduchá správa švajčiarskych šachových turnajov: súpiska, párovania, výsledky a poradie na jednom mieste.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/tournament/new">
                <Plus className="h-4 w-4" />
                Nový turnaj
              </Link>
            </Button>
          </div>

          {tournaments.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  Turnaje
                </div>
                <p className="mt-2 text-2xl font-semibold">{tournaments.length}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  Prebiehajú
                </div>
                <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Hráči spolu
                </div>
                <p className="mt-2 text-2xl font-semibold">{totalPlayers}</p>
              </div>
            </div>
          )}
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
