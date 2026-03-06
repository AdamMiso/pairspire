'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { updatePlayer } from '@/lib/tournament/actions'
import type { Player } from '@/lib/tournament/types'
import { UserMinus, UserPlus, Loader2 } from 'lucide-react'

interface PlayerManagementProps {
  tournamentId: string
  players: Player[]
}

export function PlayerManagement({ tournamentId, players }: PlayerManagementProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggleActive(player: Player) {
    setLoadingId(player.id)
    try {
      await updatePlayer(player.id, { isActive: !player.isActive })
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  // Sort by seedOrder safely
  const sortedPlayers = [...players].sort((a, b) => {
    const seedA = a.seedOrder ?? 999
    const seedB = b.seedOrder ?? 999
    return seedA - seedB
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Hráči ({players.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenašli sa žiadni hráči. Prosím, vytvorte turnaj znova.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Nas.</TableHead>
                  <TableHead>Meno</TableHead>
                  <TableHead className="text-center">Stav</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player) => (
                  <TableRow key={player.id} className={!player.isActive ? 'opacity-50' : ''}>
                    <TableCell className="text-center font-medium">
                      {player.seedOrder || '-'}
                    </TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={player.isActive ? 'default' : 'secondary'}>
                        {player.isActive ? 'Aktívny' : 'Odstúpil'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(player)}
                          disabled={loadingId === player.id}
                          title={player.isActive ? 'Odstúpiť hráča' : 'Obnoviť hráča'}
                        >
                          {loadingId === player.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : player.isActive ? (
                            <UserMinus className="h-4 w-4" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
