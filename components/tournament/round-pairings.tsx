'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { recordMatchResult } from '@/lib/tournament/actions'
import type { Match, Player } from '@/lib/tournament/types'
import { Loader2, Circle } from 'lucide-react'

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
        return <Badge variant="outline">Bye</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Round {roundNumber}</span>
          {isActive && (
            <Badge className="bg-primary/20 text-primary">In Progress</Badge>
          )}
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
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border"
              >
                <div className="w-8 text-center text-sm text-muted-foreground font-medium">
                  {match.boardNumber}
                </div>

                <div className="flex-1 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  {/* White player */}
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 fill-foreground text-foreground" />
                    <span className={`font-medium ${match.result === 'white' ? 'text-primary' : ''}`}>
                      {white?.name ?? 'Unknown'}
                    </span>
                    {white?.rating && (
                      <span className="text-xs text-muted-foreground">({white.rating})</span>
                    )}
                  </div>

                  {/* Result */}
                  <div className="flex items-center justify-center min-w-[80px]">
                    {match.isBye ? (
                      <Badge variant="outline">Bye</Badge>
                    ) : match.result !== 'pending' ? (
                      getResultDisplay(match.result)
                    ) : (
                      <span className="text-muted-foreground">vs</span>
                    )}
                  </div>

                  {/* Black player */}
                  <div className="flex items-center gap-2 justify-end">
                    {!match.isBye && (
                      <>
                        {black?.rating && (
                          <span className="text-xs text-muted-foreground">({black.rating})</span>
                        )}
                        <span className={`font-medium ${match.result === 'black' ? 'text-primary' : ''}`}>
                          {black?.name ?? 'Unknown'}
                        </span>
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {isActive && isPending && !match.isBye && (
                  <div className="flex items-center gap-1">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResult(match.id, 'white')}
                          className="text-xs px-2"
                        >
                          1-0
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResult(match.id, 'draw')}
                          className="text-xs px-2"
                        >
                          ½-½
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResult(match.id, 'black')}
                          className="text-xs px-2"
                        >
                          0-1
                        </Button>
                      </>
                    )}
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
