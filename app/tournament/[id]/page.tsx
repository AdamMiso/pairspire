import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { PlayerManagement } from '@/components/tournament/player-management'
import { StandingsTable } from '@/components/tournament/standings-table'
import { RoundPairings } from '@/components/tournament/round-pairings'
import { TournamentControls } from '@/components/tournament/tournament-controls'
import { RevisionHistory } from '@/components/tournament/revision-history'
import { getTournament, getStandings, getRoundByNumber, getMatches, getRevisions } from '@/lib/tournament/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, ClipboardList, ExternalLink, Trophy, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params
  const tournament = await getTournament(id)

  if (!tournament) {
    notFound()
  }

  const standings = await getStandings(id)
  const allMatches = await getMatches(id)
  const revisions = await getRevisions(id)

  // Get current round if active
  let currentRound = null
  if (tournament.currentRound > 0) {
    currentRound = await getRoundByNumber(id, tournament.currentRound)
  }

  const hasActiveRound = currentRound?.status === 'active'
  const players = tournament.players ?? []
  const activePlayers = players.filter((player) => player.isActive)
  const pendingResults = allMatches.filter((match) => match.result === 'pending').length
  const leader = standings[0]

  const statusConfig = {
    setup: { label: 'Nastavenie', className: 'bg-muted text-muted-foreground' },
    active: { label: 'Prebieha', className: 'bg-primary/15 text-primary' },
    complete: { label: 'Ukončený', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' }
  }

  // Build rounds data for tabs
  const roundsData = []
  for (let i = 1; i <= tournament.currentRound; i++) {
    const round = await getRoundByNumber(id, i)
    if (round) {
      roundsData.push(round)
    }
  }
  const completedRounds = roundsData.filter((round) => round.status === 'complete').length

  const nextStep = tournament.status === 'complete'
    ? 'Turnaj je ukončený. Skontrolujte finálne poradie alebo obnovte staršiu revíziu.'
    : hasActiveRound
      ? `Zapíšte ${pendingResults} ${pendingResults === 1 ? 'výsledok' : pendingResults > 1 && pendingResults < 5 ? 'výsledky' : 'výsledkov'} v aktuálnom kole.`
      : activePlayers.length < 2
        ? 'Pridajte aspoň dvoch aktívnych hráčov, aby sa dalo spustiť prvé kolo.'
        : `Turnaj je pripravený na kolo ${tournament.currentRound + 1}.`

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 rounded-lg border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusConfig[tournament.status].className}>
                  {statusConfig[tournament.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Kolo {tournament.currentRound}/{tournament.rounds}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tournament.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{nextStep}</p>
              </div>
            </div>

            <Button asChild variant="outline" className="gap-2 lg:mt-1">
              <Link href={`/tournament/${id}/join`}>
                <ExternalLink className="h-4 w-4" />
                Odkaz pre hráčov
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Aktívni hráči
              </div>
              <p className="mt-2 text-2xl font-semibold">{activePlayers.length}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                Dokončené kolá
              </div>
              <p className="mt-2 text-2xl font-semibold">{completedRounds}/{tournament.rounds}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Líder
              </div>
              <p className="mt-2 truncate text-lg font-semibold">{leader ? leader.name : '-'}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Dátum
              </div>
              <p className="mt-2 text-lg font-semibold">{tournament.date}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            <Tabs defaultValue={tournament.currentRound > 0 ? 'rounds' : 'standings'} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="standings">Poradie</TabsTrigger>
                <TabsTrigger value="rounds">Kolá</TabsTrigger>
                <TabsTrigger value="players">Hráči</TabsTrigger>
              </TabsList>

              <TabsContent value="standings">
                <StandingsTable players={standings} />
              </TabsContent>

              <TabsContent value="rounds" className="space-y-4">
                {roundsData.length === 0 ? (
                  <div className="rounded-lg border bg-card px-6 py-12 text-center">
                    <h2 className="text-lg font-semibold">Žiadne kolo ešte nebeží</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      Skontrolujte súpisku hráčov a v paneli ovládania spustite prvé kolo.
                    </p>
                  </div>
                ) : (
                  roundsData.map((round) => (
                    <RoundPairings
                      key={round.id}
                      roundNumber={round.roundNumber}
                      matches={round.matches ?? []}
                      players={players}
                      isActive={round.status === 'active'}
                    />
                  )).reverse()
                )}
              </TabsContent>

              <TabsContent value="players">
                <PlayerManagement
                  tournamentId={id}
                  players={players}
                  canAddPlayers={!hasActiveRound && tournament.status !== 'complete'}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <TournamentControls
              tournament={tournament}
              players={players}
              hasActiveRound={hasActiveRound}
            />
            <RevisionHistory
              tournamentId={id}
              revisions={revisions}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
