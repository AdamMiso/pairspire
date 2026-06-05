'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { startNextRound, deleteTournament } from '@/lib/tournament/actions'
import type { Tournament, Player } from '@/lib/tournament/types'
import { translations, translateServerError, type Language } from '@/lib/i18n'
import { Play, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TournamentControlsProps {
  tournament: Tournament
  players: Player[]
  hasActiveRound: boolean
  language: Language
}

export function TournamentControls({ tournament, players, hasActiveRound, language }: TournamentControlsProps) {
  const router = useRouter()
  const t = translations[language]
  const [isStarting, setIsStarting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activePlayers = players.filter(p => p.isActive)
  const canStartRound = activePlayers.length >= 2 && 
    !hasActiveRound && 
    tournament.currentRound < tournament.rounds
  const completedRoundEstimate = hasActiveRound ? Math.max(tournament.currentRound - 1, 0) : tournament.currentRound
  const progressValue = tournament.rounds === 0 ? 0 : Math.round((completedRoundEstimate / tournament.rounds) * 100)

  async function handleStartRound() {
    setIsStarting(true)
    setError(null)
    try {
      await startNextRound(tournament.id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? translateServerError(err.message, language, t.controls.startFailed) : t.controls.startFailed)
    } finally {
      setIsStarting(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteTournament(tournament.id)
      router.push('/')
    } catch {
      setIsDeleting(false)
    }
  }

  const statusConfig = {
    setup: { label: t.common.setup, color: 'bg-muted text-muted-foreground' },
    active: { label: t.common.active, color: 'bg-primary/15 text-primary' },
    complete: { label: t.common.complete, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.controls.title}</span>
          <Badge className={statusConfig[tournament.status].color}>
            {statusConfig[tournament.status].label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.common.progress}</span>
            <span className="font-medium">{progressValue}%</span>
          </div>
          <Progress value={progressValue} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t.common.round}</span>
            <p className="font-semibold">{tournament.currentRound} / {tournament.rounds}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.common.players}</span>
            <p className="font-semibold">{t.controls.activePlayers(activePlayers.length)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.controls.byePoints}</span>
            <p className="font-semibold">{tournament.byePoints}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t.common.date}</span>
            <p className="font-semibold">{tournament.date}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {tournament.status === 'complete' ? (
          <div className="flex items-center gap-2 text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">
            <CheckCircle2 className="h-4 w-4" />
            {t.controls.completeMessage}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleStartRound}
              disabled={!canStartRound || isStarting}
              className="w-full gap-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.controls.starting}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {hasActiveRound ? t.controls.finishRound(tournament.currentRound) : t.controls.startRound(tournament.currentRound + 1)}
                </>
              )}
            </Button>

            {!canStartRound && activePlayers.length < 2 && (
              <p className="text-xs text-muted-foreground text-center">
                {t.controls.needsPlayers}
              </p>
            )}

            {!canStartRound && hasActiveRound && (
              <p className="text-xs text-muted-foreground text-center">
                {t.controls.needsResults}
              </p>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t.controls.deleteTournament}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.controls.deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.controls.deleteDescription(tournament.name)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t.common.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
