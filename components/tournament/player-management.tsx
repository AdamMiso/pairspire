'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { addPlayer, updatePlayer } from '@/lib/tournament/actions'
import type { Player } from '@/lib/tournament/types'
import { Loader2, Plus, UserMinus, UserPlus } from 'lucide-react'

interface PlayerManagementProps {
  tournamentId: string
  players: Player[]
  canAddPlayers?: boolean
}

export function PlayerManagement({ tournamentId, players, canAddPlayers = false }: PlayerManagementProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAddPlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsAdding(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const ratingValue = String(formData.get('rating') ?? '').trim()

    if (!name) {
      setError('Zadajte meno hráča')
      setIsAdding(false)
      return
    }

    try {
      await addPlayer(tournamentId, {
        name,
        rating: ratingValue ? Number(ratingValue) : undefined
      })
      form.reset()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa pridať hráča')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleToggleActive(player: Player) {
    setLoadingId(player.id)
    setError(null)
    try {
      await updatePlayer(player.id, { isActive: !player.isActive })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa zmeniť stav hráča')
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
        {canAddPlayers && (
          <form onSubmit={handleAddPlayer} className="rounded-md border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr,140px,auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="new-player-name">Meno hráča</Label>
                <Input
                  id="new-player-name"
                  name="name"
                  placeholder="Nový hráč"
                  disabled={isAdding}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-player-rating">Elo</Label>
                <Input
                  id="new-player-rating"
                  name="rating"
                  type="number"
                  min="0"
                  placeholder="voliteľné"
                  disabled={isAdding}
                />
              </div>
              <Button type="submit" className="gap-2" disabled={isAdding}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Pridať
              </Button>
            </div>
          </form>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenašli sa žiadni hráči. Prosím, vytvorte turnaj znova.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
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
                          aria-label={player.isActive ? `Odstúpiť hráča ${player.name}` : `Obnoviť hráča ${player.name}`}
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
