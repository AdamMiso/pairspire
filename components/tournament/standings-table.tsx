import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Player } from '@/lib/tournament/types'
import { formatPlayerCount, translations, type Language } from '@/lib/i18n'
import { Trophy, Medal, Award } from 'lucide-react'

interface StandingsTableProps {
  players: Player[]
  showRank?: boolean
  language: Language
}

export function StandingsTable({ players, showRank = true, language }: StandingsTableProps) {
  const t = translations[language]
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz
    if (b.wins !== a.wins) return b.wins - a.wins
    return (a.seedOrder ?? 999) - (b.seedOrder ?? 999)
  })

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-primary" />
      case 2:
        return <Medal className="h-4 w-4 text-muted-foreground" />
      case 3:
        return <Award className="h-4 w-4 text-accent" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{t.common.standings}</span>
          {sorted.length > 0 && (
            <Badge variant="secondary">{formatPlayerCount(sorted.length, language)}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="rounded-md border bg-muted/30 px-6 py-10 text-center">
            <h2 className="font-semibold">{t.standings.emptyTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.standings.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {showRank && <TableHead className="w-[60px]">{t.standings.rank}</TableHead>}
                  <TableHead>{t.standings.player}</TableHead>
                  <TableHead className="text-center">{t.standings.points}</TableHead>
                  <TableHead className="text-center">{t.standings.wins}</TableHead>
                  <TableHead className="text-center">{t.standings.draws}</TableHead>
                  <TableHead className="text-center">{t.standings.losses}</TableHead>
                  <TableHead className="text-center">Buchholz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((player, index) => {
                  const rank = index + 1
                  return (
                    <TableRow key={player.id} className={!player.isActive ? 'opacity-50' : ''}>
                      {showRank && (
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(rank)}
                            <span>{rank}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          {!player.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              {t.standings.withdrawn}
                            </Badge>
                          )}
                          {player.hasHadBye && (
                            <Badge variant="outline" className="text-xs">
                              {t.common.bye}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold tabular-nums text-primary">
                        {player.score}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {player.wins}
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">
                        {player.draws}
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-destructive">
                        {player.losses}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {player.buchholz.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
