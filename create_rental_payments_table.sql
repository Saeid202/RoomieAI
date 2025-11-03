-- =====================================================
-- Rental Payments Table Creation Script
-- =====================================================
-- This script creates tables for rental payment tracking
-- =====================================================

-- Drop table if it exists (for development/testing)
DROP TABLE IF EXISTS rental_payments;

-- Create the rental_payments table
CREATE TABLE rental_payments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction Details
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Foreign key references
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES rental_applications(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN (
        'first_month_rent', 'security_deposit', 'application_fee', 'combined_initial'
    )),
    
    -- Payment Method
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN (
        'credit_card', 'debit_card', 'bank_transfer', 'cash', 'check'
    )),
    
    -- Payment Status
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    )),
    
    -- Payment Processor Details (encrypted in production)
    processor_transaction_id VARCHAR(255),
    processor_name VARCHAR(50), -- stripe, paypal, square, etc.
    
    -- Card Information (last 4 digits only for security)
    card_last_four VARCHAR(4),
    card_type VARCHAR(20), -- visa, mastercard, amex, etc.
    
    -- Billing Information
    billing_address JSONB,
    
    -- Payment Dates
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Refund Information
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_date TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_payment_amount CHECK (amount > 0),
    CONSTRAINT valid_refund_amount CHECK (refund_amount >= 0 AND refund_amount <= amount)
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

-- Index on transaction_id for payment lookups
CREATE INDEX idx_rental_payments_transaction_id ON rental_payments(transaction_id);

-- Index on property_id for property payment history
CREATE INDEX idx_rental_payments_property_id ON rental_payments(property_id);

-- Index on application_id for application payment tracking
CREATE INDEX idx_rental_payments_application_id ON rental_payments(application_id);

-- Index on tenant_id for tenant payment history
CREATE INDEX idx_rental_payments_tenant_id ON rental_payments(tenant_id);

-- Index on landlord_id for landlord payment tracking
CREATE INDEX idx_rental_payments_landlord_id ON rental_payments(landlord_id);

-- Index on payment_status for filtering by status
CREATE INDEX idx_rental_payments_status ON rental_payments(payment_status);

-- Index on payment_date for chronological sorting
CREATE INDEX idx_rental_payments_date ON rental_payments(payment_date);

-- Composite index for landlord dashboard queries
CREATE INDEX idx_rental_payments_landlord_status ON rental_payments(landlord_id, payment_status);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can view their own payments
CREATE POLICY "Tenants can view own payments" ON rental_payments
    FOR SELECT USING (auth.uid() = tenant_id);

-- Policy: Landlords can view payments for their properties
CREATE POLICY "Landlords can view property payments" ON rental_payments
    FOR SELECT USING (auth.uid() = landlord_id);

-- Policy: Tenants can insert their own payments
CREATE POLICY "Tenants can create payments" ON rental_payments
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- Policy: System can update payment status (for payment processing)
CREATE POLICY "System can update payment status" ON rental_payments
    FOR UPDATE USING (
        auth.uid() = tenant_id OR auth.uid() = landlord_id
    );

-- =====================================================
-- Triggers for automatic timestamp updates
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_rental_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Set processed_at when status changes to completed
    IF OLD.payment_status != 'completed' AND NEW.payment_status = 'completed' THEN
        NEW.processed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
CREATE TRIGGER trigger_update_rental_payments_updated_at
    BEFORE UPDATE ON rental_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_payments_updated_at();

-- =====================================================
-- Views for payment reporting
-- =====================================================

-- View for landlord payment dashboard
CREATE VIEW landlord_payments_view AS
SELECT 
    rp.id as payment_id,
    rp.transaction_id,
    rp.amount,
    rp.currency,
    rp.description,
    rp.payment_type,
    rp.payment_status,
    rp.payment_date,
    rp.card_last_four,
    rp.card_type,
    p.listing_title,
    p.address as property_address,
    p.city as property_city,
    p.state as property_state,
    ra.full_name as tenant_name,
    ra.email as tenant_email
FROM rental_payments rp
JOIN properties p ON rp.property_id = p.id
JOIN rental_applications ra ON rp.application_id = ra.id
WHERE rp.landlord_id = auth.uid()
ORDER BY rp.payment_date DESC;

-- View for tenant payment history
CREATE VIEW tenant_payments_view AS
SELECT 
    rp.id as payment_id,
    rp.transaction_id,
    rp.amount,
    rp.currency,
    rp.description,
    rp.payment_type,
    rp.payment_status,
    rp.payment_date,
    rp.card_last_four,
    rp.card_type,
    p.listing_title,
    p.address as property_address,
    p.city as property_city,
    p.state as property_state
FROM rental_payments rp
JOIN properties p ON rp.property_id = p.id
WHERE rp.tenant_id = auth.uid()
ORDER BY rp.payment_date DESC;

-- =====================================================
-- Functions for payment processing
-- =====================================================

-- Function to create payment record
CREATE OR REPLACE FUNCTION create_rental_payment(
    p_transaction_id VARCHAR(255),
    p_property_id UUID,
    p_application_id UUID,
    p_tenant_id UUID,
    p_landlord_id UUID,
    p_amount DECIMAL(10,2),
    p_description TEXT,
    p_payment_type VARCHAR(50),
    p_payment_method VARCHAR(20),
    p_card_last_four VARCHAR(4) DEFAULT NULL,
    p_card_type VARCHAR(20) DEFAULT NULL,
    p_billing_address JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
BEGIN
    INSERT INTO rental_payments (
        transaction_id,
        property_id,
        application_id,
        tenant_id,
        landlord_id,
        amount,
        description,
        payment_type,
        payment_method,
        card_last_four,
        card_type,
        billing_address,
        payment_status
    ) VALUES (
        p_transaction_id,
        p_property_id,
        p_application_id,
        p_tenant_id,
        p_landlord_id,
        p_amount,
        p_description,
        p_payment_type,
        p_payment_method,
        p_card_last_four,
        p_card_type,
        p_billing_address,
        'completed'
    ) RETURNING id INTO v_payment_id;
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Rental payments setup completed successfully!
-- =====================================================
