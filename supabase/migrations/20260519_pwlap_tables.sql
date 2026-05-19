-- Create user_signing_keys table for Ed25519 public keys
CREATE TABLE IF NOT EXISTS user_signing_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  private_key TEXT, -- Base64 encoded; only store client-side in practice
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Create pwlap_imports audit trail
CREATE TABLE IF NOT EXISTS pwlap_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES telemetry_sessions(id) ON DELETE SET NULL,
  filename TEXT,
  granularity TEXT CHECK (granularity IN ('metadata', 'setup', 'full')),
  imported_from_user_id UUID REFERENCES auth.users(id),
  encrypted BOOLEAN DEFAULT false,
  signed BOOLEAN DEFAULT false,
  file_hash TEXT, -- SHA-256 hash of the .pwlap file
  file_size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

-- Create pwlap_exports for tracking downloads
CREATE TABLE IF NOT EXISTS pwlap_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES telemetry_sessions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  granularity TEXT CHECK (granularity IN ('metadata', 'setup', 'full')),
  encrypted BOOLEAN DEFAULT false,
  signed BOOLEAN DEFAULT false,
  file_size_bytes INTEGER,
  storage_path TEXT,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_signing_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwlap_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwlap_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_signing_keys
CREATE POLICY "Users can view their own signing key"
  ON user_signing_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signing key"
  ON user_signing_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signing key"
  ON user_signing_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for pwlap_imports
CREATE POLICY "Users can view their own imports"
  ON pwlap_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports"
  ON pwlap_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pwlap_exports
CREATE POLICY "Users can view their own exports"
  ON pwlap_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports"
  ON pwlap_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports"
  ON pwlap_exports FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_signing_keys_user_id ON user_signing_keys(user_id);
CREATE INDEX idx_pwlap_imports_user_id ON pwlap_imports(user_id);
CREATE INDEX idx_pwlap_imports_session_id ON pwlap_imports(session_id);
CREATE INDEX idx_pwlap_imports_created_at ON pwlap_imports(created_at DESC);
CREATE INDEX idx_pwlap_exports_user_id ON pwlap_exports(user_id);
CREATE INDEX idx_pwlap_exports_session_id ON pwlap_exports(session_id);
CREATE INDEX idx_pwlap_exports_created_at ON pwlap_exports(created_at DESC);

-- Create pgcrypto extension for hash functions (if not exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
