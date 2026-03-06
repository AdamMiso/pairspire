'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { addPlayer } from '@/lib/tournament/actions'
import { Loader2 } from 'lucide-react'

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
      setError(err instanceof Error ? err.message : 'Failed to join tournament')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Join Tournament</CardTitle>
            <CardDescription>
              Enter your details to register for this tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (optional)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  placeholder="e.g., 1500"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Your chess rating (FIDE, USCF, or estimated)
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
                    Joining...
                  </>
                ) : (
                  'Join Tournament'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
