import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Trophy } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">FooCheBeer</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/rules">
            <Button variant="ghost" size="sm">
              Rules
            </Button>
          </Link>
          <Link href="/tournament/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Tournament
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
