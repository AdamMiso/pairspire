'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTournament } from '@/lib/tournament/actions'
import { Loader2 } from 'lucide-react'

export function CreateTournamentForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const date = formData.get('date') as string
    const rounds = parseInt(formData.get('rounds') as string, 10)
    const byePoints = parseFloat(formData.get('byePoints') as string)

    try {
      const tournament = await createTournament({
        name,
        date,
        rounds,
        byePoints
      })
      router.push(`/tournament/${tournament.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament')
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Tournament</CardTitle>
        <CardDescription>
          Set up a new Swiss-system chess tournament
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Spring Championship 2026"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
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
            <Label htmlFor="rounds">Number of Rounds</Label>
            <Select name="rounds" defaultValue="5" disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select rounds" />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} rounds
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Recommended: log2(players) + 1 rounds for optimal Swiss pairing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="byePoints">Bye Points</Label>
            <Select name="byePoints" defaultValue="1" disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select bye points" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5 points (half)</SelectItem>
                <SelectItem value="1">1 point (full win)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Points awarded when a player receives a bye
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
                Creating...
              </>
            ) : (
              'Create Tournament'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
