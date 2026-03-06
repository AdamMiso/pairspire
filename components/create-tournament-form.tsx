'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTournament } from '@/lib/tournament/actions'
import { Loader2 } from 'lucide-react'

export function CreateTournamentForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [randomizeSeeding, setRandomizeSeeding] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const date = formData.get('date') as string
    const rounds = parseInt(formData.get('rounds') as string, 10)
    const byePoints = parseFloat(formData.get('byePoints') as string)

    // Collect players
    const players: string[] = []
    for (let i = 1; i <= 8; i++) {
      const pName = formData.get(`player${i}`) as string
      if (pName && pName.trim()) {
        players.push(pName.trim())
      }
    }

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
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Vytvoriť turnaj</CardTitle>
        <CardDescription>
          Nastavte nový šachový turnaj švajčiarskym systémom a pridajte hráčov
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detaily turnaja</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Názov turnaja</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="napr. Jarný šampionát"
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
                    {[3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} kôl
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="byePoints">Body za voľno</Label>
                <Select name="byePoints" defaultValue="1" disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte body za voľno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0,5 bodu (pol)</SelectItem>
                    <SelectItem value="1">1 bod (plná výhra)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Hráči</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="randomize"
                  checked={randomizeSeeding}
                  onCheckedChange={setRandomizeSeeding}
                  disabled={isLoading}
                />
                <Label htmlFor="randomize" className="text-sm cursor-pointer whitespace-nowrap">
                  Náhodné nasadenie
                </Label>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {!randomizeSeeding
                ? "Hráči budú nasadení presne v poradí zadanom nižšie (Hráč 1 je 1. nasadený)."
                : "Hráčom bude pridelené náhodné nasadenie bez ohľadu na poradie zadané nižšie."}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Label htmlFor={`player${i + 1}`} className="w-20 text-right">
                    Hráč {i + 1}
                  </Label>
                  <Input
                    id={`player${i + 1}`}
                    name={`player${i + 1}`}
                    placeholder={`Meno ${i + 1}`}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Poznámka: Vyžadujú sa aspoň 2 hráči. Ak je hráčov menej ako 8, ostatné polia nechajte prázdne.
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vytváranie...
              </>
            ) : (
              'Vytvoriť turnaj a pridať hráčov'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
