'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { addPlayer } from '@/lib/tournament/actions'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'

interface JoinPageProps {
  params: Promise<{ id: string }>
}

export default function JoinPage({ params }: JoinPageProps) {
  const { id } = use(params)
  const router = useRouter()
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
      await addPlayer(id, {
        name,
        rating: rating ? parseInt(rating, 10) : undefined
      })
      router.push(`/tournament/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa prihlásiť do turnaja')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto mb-6 max-w-md">
          <Button asChild variant="ghost" className="gap-2 px-0">
            <Link href={`/tournament/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Späť na turnaj
            </Link>
          </Button>
        </div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Prihlásiť sa do turnaja</CardTitle>
            <CardDescription>
              Zadajte meno a voliteľné Elo. Organizátor vás potom uvidí v zozname hráčov.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vaše meno</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Zadajte svoje meno"
                  required
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Elo (voliteľné)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  placeholder="napr. 1500"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Vaše šachové Elo (FIDE, USCF alebo odhad)
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
                    Prihlasovanie...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Prihlásiť sa
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
