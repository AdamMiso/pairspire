import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { JoinTournamentForm } from '@/components/join-tournament-form'
import { getLanguage } from '@/lib/i18n-server'
import { translations } from '@/lib/i18n'
import { ArrowLeft } from 'lucide-react'

interface JoinPageProps {
  params: Promise<{ id: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { id } = await params
  const language = await getLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto mb-6 max-w-md">
          <Button asChild variant="ghost" className="gap-2 px-0">
            <Link href={`/tournament/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              {t.join.back}
            </Link>
          </Button>
        </div>
        <JoinTournamentForm tournamentId={id} language={language} />
      </main>
    </div>
  )
}
