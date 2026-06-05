'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { recordMatchResult } from '@/lib/tournament/actions'
import type { Match, Player } from '@/lib/tournament/types'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface RoundPairingsProps {
  roundNumber: number
  matches: Match[]
  players: Player[]
  isActive: boolean
}

export function RoundPairings({ roundNumber, matches, players, isActive }: RoundPairingsProps) {
  const router = useRouter()
  const [loadingMatch, setLoadingMatch] = useState<string | null>(null)

  const getPlayer = (id: string | null) => players.find(p => p.id === id)

  async function handleResult(matchId: string, result: 'white' | 'black' | 'draw') {
    setLoadingMatch(matchId)
    try {
      await recordMatchResult(matchId, result)
      router.refresh()
    } finally {
      setLoadingMatch(null)
    }
  }

  const getResultDisplay = (result: Match['result']) => {
    switch (result) {
      case 'white':
        return <Badge className="bg-foreground text-background">1 - 0</Badge>
      case 'black':
        return <Badge className="bg-foreground text-background">0 - 1</Badge>
      case 'draw':
        return <Badge variant="secondary">½ - ½</Badge>
      case 'bye':
        return <Badge variant="outline">Voľno</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Kolo {roundNumber}</span>
          {isActive && (
            <Badge className="bg-primary/15 text-primary">Prebieha</Badge>
          )}
          {!isActive && <Badge variant="secondary">Uzavreté</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => {
            const white = getPlayer(match.whitePlayerId)
            const black = getPlayer(match.blackPlayerId)
            const isLoading = loadingMatch === match.id
            const isPending = match.result === 'pending'

            return (
              <div
                key={match.id}
                className="grid gap-3 rounded-lg border bg-muted/35 p-3 sm:grid-cols-[2.5rem,1fr,auto] sm:items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-card text-sm font-semibold text-muted-foreground">
                  {match.boardNumber}
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),5rem,minmax(0,1fr)] sm:items-center">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 fill-background text-foreground" />
                    <span className={`min-w-0 truncate font-medium ${match.result === 'white' ? 'text-primary' : ''}`}>
                      {white?.name ?? 'Neznámy'}
                    </span>
                    {white?.rating && (
                      <span className="text-xs text-muted-foreground">({white.rating})</span>
                    )}
                  </div>

                  <div className="flex items-center sm:justify-center">
                    {match.isBye ? (
                      <Badge variant="outline">Voľno</Badge>
                    ) : match.result !== 'pending' ? (
                      getResultDisplay(match.result)
                    ) : (
                      <span className="text-sm text-muted-foreground">proti</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {!match.isBye && (
                      <>
                        {black?.rating && (
                          <span className="text-xs text-muted-foreground">({black.rating})</span>
                        )}
                        <span className={`min-w-0 truncate font-medium ${match.result === 'black' ? 'text-primary' : ''}`}>
                          {black?.name ?? 'Neznámy'}
                        </span>
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      </>
                    )}
                  </div>
                </div>

                {isActive && isPending && !match.isBye && (
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {isLoading ? (
                      <div className="flex h-10 min-w-28 items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResult(match.id, 'white')}
                          className="min-w-16"
                        >
                          1-0
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResult(match.id, 'draw')}
                          className="min-w-16"
                        >
                          ½-½
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResult(match.id, 'black')}
                          className="min-w-16"
                        >
                          0-1
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {!isPending && !match.isBye && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground sm:justify-end">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Zapísané
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
