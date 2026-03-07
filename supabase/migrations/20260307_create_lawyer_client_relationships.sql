-- Create lawyer_client_relationships table
CREATE TABLE IF NOT EXISTS lawyer_client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_type TEXT NOT NULL,
  case_description TEXT,
  status TEXT DEFAULT 'pending',
  consultation_date TIMESTAMPTZ,
  retainer_paid BOOLEAN DEFAULT false,
  retainer_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lawyer_id, client_id, case_type)
);

-- Enable RLS
ALTER TABLE lawyer_client_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Lawyers can view their clients"
  ON lawyer_client_relationships FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can view their lawyers"
  ON lawyer_client_relationships FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can manage relationships"
  ON lawyer_client_relationships FOR ALL
  USING (auth.uid() = lawyer_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_client_relationships_lawyer_id ON lawyer_client_relationships(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_client_relationships_client_id ON lawyer_client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_client_relationships_status ON lawyer_client_relationships(status);
