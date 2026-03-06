'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { addPlayer, removePlayer, updatePlayer } from '@/lib/tournament/actions'
import type { Player } from '@/lib/tournament/types'
import { Plus, Trash2, UserMinus, UserPlus, Loader2 } from 'lucide-react'
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

interface PlayerManagementProps {
  tournamentId: string
  players: Player[]
  isSetup: boolean
}

export function PlayerManagement({ tournamentId, players, isSetup }: PlayerManagementProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [newPlayer, setNewPlayer] = useState({ name: '', rating: '' })

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault()
    if (!newPlayer.name.trim()) return

    setIsAdding(true)
    try {
      await addPlayer(tournamentId, {
        name: newPlayer.name.trim(),
        rating: newPlayer.rating ? parseInt(newPlayer.rating, 10) : undefined
      })
      setNewPlayer({ name: '', rating: '' })
      router.refresh()
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemovePlayer(id: string) {
    setLoadingId(id)
    try {
      await removePlayer(id)
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  async function handleToggleActive(player: Player) {
    setLoadingId(player.id)
    try {
      await updatePlayer(player.id, { isActive: !player.isActive })
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Players ({players.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSetup && (
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="playerName" className="sr-only">Player Name</Label>
              <Input
                id="playerName"
                placeholder="Player name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                disabled={isAdding}
              />
            </div>
            <div className="w-24">
              <Label htmlFor="playerRating" className="sr-only">Rating</Label>
              <Input
                id="playerRating"
                placeholder="Rating"
                type="number"
                value={newPlayer.rating}
                onChange={(e) => setNewPlayer({ ...newPlayer, rating: e.target.value })}
                disabled={isAdding}
              />
            </div>
            <Button type="submit" disabled={isAdding || !newPlayer.name.trim()}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </form>
        )}

        {players.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No players added yet. Add players to start the tournament.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className={!player.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell className="text-right">
                      {player.rating ?? <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={player.isActive ? 'default' : 'secondary'}>
                        {player.isActive ? 'Active' : 'Withdrawn'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {!isSetup && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(player)}
                            disabled={loadingId === player.id}
                            title={player.isActive ? 'Withdraw player' : 'Reinstate player'}
                          >
                            {loadingId === player.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : player.isActive ? (
                              <UserMinus className="h-4 w-4" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {isSetup && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={loadingId === player.id}
                              >
                                {loadingId === player.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Player</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {player.name} from the tournament?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemovePlayer(player.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
