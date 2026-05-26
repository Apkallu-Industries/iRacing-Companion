-- ============================================================
-- Migration: Multi-Driver Team Sessions
-- Creates team_sessions table for the Team Command relay system.
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_code   text        UNIQUE NOT NULL,
  race_name   text        NOT NULL DEFAULT 'Race Session',
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '48 hours')
);

-- Index for fast lookup by team code (used on every bridge publish)
CREATE INDEX IF NOT EXISTS team_sessions_code_idx ON public.team_sessions (team_code);

-- Auto-expire: sessions older than expires_at are invisible
-- (a cron job or Edge Function can DELETE them, but SELECT filtering is enough)

-- Row Level Security
ALTER TABLE public.team_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read a team session (needed for bridge status check)
CREATE POLICY "team_sessions_read_all"
  ON public.team_sessions
  FOR SELECT
  USING (true);

-- Only the creator can update/delete their session
CREATE POLICY "team_sessions_owner_write"
  ON public.team_sessions
  FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Anon users can create sessions (for drivers without accounts)
CREATE POLICY "team_sessions_insert_anon"
  ON public.team_sessions
  FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for this table (for future live session state sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_sessions;
