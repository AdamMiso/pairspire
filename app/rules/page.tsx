import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLanguage } from '@/lib/i18n-server'
import { formatPlayerCount, formatRoundCount, translations } from '@/lib/i18n'

export default async function RulesPage() {
  const language = await getLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-8 rounded-lg border bg-card p-5 sm:p-6">
          <Badge variant="secondary" className="mb-3">{t.rules.badge}</Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.rules.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t.rules.intro}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.rules.whatTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t.rules.whatBody}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.rules.pairingTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                {t.rules.pairingRules.map((rule, index) => (
                  <li key={rule} className="flex gap-3">
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.rules.scoringTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">1</div>
                  <div className="text-sm text-muted-foreground">{t.rules.win}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">0.5</div>
                  <div className="text-sm text-muted-foreground">{t.rules.draw}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">{t.rules.loss}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.rules.tiebreakTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t.rules.tiebreakIntro}
              </p>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">1.</span>
                  <div>
                    <span className="font-medium text-foreground">{t.rules.buchholz}</span>
                    <p className="text-sm">{t.rules.buchholzDescription}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">2.</span>
                  <div>
                    <span className="font-medium text-foreground">{t.rules.winsCount}</span>
                    <p className="text-sm">{t.rules.winsDescription}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">3.</span>
                  <div>
                    <span className="font-medium text-foreground">Elo</span>
                    <p className="text-sm">{t.rules.eloDescription}</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.rules.byeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                {t.rules.byeBody1}
              </p>
              <p>
                {t.rules.byeBody2}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.rules.recommendedTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t.rules.recommendedIntro}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {[
                  { players: '4-8', rounds: '3-4' },
                  { players: '9-16', rounds: '4-5' },
                  { players: '17-32', rounds: '5-6' },
                  { players: '33-64', rounds: '6-7' },
                ].map((item) => (
                  <div key={item.players} className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground">{formatPlayerCount(Number(item.players.split('-')[1]), language).replace(String(item.players.split('-')[1]), item.players)}</div>
                    <div className="font-semibold text-primary">{formatRoundCount(Number(item.rounds.split('-')[1]), language).replace(String(item.rounds.split('-')[1]), item.rounds)}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t.rules.formula}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
