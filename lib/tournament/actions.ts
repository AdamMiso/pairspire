'use server'

import { sql } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { Tournament, Player, Round, Match, TournamentSnapshot } from './types'
import { generateSwissPairings, calculateStandings } from './swiss-pairing'

function isMissingColumnError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { code?: string; message?: string }
  return err.code === '42703' && typeof err.message === 'string' && err.message.includes(`"${columnName}"`)
}

// Helper to create a snapshot
async function createSnapshot(tournamentId: string): Promise<TournamentSnapshot> {
  const [tournament] = await sql`SELECT * FROM tournaments WHERE id = ${tournamentId}`
  const players = await sql`SELECT * FROM players WHERE tournament_id = ${tournamentId}`
  const rounds = await sql`SELECT * FROM rounds WHERE tournament_id = ${tournamentId} ORDER BY round_number`
  const matches = await sql`SELECT * FROM matches WHERE tournament_id = ${tournamentId}`
  
  return {
    tournament: mapTournament(tournament),
    players: players.map(mapPlayer),
    rounds: rounds.map(mapRound),
    matches: matches.map(mapMatch)
  }
}

// Save a revision
async function saveRevision(tournamentId: string, action: string): Promise<void> {
  const snapshot = await createSnapshot(tournamentId)
  
  const [lastRevision] = await sql`
    SELECT revision_number FROM tournament_revisions 
    WHERE tournament_id = ${tournamentId} 
    ORDER BY revision_number DESC 
    LIMIT 1
  `
  
  const nextRevision = (lastRevision?.revision_number ?? 0) + 1
  
  await sql`
    INSERT INTO tournament_revisions (tournament_id, revision_number, snapshot, action)
    VALUES (${tournamentId}, ${nextRevision}, ${JSON.stringify(snapshot)}, ${action})
  `
}

// Map database row to types
function mapTournament(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    date: row.date as string,
    rounds: row.rounds as number,
    currentRound: row.current_round as number,
    status: row.status as Tournament['status'],
    byePoints: row.bye_points as number
  }
}

function mapPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    name: row.name as string,
    rating: row.rating as number | null,
    seedOrder: row.seed_order as number | undefined,
    score: row.score as number,
    buchholz: row.buchholz as number,
    wins: row.wins as number,
    losses: row.losses as number,
    draws: row.draws as number,
    hasHadBye: row.has_had_bye as boolean,
    isActive: row.is_active as boolean
  }
}

function mapRound(row: Record<string, unknown>): Round {
  return {
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    roundNumber: row.round_number as number,
    status: row.status as Round['status']
  }
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: row.id as string,
    roundId: row.round_id as string,
    tournamentId: row.tournament_id as string,
    whitePlayerId: row.white_player_id as string | null,
    blackPlayerId: row.black_player_id as string | null,
    result: row.result as Match['result'],
    boardNumber: row.board_number as number,
    isBye: row.is_bye as boolean
  }
}

// Tournament CRUD
export async function createTournament(data: {
  name: string
  date: string
  rounds: number
  byePoints?: number
  players?: string[]
  randomizeSeeding?: boolean
}): Promise<Tournament> {
  const id = nanoid(10)

  const playerCount = data.players?.length ?? 0

  try {
    await sql`
      INSERT INTO tournaments (id, name, date, rounds, bye_points, player_count)
      VALUES (${id}, ${data.name}, ${data.date}, ${data.rounds}, ${data.byePoints ?? 1.0}, ${playerCount})
    `
  } catch (error) {
    if (!isMissingColumnError(error, 'player_count')) {
      throw error
    }

    await sql`
      INSERT INTO tournaments (id, name, date, rounds, bye_points)
      VALUES (${id}, ${data.name}, ${data.date}, ${data.rounds}, ${data.byePoints ?? 1.0})
    `
  }

  if (data.players && data.players.length > 0) {
    let finalPlayers = [...data.players]
    if (data.randomizeSeeding) {
      // Fisher-Yates shuffle
      for (let i = finalPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[finalPlayers[i], finalPlayers[j]] = [finalPlayers[j], finalPlayers[i]]
      }
    }

    for (let i = 0; i < finalPlayers.length; i++) {
      const playerId = nanoid(10)
      const seedOrder = i + 1
      try {
        await sql`
          INSERT INTO players (id, tournament_id, name, rating, seed_order)
          VALUES (${playerId}, ${id}, ${finalPlayers[i]}, null, ${seedOrder})
        `
      } catch (error) {
        if (!isMissingColumnError(error, 'seed_order')) {
          throw error
        }

        await sql`
          INSERT INTO players (id, tournament_id, name, rating)
          VALUES (${playerId}, ${id}, ${finalPlayers[i]}, null)
        `
      }
    }
  }
  
  const [tournament] = await sql`SELECT * FROM tournaments WHERE id = ${id}`
  await saveRevision(id, 'Vytvorený turnaj')
  
  return mapTournament(tournament)
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const [tournament] = await sql`SELECT * FROM tournaments WHERE id = ${id}`
  if (!tournament) return null
  
  const players = await sql`SELECT * FROM players WHERE tournament_id = ${id} ORDER BY score DESC`
  const rounds = await sql`SELECT * FROM rounds WHERE tournament_id = ${id} ORDER BY round_number`
  
  return {
    ...mapTournament(tournament),
    players: players.map(mapPlayer),
    roundsList: rounds.map(mapRound)
  }
}

export async function listTournaments(): Promise<Tournament[]> {
  const tournaments = await sql`SELECT * FROM tournaments ORDER BY created_at DESC`
  return tournaments.map(mapTournament)
}

export async function updateTournament(
  id: string, 
  data: Partial<Pick<Tournament, 'name' | 'date' | 'rounds' | 'byePoints'>>
): Promise<Tournament> {
  const updates: string[] = []
  const values: unknown[] = []
  
  if (data.name !== undefined) {
    updates.push('name = $' + (values.length + 2))
    values.push(data.name)
  }
  if (data.date !== undefined) {
    updates.push('date = $' + (values.length + 2))
    values.push(data.date)
  }
  if (data.rounds !== undefined) {
    updates.push('rounds = $' + (values.length + 2))
    values.push(data.rounds)
  }
  if (data.byePoints !== undefined) {
    updates.push('bye_points = $' + (values.length + 2))
    values.push(data.byePoints)
  }
  
  if (updates.length > 0) {
    await sql`
      UPDATE tournaments 
      SET name = COALESCE(${data.name}, name),
          date = COALESCE(${data.date}, date),
          rounds = COALESCE(${data.rounds}, rounds),
          bye_points = COALESCE(${data.byePoints}, bye_points),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
  }
  
  const tournament = await getTournament(id)
  if (!tournament) throw new Error('Turnaj sa nenašiel')
  
  await saveRevision(id, 'Aktualizované nastavenia turnaja')
  return tournament
}

export async function deleteTournament(id: string): Promise<void> {
  await sql`DELETE FROM tournaments WHERE id = ${id}`
}

// Player CRUD
export async function addPlayer(tournamentId: string, data: {
  name: string
  rating?: number
}): Promise<Player> {
  const id = nanoid(10)
  
  await sql`
    INSERT INTO players (id, tournament_id, name, rating)
    VALUES (${id}, ${tournamentId}, ${data.name}, ${data.rating ?? null})
  `
  
  const [player] = await sql`SELECT * FROM players WHERE id = ${id}`
  await saveRevision(tournamentId, `Pridaný hráč: ${data.name}`)
  
  return mapPlayer(player)
}

export async function updatePlayer(
  id: string, 
  data: Partial<Pick<Player, 'name' | 'rating' | 'isActive'>>
): Promise<Player> {
  const [existing] = await sql`SELECT * FROM players WHERE id = ${id}`
  if (!existing) throw new Error('Hráč sa nenašiel')
  
  await sql`
    UPDATE players 
    SET name = COALESCE(${data.name}, name),
        rating = COALESCE(${data.rating}, rating),
        is_active = COALESCE(${data.isActive}, is_active)
    WHERE id = ${id}
  `
  
  const [player] = await sql`SELECT * FROM players WHERE id = ${id}`
  await saveRevision(player.tournament_id as string, `Aktualizovaný hráč: ${player.name}`)
  
  return mapPlayer(player)
}

export async function removePlayer(id: string): Promise<void> {
  const [player] = await sql`SELECT * FROM players WHERE id = ${id}`
  if (!player) throw new Error('Hráč sa nenašiel')
  
  await sql`DELETE FROM players WHERE id = ${id}`
  await saveRevision(player.tournament_id as string, `Odstránený hráč: ${player.name}`)
}

export async function getPlayers(tournamentId: string): Promise<Player[]> {
  const players = await sql`SELECT * FROM players WHERE tournament_id = ${tournamentId}`
  return players.map(mapPlayer)
}

// Round management
export async function startNextRound(tournamentId: string): Promise<Round> {
  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Turnaj sa nenašiel')
  
  if (tournament.currentRound >= tournament.rounds) {
    throw new Error('Všetky kolá už boli ukončené')
  }
  
  const players = await getPlayers(tournamentId)
  if (players.filter(p => p.isActive).length < 2) {
    throw new Error('Na spustenie kola sú potrební aspoň 2 aktívni hráči')
  }
  
  // Get all past matches for pairing
  const pastMatches = await sql`SELECT * FROM matches WHERE tournament_id = ${tournamentId}`
  
  const nextRoundNumber = tournament.currentRound + 1
  const roundId = nanoid(10)
  
  // Create the round
  await sql`
    INSERT INTO rounds (id, tournament_id, round_number, status)
    VALUES (${roundId}, ${tournamentId}, ${nextRoundNumber}, 'active')
  `
  
  // Generate pairings
  const pairings = generateSwissPairings({
    players,
    pastMatches: pastMatches.map(mapMatch),
    roundNumber: nextRoundNumber
  })
  
  // Create matches
  for (const pairing of pairings) {
    const matchId = nanoid(10)
    const isBye = pairing.blackPlayer === null
    
    await sql`
      INSERT INTO matches (id, round_id, tournament_id, white_player_id, black_player_id, result, board_number, is_bye)
      VALUES (
        ${matchId}, 
        ${roundId}, 
        ${tournamentId}, 
        ${pairing.whitePlayer.id}, 
        ${pairing.blackPlayer?.id ?? null}, 
        ${isBye ? 'bye' : 'pending'},
        ${pairing.boardNumber},
        ${isBye}
      )
    `
    
    // If bye, update player
    if (isBye) {
      await sql`
        UPDATE players 
        SET has_had_bye = true, 
            score = score + ${tournament.byePoints}
        WHERE id = ${pairing.whitePlayer.id}
      `
    }
  }
  
  // Update tournament
  await sql`
    UPDATE tournaments 
    SET current_round = ${nextRoundNumber}, 
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${tournamentId}
  `
  
  const [round] = await sql`SELECT * FROM rounds WHERE id = ${roundId}`
  await saveRevision(tournamentId, `Spustené kolo ${nextRoundNumber}`)
  
  return mapRound(round)
}

export async function getRound(roundId: string): Promise<Round | null> {
  const [round] = await sql`SELECT * FROM rounds WHERE id = ${roundId}`
  if (!round) return null
  
  const matches = await sql`SELECT * FROM matches WHERE round_id = ${roundId} ORDER BY board_number`
  
  return {
    ...mapRound(round),
    matches: matches.map(mapMatch)
  }
}

export async function getRoundByNumber(tournamentId: string, roundNumber: number): Promise<Round | null> {
  const [round] = await sql`
    SELECT * FROM rounds 
    WHERE tournament_id = ${tournamentId} AND round_number = ${roundNumber}
  `
  if (!round) return null
  
  const matches = await sql`SELECT * FROM matches WHERE round_id = ${round.id} ORDER BY board_number`
  
  return {
    ...mapRound(round),
    matches: matches.map(mapMatch)
  }
}

// Match result recording
export async function recordMatchResult(
  matchId: string, 
  result: 'white' | 'black' | 'draw'
): Promise<Match> {
  const [match] = await sql`SELECT * FROM matches WHERE id = ${matchId}`
  if (!match) throw new Error('Partia sa nenašla')
  if (match.is_bye) throw new Error('Pre partiu s voľnom nie je možné zapísať výsledok')
  
  const whiteId = match.white_player_id as string
  const blackId = match.black_player_id as string
  
  // Update match result
  await sql`UPDATE matches SET result = ${result} WHERE id = ${matchId}`
  
  // Update player scores
  if (result === 'white') {
    await sql`UPDATE players SET score = score + 1, wins = wins + 1 WHERE id = ${whiteId}`
    await sql`UPDATE players SET losses = losses + 1 WHERE id = ${blackId}`
  } else if (result === 'black') {
    await sql`UPDATE players SET score = score + 1, wins = wins + 1 WHERE id = ${blackId}`
    await sql`UPDATE players SET losses = losses + 1 WHERE id = ${whiteId}`
  } else {
    await sql`UPDATE players SET score = score + 0.5, draws = draws + 1 WHERE id = ${whiteId}`
    await sql`UPDATE players SET score = score + 0.5, draws = draws + 1 WHERE id = ${blackId}`
  }
  
  const [updated] = await sql`SELECT * FROM matches WHERE id = ${matchId}`
  await saveRevision(match.tournament_id as string, `Zapísaný výsledok na šachovnici ${match.board_number}`)
  
  // Check if round is complete
  const [incomplete] = await sql`
    SELECT COUNT(*) as count FROM matches 
    WHERE round_id = ${match.round_id} AND result = 'pending'
  `
  
  if (Number(incomplete.count) === 0) {
    await completeRound(match.round_id as string)
  }
  
  return mapMatch(updated)
}

async function completeRound(roundId: string): Promise<void> {
  const [round] = await sql`SELECT * FROM rounds WHERE id = ${roundId}`
  if (!round) return
  
  await sql`UPDATE rounds SET status = 'complete' WHERE id = ${roundId}`
  
  // Update Buchholz scores
  const players = await getPlayers(round.tournament_id as string)
  const matches = await sql`SELECT * FROM matches WHERE tournament_id = ${round.tournament_id}`
  
  const standings = calculateStandings(players, matches.map(mapMatch))
  
  for (const player of standings) {
    await sql`UPDATE players SET buchholz = ${player.buchholz} WHERE id = ${player.id}`
  }
  
  // Check if tournament is complete
  const [tournament] = await sql`SELECT * FROM tournaments WHERE id = ${round.tournament_id}`
  if (tournament && tournament.current_round >= tournament.rounds) {
    await sql`UPDATE tournaments SET status = 'complete' WHERE id = ${tournament.id}`
    await saveRevision(tournament.id as string, 'Turnaj ukončený')
  } else {
    await saveRevision(round.tournament_id as string, `Ukončené kolo ${round.round_number}`)
  }
}

// Get standings
export async function getStandings(tournamentId: string): Promise<Player[]> {
  const players = await getPlayers(tournamentId)
  const matches = await sql`SELECT * FROM matches WHERE tournament_id = ${tournamentId}`
  
  return calculateStandings(players, matches.map(mapMatch))
}

// Revision management
export async function getRevisions(tournamentId: string): Promise<{
  id: number
  revisionNumber: number
  action: string
  createdAt: string
}[]> {
  const revisions = await sql`
    SELECT id, revision_number, action, created_at 
    FROM tournament_revisions 
    WHERE tournament_id = ${tournamentId} 
    ORDER BY revision_number DESC
  `
  
  return revisions.map(r => ({
    id: r.id as number,
    revisionNumber: r.revision_number as number,
    action: r.action as string,
    createdAt: r.created_at as string
  }))
}

export async function restoreRevision(tournamentId: string, revisionNumber: number): Promise<void> {
  const [revision] = await sql`
    SELECT * FROM tournament_revisions 
    WHERE tournament_id = ${tournamentId} AND revision_number = ${revisionNumber}
  `
  
  if (!revision) throw new Error('Revízia sa nenašla')
  
  const snapshot = revision.snapshot as TournamentSnapshot
  
  // Delete current data
  await sql`DELETE FROM matches WHERE tournament_id = ${tournamentId}`
  await sql`DELETE FROM rounds WHERE tournament_id = ${tournamentId}`
  await sql`DELETE FROM players WHERE tournament_id = ${tournamentId}`
  
  // Restore tournament
  await sql`
    UPDATE tournaments 
    SET name = ${snapshot.tournament.name},
        date = ${snapshot.tournament.date},
        rounds = ${snapshot.tournament.rounds},
        current_round = ${snapshot.tournament.currentRound},
        status = ${snapshot.tournament.status},
        bye_points = ${snapshot.tournament.byePoints},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${tournamentId}
  `
  
  // Restore players
  for (const player of snapshot.players) {
    await sql`
      INSERT INTO players (id, tournament_id, name, rating, score, buchholz, wins, losses, draws, has_had_bye, is_active)
      VALUES (${player.id}, ${tournamentId}, ${player.name}, ${player.rating}, ${player.score}, 
              ${player.buchholz}, ${player.wins}, ${player.losses}, ${player.draws}, 
              ${player.hasHadBye}, ${player.isActive})
    `
  }
  
  // Restore rounds
  for (const round of snapshot.rounds) {
    await sql`
      INSERT INTO rounds (id, tournament_id, round_number, status)
      VALUES (${round.id}, ${tournamentId}, ${round.roundNumber}, ${round.status})
    `
  }
  
  // Restore matches
  for (const match of snapshot.matches) {
    await sql`
      INSERT INTO matches (id, round_id, tournament_id, white_player_id, black_player_id, result, board_number, is_bye)
      VALUES (${match.id}, ${match.roundId}, ${tournamentId}, ${match.whitePlayerId}, 
              ${match.blackPlayerId}, ${match.result}, ${match.boardNumber}, ${match.isBye})
    `
  }
  
  await saveRevision(tournamentId, `Obnovené na revíziu ${revisionNumber}`)
}

// Get all matches for a tournament
export async function getMatches(tournamentId: string): Promise<Match[]> {
  const matches = await sql`SELECT * FROM matches WHERE tournament_id = ${tournamentId} ORDER BY board_number`
  return matches.map(mapMatch)
}
