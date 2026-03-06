import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Tournament } from '@/lib/tournament/types'
import { CalendarDays, Users, Trophy, Clock } from 'lucide-react'

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColors = {
    setup: 'bg-muted text-muted-foreground',
    active: 'bg-primary/20 text-primary',
    complete: 'bg-accent/20 text-accent'
  }

  const statusLabels = {
    setup: 'Setup',
    active: 'In Progress',
    complete: 'Complete'
  }

  const playerCount = tournament.players?.length ?? 0

  return (
    <Link href={`/tournament/${tournament.id}`}>
      <Card className="group hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {tournament.name}
            </CardTitle>
            <Badge className={statusColors[tournament.status]} variant="secondary">
              {statusLabels[tournament.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{tournament.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{playerCount} players</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{tournament.rounds} rounds</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Round {tournament.currentRound}/{tournament.rounds}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
