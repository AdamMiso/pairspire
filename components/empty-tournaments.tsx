import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { translations, type Language } from '@/lib/i18n'
import { Trophy, Plus } from 'lucide-react'

interface EmptyTournamentsProps {
  language: Language
}

export function EmptyTournaments({ language }: EmptyTournamentsProps) {
  const t = translations[language]

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card px-4 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-primary/10">
        <Trophy className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">{t.home.emptyTitle}</h2>
      <p className="mb-6 max-w-md text-sm leading-6 text-muted-foreground">
        {t.home.emptyDescription}
      </p>
      <Link href="/tournament/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          {t.home.createTournament}
        </Button>
      </Link>
    </div>
  )
}
