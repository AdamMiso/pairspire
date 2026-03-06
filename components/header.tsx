import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded overflow-hidden shadow-sm">
            <Image 
              src="/logo.png" 
              alt="Chess King Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">FooCheBeer</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/rules">
            <Button variant="ghost" size="sm">
              Pravidlá
            </Button>
          </Link>
          <Link href="/tournament/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nový turnaj
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
