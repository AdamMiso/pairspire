import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-8 rounded-lg border bg-card p-5 sm:p-6">
          <Badge variant="secondary" className="mb-3">Sprievodca</Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pravidlá turnaja švajčiarskym systémom</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Praktický prehľad toho, ako aplikácia páruje hráčov, počíta výsledky a rozhoduje poradie.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Čo je turnaj švajčiarskym systémom?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Turnaj švajčiarskym systémom je nevyraďovací formát so stanoveným počtom kôl,
                ktorý je výrazne nižší než pri turnaji každý s každým.
                V švajčiarskom turnaji nehrá každý účastník proti každému.
                Hráči sa v každom kole stretávajú jeden na jedného a párujú sa podľa pravidiel,
                ktoré zabezpečujú súperov s podobným priebežným skóre, no bez opakovania rovnakého súpera.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pravidlá párovania</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">1.</span>
                  <span>Hráči s rovnakým skóre sa párujú spolu, ak je to možné</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">2.</span>
                  <span>Žiadny hráč nemôže v turnaji naraziť na rovnakého súpera dvakrát</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">3.</span>
                  <span>Farby (biela/čierna) sa prideľujú tak, aby sa vyvažovala história farieb hráča</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">4.</span>
                  <span>Ak je nepárny počet hráčov, voľno dostane najnižšie bodujúci hráč, ktorý ho ešte nemal</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">5.</span>
                  <span>Ak existuje viac platných párovaní, prednosť majú hráči s vyšším ratingom</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bodovací systém</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">1</div>
                  <div className="text-sm text-muted-foreground">Výhra</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">0.5</div>
                  <div className="text-sm text-muted-foreground">Remíza</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Prehra</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pomocné hodnotenia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Keď majú hráči rovnaké skóre, použijú sa tieto pomocné hodnotenia v tomto poradí:
              </p>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">1.</span>
                  <div>
                    <span className="font-medium text-foreground">Buchholzovo skóre</span>
                    <p className="text-sm">Súčet bodov súperov. Vyššia hodnota je lepšia, pretože znamená silnejších súperov.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">2.</span>
                  <div>
                    <span className="font-medium text-foreground">Počet výhier</span>
                    <p className="text-sm">Viac výhier znamená rozhodnejšiu hru.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">3.</span>
                  <div>
                    <span className="font-medium text-foreground">Elo</span>
                    <p className="text-sm">Vyššie hodnotený hráč sa umiestni vyššie, ak sú ostatné kritériá rovnaké.</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pravidlá voľna (bye)</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                Voľno sa udeľuje, keď je v kole nepárny počet aktívnych hráčov.
                Hráč s voľnom v danom kole nehrá, ale získa body (typicky 1 bod, teda ako za výhru).
              </p>
              <p>
                Voľno dostane najnižšie bodujúci hráč, ktorý ho ešte predtým nedostal.
                Ak už voľno mali všetci hráči, dostane ho najnižšie bodujúci hráč.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Odporúčaný počet kôl</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Optimálny počet kôl závisí od počtu hráčov:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {[
                  { players: '4-8', rounds: '3-4' },
                  { players: '9-16', rounds: '4-5' },
                  { players: '17-32', rounds: '5-6' },
                  { players: '33-64', rounds: '6-7' },
                ].map((item) => (
                  <div key={item.players} className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground">{item.players} hráčov</div>
                    <div className="font-semibold text-primary">{item.rounds} kôl</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Vzorec: počet kôl = ceiling(log2(počet hráčov)) pre zaručeného jednoznačného víťaza
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
