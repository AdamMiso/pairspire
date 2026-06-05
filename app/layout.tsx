import type { Metadata } from 'next'
import { getLanguage } from '@/lib/i18n-server'
import { translations } from '@/lib/i18n'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLanguage()
  const t = translations[language]

  return {
    title: t.app.title,
    description: t.app.description,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const language = await getLanguage()

  return (
    <html lang={language} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
