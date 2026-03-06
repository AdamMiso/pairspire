export interface Player {
  id: string
  tournamentId: string
  name: string
  rating: number | null
  score: number
  buchholz: number
  wins: number
  losses: number
  draws: number
  hasHadBye: boolean
  isActive: boolean
  opponents?: string[] // IDs of opponents faced
  colorHistory?: ('white' | 'black')[] // History of colors played
}

export interface Match {
  id: string
  roundId: string
  tournamentId: string
  whitePlayerId: string | null
  blackPlayerId: string | null
  result: 'white' | 'black' | 'draw' | 'pending' | 'bye'
  boardNumber: number
  isBye: boolean
}

export interface Round {
  id: string
  tournamentId: string
  roundNumber: number
  status: 'pending' | 'active' | 'complete'
  matches?: Match[]
}

export interface Tournament {
  id: string
  name: string
  date: string
  rounds: number
  currentRound: number
  status: 'setup' | 'active' | 'complete'
  byePoints: number
  players?: Player[]
  roundsList?: Round[]
}

export interface TournamentSnapshot {
  tournament: Tournament
  players: Player[]
  rounds: Round[]
  matches: Match[]
}

export interface TournamentRevision {
  id: number
  tournamentId: string
  revisionNumber: number
  snapshot: TournamentSnapshot
  action: string
  createdAt: string
}

export interface Pairing {
  whitePlayer: Player
  blackPlayer: Player | null // null for bye
  boardNumber: number
}

export interface StandingsEntry {
  rank: number
  player: Player
  score: number
  buchholz: number
  wins: number
  draws: number
  losses: number
}
