import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Swiss-System Tournament Rules</h1>
          <p className="text-muted-foreground">
            Understanding how Swiss-system chess tournaments work
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What is a Swiss Tournament?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                The Swiss-system tournament is a non-eliminating tournament format which features a fixed 
                number of rounds of competition, but considerably fewer than in a round-robin tournament. 
                In a Swiss tournament, each competitor does not play every other. Competitors meet one-on-one 
                in each round and are paired using a set of rules designed to ensure that each competitor 
                plays opponents with a similar running score, but does not play the same opponent more than once.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pairing Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">1.</span>
                  <span>Players with the same score are paired together when possible</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">2.</span>
                  <span>No player can face the same opponent twice in a tournament</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">3.</span>
                  <span>Colors (white/black) are assigned to balance each players color history</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">4.</span>
                  <span>If there is an odd number of players, the lowest-scoring player who has not yet received a bye gets one</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">5.</span>
                  <span>Higher-rated players are given preference when multiple valid pairings exist</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">1</div>
                  <div className="text-sm text-muted-foreground">Win</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">0.5</div>
                  <div className="text-sm text-muted-foreground">Draw</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Loss</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiebreakers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                When players have the same score, the following tiebreakers are applied in order:
              </p>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">1.</span>
                  <div>
                    <span className="font-medium text-foreground">Buchholz Score</span>
                    <p className="text-sm">Sum of opponents scores. Higher is better as it indicates stronger opposition.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">2.</span>
                  <div>
                    <span className="font-medium text-foreground">Number of Wins</span>
                    <p className="text-sm">More wins indicate more decisive play.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">3.</span>
                  <div>
                    <span className="font-medium text-foreground">Rating</span>
                    <p className="text-sm">Higher-rated player ranks higher if all else is equal.</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bye Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                A bye is given when there is an odd number of active players in a round. The player 
                receiving the bye does not play that round but is awarded points (typically 1 point, 
                equivalent to a win).
              </p>
              <p>
                The bye is given to the lowest-scoring player who has not previously received a bye. 
                If all players have had a bye, the lowest-scoring player receives it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Number of Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The optimal number of rounds depends on the number of players:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {[
                  { players: '4-8', rounds: '3-4' },
                  { players: '9-16', rounds: '4-5' },
                  { players: '17-32', rounds: '5-6' },
                  { players: '33-64', rounds: '6-7' },
                ].map((item) => (
                  <div key={item.players} className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-sm text-muted-foreground">{item.players} players</div>
                    <div className="font-semibold text-primary">{item.rounds} rounds</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Formula: rounds = ceiling(log2(players)) for a guaranteed unique winner
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
