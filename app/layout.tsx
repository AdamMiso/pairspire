import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pairspire - Správca šachových turnajov',
  description: 'Jednoduchá správa šachových turnajov švajčiarskym systémom. Vytvárajte turnaje, spravujte párovania a sledujte poradie.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
