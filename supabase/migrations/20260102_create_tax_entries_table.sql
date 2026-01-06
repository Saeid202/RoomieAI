-- Create tax_entries table for Tax Intelligence module
-- This table stores income and expense entries for tax calculation purposes

CREATE TABLE IF NOT EXISTS tax_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Entry details
    entry_date DATE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('operator', 'renovator')),
    province VARCHAR(50) NOT NULL DEFAULT 'Ontario',
    
    -- Income fields
    rent DECIMAL(12, 2) NOT NULL DEFAULT 0,
    other_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Expense fields
    renovation DECIMAL(12, 2) NOT NULL DEFAULT 0,
    other_expense DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Computed fields (stored for quick access/reporting)
    total_income DECIMAL(12, 2) GENERATED ALWAYS AS (rent + other_income) STORED,
    total_expense DECIMAL(12, 2) GENERATED ALWAYS AS (renovation + other_expense) STORED,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS ((rent + other_income) - (renovation + other_expense)) STORED,
    
    -- Optional notes for AI context
    income_notes TEXT,
    expense_notes TEXT,
    renovation_classification VARCHAR(30) CHECK (renovation_classification IN ('repair', 'capital_improvement', 'unknown')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_tax_entries_user_id ON tax_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_entries_user_date ON tax_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_tax_entries_entry_date ON tax_entries(entry_date);

-- Unique constraint: one entry per user per date
CREATE UNIQUE INDEX IF NOT EXISTS idx_tax_entries_unique_user_date ON tax_entries(user_id, entry_date);

-- Enable Row Level Security
ALTER TABLE tax_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own tax entries
CREATE POLICY "Users can view own tax entries"
    ON tax_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own tax entries
CREATE POLICY "Users can insert own tax entries"
    ON tax_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own tax entries
CREATE POLICY "Users can update own tax entries"
    ON tax_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tax entries
CREATE POLICY "Users can delete own tax entries"
    ON tax_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_tax_entries_updated_at ON tax_entries;
CREATE TRIGGER update_tax_entries_updated_at
    BEFORE UPDATE ON tax_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE tax_entries IS 'Stores daily income and expense entries for Tax Intelligence module';
COMMENT ON COLUMN tax_entries.role IS 'User role: operator (landlord/realtor) or renovator';
COMMENT ON COLUMN tax_entries.province IS 'Canadian province for tax rate calculation';
COMMENT ON COLUMN tax_entries.rent IS 'Rental income amount';
COMMENT ON COLUMN tax_entries.other_income IS 'Commission, fees, or other income';
COMMENT ON COLUMN tax_entries.renovation IS 'Renovation/repair expenses';
COMMENT ON COLUMN tax_entries.other_expense IS 'Utilities, marketing, software, professional fees, etc.';
COMMENT ON COLUMN tax_entries.renovation_classification IS 'AI-assisted classification: repair (fully deductible) or capital_improvement (depreciated)';

-- Grant permissions
GRANT ALL ON tax_entries TO authenticated;
GRANT ALL ON tax_entries TO service_role;
