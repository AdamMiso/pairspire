import { pgTable, text, integer, boolean, timestamp, jsonb, serial, varchar, real } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, completed, archived
  playerCount: integer('player_count').notNull(),
  roundsTotal: integer('rounds_total').notNull().default(4),
  currentRound: integer('current_round').notNull().default(0),
  isPublic: boolean('is_public').notNull().default(true),
  adminTokenHash: varchar('admin_token_hash', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),
})

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  seedOrder: integer('seed_order'),
  hadBye: boolean('had_bye').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rounds = pgTable('rounds', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  roundNumber: integer('round_number').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, active, completed
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  roundId: integer('round_id').notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  whitePlayerId: integer('white_player_id').references(() => players.id, { onDelete: 'set null' }),
  blackPlayerId: integer('black_player_id').references(() => players.id, { onDelete: 'set null' }),
  result: varchar('result', { length: 10 }), // '1-0', '0-1', '0.5-0.5', 'bye', null
  tableIndex: integer('table_index').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tournamentRevisions = pgTable('tournament_revisions', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').notNull().references(() => tournaments.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  snapshotJson: jsonb('snapshot_json').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBySessionId: varchar('created_by_session_id', { length: 100 }),
})

// Relations
export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  players: many(players),
  rounds: many(rounds),
  matches: many(matches),
  revisions: many(tournamentRevisions),
}))

export const playersRelations = relations(players, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [players.tournamentId],
    references: [tournaments.id],
  }),
  whiteMatches: many(matches, { relationName: 'whitePlayer' }),
  blackMatches: many(matches, { relationName: 'blackPlayer' }),
}))

export const roundsRelations = relations(rounds, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [rounds.tournamentId],
    references: [tournaments.id],
  }),
  matches: many(matches),
}))

export const matchesRelations = relations(matches, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  round: one(rounds, {
    fields: [matches.roundId],
    references: [rounds.id],
  }),
  whitePlayer: one(players, {
    fields: [matches.whitePlayerId],
    references: [players.id],
    relationName: 'whitePlayer',
  }),
  blackPlayer: one(players, {
    fields: [matches.blackPlayerId],
    references: [players.id],
    relationName: 'blackPlayer',
  }),
}))

export const tournamentRevisionsRelations = relations(tournamentRevisions, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentRevisions.tournamentId],
    references: [tournaments.id],
  }),
}))

// Types
export type Tournament = typeof tournaments.$inferSelect
export type NewTournament = typeof tournaments.$inferInsert
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Round = typeof rounds.$inferSelect
export type NewRound = typeof rounds.$inferInsert
export type Match = typeof matches.$inferSelect
export type NewMatch = typeof matches.$inferInsert
export type TournamentRevision = typeof tournamentRevisions.$inferSelect
export type NewTournamentRevision = typeof tournamentRevisions.$inferInsert
