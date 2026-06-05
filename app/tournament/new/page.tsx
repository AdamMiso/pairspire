import { Header } from '@/components/header'
import { CreateTournamentForm } from '@/components/create-tournament-form'
import { getLanguage } from '@/lib/i18n-server'

export default async function NewTournamentPage() {
  const language = await getLanguage()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CreateTournamentForm language={language} />
      </main>
    </div>
  )
}
