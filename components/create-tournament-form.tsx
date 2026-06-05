'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTournament } from '@/lib/tournament/actions'
import { ArrowLeft, Loader2, Shuffle, Trophy, Users } from 'lucide-react'

function parsePlayers(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((player) => player.trim())
    .filter(Boolean)
}

function recommendedRounds(playerCount: number) {
  if (playerCount <= 2) return 1
  if (playerCount <= 8) return 3
  if (playerCount <= 16) return 4
  if (playerCount <= 32) return 5
  return 6
}

export function CreateTournamentForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [randomizeSeeding, setRandomizeSeeding] = useState(false)
  const [playersText, setPlayersText] = useState('')

  const players = parsePlayers(playersText)
  const suggestedRounds = recommendedRounds(players.length)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const date = formData.get('date') as string
    const rounds = parseInt(formData.get('rounds') as string, 10)
    const byePoints = parseFloat(formData.get('byePoints') as string)

    if (players.length < 2) {
      setError('Zadajte aspoň 2 hráčov')
      setIsLoading(false)
      return
    }

    try {
      const tournament = await createTournament({
        name,
        date,
        rounds,
        byePoints,
        players,
        randomizeSeeding
      })
      router.push(`/tournament/${tournament.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa vytvoriť turnaj')
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Späť na turnaje
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <Card>
          <CardHeader>
            <CardTitle>Vytvoriť turnaj</CardTitle>
            <CardDescription>
              Najrýchlejšia cesta: pomenujte turnaj, vložte zoznam hráčov a spustite prvé kolo na ďalšej obrazovke.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detaily turnaja</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Názov turnaja</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="napr. Piatkový klubový turnaj"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Dátum</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={today}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rounds">Počet kôl</Label>
                    <Select name="rounds" defaultValue="3" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte počet kôl" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? 'kolo' : 'kôl'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {players.length >= 2 && (
                      <p className="text-xs text-muted-foreground">
                        Pre {players.length} hráčov odporúčame približne {suggestedRounds} {suggestedRounds === 1 ? 'kolo' : 'kolá'}.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="byePoints">Body za voľno</Label>
                    <Select name="byePoints" defaultValue="1" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte body za voľno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0,5 bodu</SelectItem>
                        <SelectItem value="1">1 bod</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Hráči</h3>
                    <p className="text-sm text-muted-foreground">
                      Každý riadok je jeden hráč. Poradie riadkov je nasadenie.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                    <Switch
                      id="randomize"
                      checked={randomizeSeeding}
                      onCheckedChange={setRandomizeSeeding}
                      disabled={isLoading}
                    />
                    <Label htmlFor="randomize" className="flex cursor-pointer items-center gap-2 text-sm">
                      <Shuffle className="h-4 w-4" />
                      Náhodné nasadenie
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="players">Zoznam hráčov</Label>
                  <Textarea
                    id="players"
                    value={playersText}
                    onChange={(event) => setPlayersText(event.target.value)}
                    placeholder={'Anna Nováková\nBoris Kováč\nCyril Horváth\nDana Šimková'}
                    className="min-h-48 resize-y"
                    disabled={isLoading}
                    required
                  />
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>{players.length} {players.length === 1 ? 'hráč' : players.length > 1 && players.length < 5 ? 'hráči' : 'hráčov'} pripravených</span>
                    <span>{randomizeSeeding ? 'Nasadenie sa zamieša pri vytvorení.' : 'Prvý riadok bude prvý nasadený.'}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={isLoading || players.length < 2}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vytváranie...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Vytvoriť turnaj
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">Čo bude ďalej</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Po vytvorení uvidíte poradie, hráčov a ovládanie turnaja na jednej obrazovke. Prvé kolo spustíte jedným tlačidlom.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/35 p-5 text-sm leading-6 text-muted-foreground">
            Ak ešte neviete kompletnú súpisku, vytvorte turnaj s minimálne dvoma hráčmi a ďalších doplníte cez odkaz na prihlásenie.
          </div>
        </aside>
      </div>
    </div>
  )
}
