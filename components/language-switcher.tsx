'use client'

import { useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { languageCookie, type Language } from '@/lib/i18n'

interface LanguageSwitcherProps {
  language: Language
  labels: {
    language: string
    slovak: string
    english: string
  }
}

export function LanguageSwitcher({ language, labels }: LanguageSwitcherProps) {
  const router = useRouter()

  function switchLanguage(nextLanguage: Language) {
    document.cookie = `${languageCookie}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-1" aria-label={labels.language}>
      <Languages className="mx-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Button
        type="button"
        variant={language === 'sk' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => switchLanguage('sk')}
        aria-pressed={language === 'sk'}
        title={labels.slovak}
      >
        SK
      </Button>
      <Button
        type="button"
        variant={language === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => switchLanguage('en')}
        aria-pressed={language === 'en'}
        title={labels.english}
      >
        EN
      </Button>
    </div>
  )
}
