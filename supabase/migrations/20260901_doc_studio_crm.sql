-- Studio Profile (single row)
CREATE TABLE IF NOT EXISTS studio_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'VizTR' NOT NULL,
  owner TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  upi_id TEXT,
  bank_details TEXT,
  gstin TEXT,
  paper_size TEXT DEFAULT 'A4' CHECK (paper_size IN ('A4', 'Letter')),
  show_logo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'ratecard','proposal','agreement','nda',
    'invoice','onboarding','release','casestudy'
  )),
  title TEXT,
  client_name TEXT,
  project_name TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','signed','archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_name);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  source TEXT,
  service TEXT DEFAULT 'Stills',
  stage TEXT DEFAULT 'lead' CHECK (stage IN (
    'lead','qualified','discovery','proposal','contract',
    'production','revisions','delivered','testimonial','upsell'
  )),
  quoted_price TEXT,
  advance_status TEXT DEFAULT 'Not requested',
  next_followup DATE,
  notes JSONB DEFAULT '[]',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);

-- Enable RLS
ALTER TABLE studio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins full access studio_profile" ON studio_profile
  FOR ALL USING (auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Admins full access documents" ON documents
  FOR ALL USING (auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Clients read own documents" ON documents
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'CLIENT' AND
    client_name = auth.jwt() ->> 'client_firm'
  );

CREATE POLICY "Admins full access leads" ON leads
  FOR ALL USING (auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Clients read assigned leads" ON leads
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'CLIENT' AND
    assigned_to = auth.uid()
  );

-- Insert default studio profile
INSERT INTO studio_profile (name, owner) VALUES ('VizTR', 'Rahul')
ON CONFLICT DO NOTHING;
