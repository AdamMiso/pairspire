import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Plus } from 'lucide-react'

export function EmptyTournaments() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Trophy className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Zatiaľ žiadne turnaje</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Vytvorte svoj prvý šachový turnaj a začnite sledovať hráčov, spravovať párovania a počítať poradie.
      </p>
      <Link href="/tournament/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Vytvoriť turnaj
        </Button>
      </Link>
    </div>
  )
}
