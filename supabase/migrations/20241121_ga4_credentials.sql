-- GA4 Credentials Table for Super Admin Analytics
-- Run this in Supabase SQL Editor or via migration

CREATE TABLE IF NOT EXISTS ga4_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL,
  service_account_email TEXT NOT NULL,
  private_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active credentials lookup
CREATE INDEX IF NOT EXISTS idx_ga4_credentials_active ON ga4_credentials(is_active) WHERE is_active = true;

-- Only one active at a time (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS ux_ga4_credentials_one_active ON ga4_credentials(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE ga4_credentials ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "super_admin_full_access" ON ga4_credentials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id::text = auth.uid()::text AND role = 'super_admin' AND status = 'active'
    )
  );

-- Admins can read active credentials only
CREATE POLICY "admin_read_active" ON ga4_credentials
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id::text = auth.uid()::text AND role IN ('super_admin', 'admin') AND status = 'active'
    )
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ga4_credentials_updated_at
  BEFORE UPDATE ON ga4_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE ga4_credentials IS 'Stores GA4 service account credentials for Super Admin Analytics dashboard';
COMMENT ON COLUMN ga4_credentials.property_id IS 'GA4 Property ID (numeric, not G-XXXXXXXXXX measurement ID)';
COMMENT ON COLUMN ga4_credentials.service_account_email IS 'Google Cloud Service Account email';
COMMENT ON COLUMN ga4_credentials.private_key IS 'Service account private key in PEM format (encrypted at rest recommended)';
COMMENT ON COLUMN ga4_credentials.is_active IS 'Only one credential set can be active at a time';