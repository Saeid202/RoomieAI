-- Create a table to store Seeker Digital Wallet Configuration
CREATE TABLE IF NOT EXISTS seeker_digital_wallet_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payment Method Preference
    payment_method_type VARCHAR(20) DEFAULT 'credit',
    
    -- Card Display Info (Stored only for UI persistence in this demo context)
    -- In a real production app with Stripe, we would rely on payment_methods table and Stripe ID.
    card_last4 VARCHAR(4),
    card_expiry VARCHAR(7), -- MM/YY
    card_brand VARCHAR(20),
    card_holder_name VARCHAR(100),
    
    -- Recipient (Landlord) Details
    recipient_email VARCHAR(255),
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('individual', 'business')),
    recipient_first_name VARCHAR(100),
    recipient_last_name VARCHAR(100),
    business_name VARCHAR(150),
    recipient_phone VARCHAR(50),
    
    -- Rent Amount
    rent_amount DECIMAL(10, 2),
    
    -- Meta
    is_configured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one config per user
    CONSTRAINT unique_user_wallet_config UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE seeker_digital_wallet_configs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wallet config" 
    ON seeker_digital_wallet_configs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own wallet config" 
    ON seeker_digital_wallet_configs FOR ALL 
    USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_seeker_digital_wallet_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seeker_digital_wallet_configs_updated_at
    BEFORE UPDATE ON seeker_digital_wallet_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_seeker_digital_wallet_configs_updated_at();
