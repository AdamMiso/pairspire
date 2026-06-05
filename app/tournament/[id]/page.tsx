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
import { getLanguage } from '@/lib/i18n-server'
import { translations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const language = await getLanguage()
  const t = translations[language]
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
    setup: { label: t.common.setup, className: 'bg-muted text-muted-foreground' },
    active: { label: t.common.active, className: 'bg-primary/15 text-primary' },
    complete: { label: t.common.complete, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' }
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
    ? t.tournament.nextStepComplete
    : hasActiveRound
      ? t.tournament.nextStepPending(pendingResults)
      : activePlayers.length < 2
        ? t.tournament.nextStepNeedsPlayers
        : t.tournament.nextStepReady(tournament.currentRound + 1)

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
                  {t.common.round} {tournament.currentRound}/{tournament.rounds}
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
                {t.tournament.playerLink}
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {t.tournament.activePlayers}
              </div>
              <p className="mt-2 text-2xl font-semibold">{activePlayers.length}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                {t.tournament.completedRounds}
              </div>
              <p className="mt-2 text-2xl font-semibold">{completedRounds}/{tournament.rounds}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                {t.tournament.leader}
              </div>
              <p className="mt-2 truncate text-lg font-semibold">{leader ? leader.name : '-'}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {t.common.date}
              </div>
              <p className="mt-2 text-lg font-semibold">{tournament.date}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            <Tabs defaultValue={tournament.currentRound > 0 ? 'rounds' : 'standings'} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="standings">{t.common.standings}</TabsTrigger>
                <TabsTrigger value="rounds">{t.common.rounds}</TabsTrigger>
                <TabsTrigger value="players">{t.common.players}</TabsTrigger>
              </TabsList>

              <TabsContent value="standings">
                <StandingsTable players={standings} language={language} />
              </TabsContent>

              <TabsContent value="rounds" className="space-y-4">
                {roundsData.length === 0 ? (
                  <div className="rounded-lg border bg-card px-6 py-12 text-center">
                    <h2 className="text-lg font-semibold">{t.tournament.noRoundTitle}</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      {t.tournament.noRoundDescription}
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
                      language={language}
                    />
                  )).reverse()
                )}
              </TabsContent>

              <TabsContent value="players">
                <PlayerManagement
                  tournamentId={id}
                  players={players}
                  canAddPlayers={!hasActiveRound && tournament.status !== 'complete'}
                  language={language}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <TournamentControls
              tournament={tournament}
              players={players}
              hasActiveRound={hasActiveRound}
              language={language}
            />
            <RevisionHistory
              tournamentId={id}
              revisions={revisions}
              language={language}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
