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
import { formatRoundCount, translations, translateServerError, type Language } from '@/lib/i18n'
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

interface CreateTournamentFormProps {
  language: Language
}

export function CreateTournamentForm({ language }: CreateTournamentFormProps) {
  const router = useRouter()
  const t = translations[language]
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
      setError(t.create.errors.minPlayers)
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
      setError(err instanceof Error ? translateServerError(err.message, language, t.create.errors.createFailed) : t.create.errors.createFailed)
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          {t.create.back}
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <Card>
          <CardHeader>
            <CardTitle>{t.create.title}</CardTitle>
            <CardDescription>
              {t.create.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.create.details}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">{t.create.name}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t.create.namePlaceholder}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">{t.common.date}</Label>
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
                    <Label htmlFor="rounds">{t.create.rounds}</Label>
                    <Select name="rounds" defaultValue="3" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.create.roundsPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {formatRoundCount(n, language)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {players.length >= 2 && (
                      <p className="text-xs text-muted-foreground">
                        {t.create.recommendation(players.length, suggestedRounds)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="byePoints">{t.create.byePoints}</Label>
                    <Select name="byePoints" defaultValue="1" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.create.byePointsPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">{t.create.halfPoint}</SelectItem>
                        <SelectItem value="1">{t.create.onePoint}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{t.common.players}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.create.playersDescription}
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
                      {t.create.randomSeeding}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="players">{t.create.playerList}</Label>
                  <Textarea
                    id="players"
                    value={playersText}
                    onChange={(event) => setPlayersText(event.target.value)}
                    placeholder={t.create.playerPlaceholder}
                    className="min-h-48 resize-y"
                    disabled={isLoading}
                    required
                  />
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>{t.create.playersReady(players.length)}</span>
                    <span>{randomizeSeeding ? t.create.randomizedHint : t.create.seededHint}</span>
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
                    {t.create.creating}
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    {t.home.createTournament}
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
            <h2 className="font-semibold">{t.create.whatNext}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t.create.whatNextDescription}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/35 p-5 text-sm leading-6 text-muted-foreground">
            {t.create.rosterHint}
          </div>
        </aside>
      </div>
    </div>
  )
}
