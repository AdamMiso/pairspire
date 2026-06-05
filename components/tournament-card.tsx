import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Tournament } from '@/lib/tournament/types'
import { formatPlayerCount, formatRoundCount, translations, type Language } from '@/lib/i18n'
import { ArrowRight, CalendarDays, Clock, Trophy, Users } from 'lucide-react'

interface TournamentCardProps {
  tournament: Tournament
  language: Language
}

export function TournamentCard({ tournament, language }: TournamentCardProps) {
  const t = translations[language]
  const statusColors = {
    setup: 'bg-muted text-muted-foreground',
    active: 'bg-primary/15 text-primary',
    complete: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
  }

  const statusLabels = {
    setup: t.common.setup,
    active: t.common.active,
    complete: t.common.complete
  }

  const playerCount = tournament.playerCount ?? tournament.players?.length ?? 0
  const progress = tournament.rounds === 0 ? 0 : Math.round((tournament.currentRound / tournament.rounds) * 100)

  return (
    <Link href={`/tournament/${tournament.id}`} className="block h-full">
      <Card className="group h-full cursor-pointer transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {tournament.name}
            </CardTitle>
            <Badge className={statusColors[tournament.status]} variant="secondary">
              {statusLabels[tournament.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{tournament.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{formatPlayerCount(playerCount, language)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{formatRoundCount(tournament.rounds, language)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{t.common.round} {tournament.currentRound}/{tournament.rounds}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.home.tournamentProgress}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm font-medium text-primary">
            <span>{t.home.openTournament}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
