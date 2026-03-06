import type { Player, Pairing, Match } from './types'

/**
 * Swiss-system pairing algorithm implementation
 * Rules:
 * 1. Players with the same score are paired together when possible
 * 2. Players cannot face the same opponent twice
 * 3. Color allocation should be balanced
 * 4. If odd number of players, lowest-scoring player who hasn't had a bye gets one
 */

interface PairingContext {
  players: Player[]
  pastMatches: Match[]
  roundNumber: number
}

// Get all opponents a player has faced
function getOpponents(playerId: string, matches: Match[]): Set<string> {
  const opponents = new Set<string>()
  for (const match of matches) {
    if (match.whitePlayerId === playerId && match.blackPlayerId) {
      opponents.add(match.blackPlayerId)
    } else if (match.blackPlayerId === playerId && match.whitePlayerId) {
      opponents.add(match.whitePlayerId)
    }
  }
  return opponents
}

// Get color history for a player
function getColorHistory(playerId: string, matches: Match[]): ('white' | 'black')[] {
  const history: ('white' | 'black')[] = []
  for (const match of matches) {
    if (match.isBye) continue
    if (match.whitePlayerId === playerId) {
      history.push('white')
    } else if (match.blackPlayerId === playerId) {
      history.push('black')
    }
  }
  return history
}

// Count color occurrences
function countColors(history: ('white' | 'black')[]): { white: number; black: number } {
  return history.reduce(
    (acc, color) => {
      acc[color]++
      return acc
    },
    { white: 0, black: 0 }
  )
}

// Determine preferred color for a player
function getPreferredColor(history: ('white' | 'black')[]): 'white' | 'black' | null {
  const counts = countColors(history)
  if (counts.white > counts.black) return 'black'
  if (counts.black > counts.white) return 'white'
  // If equal, prefer opposite of last color
  if (history.length > 0) {
    return history[history.length - 1] === 'white' ? 'black' : 'white'
  }
  return null
}

// Assign colors to a pair
function assignColors(
  player1: Player,
  player2: Player,
  matches: Match[]
): { white: Player; black: Player } {
  const history1 = getColorHistory(player1.id, matches)
  const history2 = getColorHistory(player2.id, matches)
  
  const pref1 = getPreferredColor(history1)
  const pref2 = getPreferredColor(history2)
  
  // If both have the same preference or no preference, use rating
  if (pref1 === pref2 || (pref1 === null && pref2 === null)) {
    // Higher rated player gets white (or random if no preference)
    const rating1 = player1.rating ?? 0
    const rating2 = player2.rating ?? 0
    if (rating1 >= rating2) {
      return { white: player1, black: player2 }
    }
    return { white: player2, black: player1 }
  }
  
  // If one has a preference, give them their preference
  if (pref1 === 'white' || pref2 === 'black') {
    return { white: player1, black: player2 }
  }
  return { white: player2, black: player1 }
}

// Group players by score
function groupByScore(players: Player[]): Map<number, Player[]> {
  const groups = new Map<number, Player[]>()
  for (const player of players) {
    const score = player.score
    if (!groups.has(score)) {
      groups.set(score, [])
    }
    groups.get(score)!.push(player)
  }
  return groups
}

// Try to pair players within a score group
function pairScoreGroup(
  players: Player[],
  matches: Match[],
  usedPlayers: Set<string>
): Pairing[] {
  const pairings: Pairing[] = []
  const available = players.filter(p => !usedPlayers.has(p.id))
  
  // Sort by rating (higher first) for better pairings
  available.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  
  for (let i = 0; i < available.length; i++) {
    const player1 = available[i]
    if (usedPlayers.has(player1.id)) continue
    
    const opponents = getOpponents(player1.id, matches)
    
    // Find best available opponent
    for (let j = i + 1; j < available.length; j++) {
      const player2 = available[j]
      if (usedPlayers.has(player2.id)) continue
      if (opponents.has(player2.id)) continue
      
      // Found a valid pairing
      const { white, black } = assignColors(player1, player2, matches)
      pairings.push({
        whitePlayer: white,
        blackPlayer: black,
        boardNumber: pairings.length + 1
      })
      usedPlayers.add(player1.id)
      usedPlayers.add(player2.id)
      break
    }
  }
  
  return pairings
}

// Find bye player (lowest score who hasn't had bye)
function findByePlayer(players: Player[], usedPlayers: Set<string>): Player | null {
  const available = players
    .filter(p => !usedPlayers.has(p.id) && !p.hasHadBye && p.isActive)
    .sort((a, b) => a.score - b.score)
  
  if (available.length > 0) {
    return available[0]
  }
  
  // If everyone has had a bye, pick lowest score unused player
  const fallback = players
    .filter(p => !usedPlayers.has(p.id) && p.isActive)
    .sort((a, b) => a.score - b.score)
  
  return fallback[0] || null
}

export function generateSwissPairings(context: PairingContext): Pairing[] {
  const { players, pastMatches } = context
  
  // Filter active players
  const activePlayers = players.filter(p => p.isActive)
  
  if (activePlayers.length < 2) {
    // If only 1 player, they get a bye
    if (activePlayers.length === 1) {
      return [{
        whitePlayer: activePlayers[0],
        blackPlayer: null,
        boardNumber: 1
      }]
    }
    return []
  }
  
  const pairings: Pairing[] = []
  const usedPlayers = new Set<string>()
  
  // Handle bye first if odd number of players
  if (activePlayers.length % 2 === 1) {
    const byePlayer = findByePlayer(activePlayers, usedPlayers)
    if (byePlayer) {
      usedPlayers.add(byePlayer.id)
      // Bye will be added at the end
    }
  }
  
  // Group players by score (descending)
  const scoreGroups = groupByScore(activePlayers.filter(p => !usedPlayers.has(p.id)))
  const scores = Array.from(scoreGroups.keys()).sort((a, b) => b - a)
  
  // Track unpaired players from previous groups
  let floaters: Player[] = []
  
  for (const score of scores) {
    const group = [...floaters, ...(scoreGroups.get(score) || [])]
    floaters = []
    
    const groupPairings = pairScoreGroup(group, pastMatches, usedPlayers)
    
    // Renumber board numbers
    for (const pairing of groupPairings) {
      pairing.boardNumber = pairings.length + 1
      pairings.push(pairing)
    }
    
    // Collect unpaired players as floaters
    for (const player of group) {
      if (!usedPlayers.has(player.id)) {
        floaters.push(player)
      }
    }
  }
  
  // Try to pair remaining floaters with each other (across score groups)
  if (floaters.length >= 2) {
    const floaterPairings = pairScoreGroup(floaters, pastMatches, usedPlayers)
    for (const pairing of floaterPairings) {
      pairing.boardNumber = pairings.length + 1
      pairings.push(pairing)
    }
  }
  
  // Add bye at the end
  const byePlayer = activePlayers.find(p => !usedPlayers.has(p.id) && !p.hasHadBye)
    || activePlayers.find(p => !usedPlayers.has(p.id))
  
  if (byePlayer) {
    pairings.push({
      whitePlayer: byePlayer,
      blackPlayer: null,
      boardNumber: pairings.length + 1
    })
  }
  
  return pairings
}

// Calculate Buchholz score (sum of opponents' scores)
export function calculateBuchholz(
  playerId: string,
  players: Player[],
  matches: Match[]
): number {
  const opponents = getOpponents(playerId, matches)
  let buchholz = 0
  
  for (const oppId of opponents) {
    const opponent = players.find(p => p.id === oppId)
    if (opponent) {
      buchholz += opponent.score
    }
  }
  
  return buchholz
}

// Calculate standings with tiebreakers
export function calculateStandings(players: Player[], matches: Match[]): Player[] {
  // Update Buchholz for all players
  const playersWithBuchholz = players.map(p => ({
    ...p,
    buchholz: calculateBuchholz(p.id, players, matches)
  }))
  
  // Sort by: 1. Score (desc), 2. Buchholz (desc), 3. Wins (desc), 4. Rating (desc)
  return playersWithBuchholz.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz
    if (b.wins !== a.wins) return b.wins - a.wins
    return (b.rating ?? 0) - (a.rating ?? 0)
  })
}
