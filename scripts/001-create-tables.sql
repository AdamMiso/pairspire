-- FooCheBeer Database Schema
-- Chess Tournament Tracking App

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  player_count INTEGER NOT NULL,
  rounds_total INTEGER NOT NULL DEFAULT 4,
  current_round INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  admin_token_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  seed_order INTEGER,
  had_bye BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  white_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  black_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  result VARCHAR(10),
  table_index INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tournament revisions table for history/recovery
CREATE TABLE IF NOT EXISTS tournament_revisions (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by_session_id VARCHAR(100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_last_activity ON tournaments(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_revisions_tournament ON tournament_revisions(tournament_id);
