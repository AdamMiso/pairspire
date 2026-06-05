import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Pairspire logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="truncate text-lg font-bold tracking-tight sm:text-xl">Pairspire</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/rules">
            <Button variant="ghost" size="sm">
              Pravidlá
            </Button>
          </Link>
          <Link href="/tournament/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nový turnaj</span>
              <span className="sm:hidden">Nový</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
