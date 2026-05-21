# Deploying Supabase migrations

Location: supabase/migrations/*.sql

Recommended steps (safe, manual):

1. Inspect SQL files in supabase/migrations and confirm changes.
2. Use the Supabase Dashboard SQL editor (safer) or psql to apply files:
   - Using psql: set DATABASE_URL or SUPABASE_DB_URL (your Supabase DB connection) and run:
     psql "$SUPABASE_DB_URL" -f supabase/migrations/20260519_pwlap_tables.sql
   - Repeat for other .sql files in chronological order.
3. Alternatively, install the Supabase CLI and link the project, then run the CLI migration command you prefer.

Notes:
- Do NOT commit or paste service_role keys or DB credentials into the repo.
- Applying migrations to production requires a service_role or DB admin credential; prefer running from CI or an admin machine.
- After applying, verify RLS policies and indexes were created.

Project ref (from supabase/config.toml): bqnyztfkpsvmvelfdzgw
