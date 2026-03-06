import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { PlayerManagement } from '@/components/tournament/player-management'
import { StandingsTable } from '@/components/tournament/standings-table'
import { RoundPairings } from '@/components/tournament/round-pairings'
import { TournamentControls } from '@/components/tournament/tournament-controls'
import { RevisionHistory } from '@/components/tournament/revision-history'
import { getTournament, getStandings, getRoundByNumber, getMatches, getRevisions } from '@/lib/tournament/actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  // Build rounds data for tabs
  const roundsData = []
  for (let i = 1; i <= tournament.currentRound; i++) {
    const round = await getRoundByNumber(id, i)
    if (round) {
      roundsData.push(round)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
          <p className="text-muted-foreground">
            {tournament.date} | {tournament.rounds} rounds
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            <Tabs defaultValue={tournament.currentRound > 0 ? 'rounds' : 'standings'}>
              <TabsList>
                <TabsTrigger value="standings">Standings</TabsTrigger>
                <TabsTrigger value="rounds">Rounds</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
              </TabsList>

              <TabsContent value="standings" className="mt-4">
                <StandingsTable players={standings} />
              </TabsContent>

              <TabsContent value="rounds" className="mt-4 space-y-4">
                {roundsData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No rounds have started yet. Add players and start the first round.
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

              <TabsContent value="players" className="mt-4">
                <PlayerManagement
                  tournamentId={id}
                  players={players}
                  isSetup={tournament.status === 'setup'}
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
