'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { startNextRound, deleteTournament } from '@/lib/tournament/actions'
import type { Tournament, Player } from '@/lib/tournament/types'
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
}

export function TournamentControls({ tournament, players, hasActiveRound }: TournamentControlsProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activePlayers = players.filter(p => p.isActive)
  const canStartRound = activePlayers.length >= 2 && 
    !hasActiveRound && 
    tournament.currentRound < tournament.rounds

  async function handleStartRound() {
    setIsStarting(true)
    setError(null)
    try {
      await startNextRound(tournament.id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start round')
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
    setup: { label: 'Setup', color: 'bg-muted text-muted-foreground' },
    active: { label: 'In Progress', color: 'bg-primary/20 text-primary' },
    complete: { label: 'Complete', color: 'bg-accent/20 text-accent' }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tournament Controls</span>
          <Badge className={statusConfig[tournament.status].color}>
            {statusConfig[tournament.status].label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Round</span>
            <p className="font-semibold">{tournament.currentRound} / {tournament.rounds}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Players</span>
            <p className="font-semibold">{activePlayers.length} active</p>
          </div>
          <div>
            <span className="text-muted-foreground">Bye Points</span>
            <p className="font-semibold">{tournament.byePoints}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Date</span>
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
            Tournament completed!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleStartRound}
              disabled={!canStartRound || isStarting}
              className="w-full"
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Round...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Round {tournament.currentRound + 1}
                </>
              )}
            </Button>

            {!canStartRound && activePlayers.length < 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Need at least 2 players to start
              </p>
            )}

            {!canStartRound && hasActiveRound && (
              <p className="text-xs text-muted-foreground text-center">
                Complete current round to continue
              </p>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tournament
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{tournament.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
