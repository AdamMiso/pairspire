'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { addPlayer } from '@/lib/tournament/actions'
import { translations, translateServerError, type Language } from '@/lib/i18n'
import { Loader2, UserPlus } from 'lucide-react'

interface JoinTournamentFormProps {
  tournamentId: string
  language: Language
}

export function JoinTournamentForm({ tournamentId, language }: JoinTournamentFormProps) {
  const router = useRouter()
  const t = translations[language]
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const rating = formData.get('rating') as string

    try {
      await addPlayer(tournamentId, {
        name,
        rating: rating ? parseInt(rating, 10) : undefined
      })
      router.push(`/tournament/${tournamentId}`)
    } catch (err) {
      setError(err instanceof Error ? translateServerError(err.message, language, t.join.error) : t.join.error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <CardTitle>{t.join.title}</CardTitle>
        <CardDescription>
          {t.join.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.join.name}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t.join.namePlaceholder}
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">{t.join.rating}</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              placeholder={t.join.ratingPlaceholder}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {t.join.ratingHelp}
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.join.joining}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {t.join.join}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
