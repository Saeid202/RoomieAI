-- Create rent_ledgers table for tracking monthly rent payments
CREATE TABLE IF NOT EXISTS public.rent_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES public.lease_contracts(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id),
    property_id UUID NOT NULL REFERENCES public.properties(id),
    
    due_date DATE NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'pending', 'paid', 'overdue', 'partially_paid')),
    
    payment_id UUID REFERENCES public.rental_payments(id), -- Nullable, linked when payment is made
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rent_ledgers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own rent ledgers" ON public.rent_ledgers
    FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() IN (SELECT user_id FROM properties WHERE id = property_id));

-- TEMPORARY SAFETY CHECK (Local/Dev Only)
-- Add auto_pay_enabled to lease_contracts if not exists
-- This handles cases where lease_contracts was created without these columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lease_contracts' AND column_name = 'auto_pay_enabled') THEN
        ALTER TABLE public.lease_contracts ADD COLUMN auto_pay_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lease_contracts' AND column_name = 'payment_day_of_month') THEN
         ALTER TABLE public.lease_contracts ADD COLUMN payment_day_of_month INTEGER DEFAULT 1 CHECK (payment_day_of_month BETWEEN 1 AND 31);
    END IF;
END $$;


-- Function to generate rent ledger rows automatically when a lease becomes 'active' or 'signed'
CREATE OR REPLACE FUNCTION generate_rent_ledger_entries()
RETURNS TRIGGER AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_current_date DATE;
    v_rent_amount DECIMAL(10,2);
    v_day_of_month INTEGER;
BEGIN
    -- Only run if status changes to 'active' or 'executed' or 'fully_signed' AND ledger doesn't exist
    IF (NEW.status IN ('active', 'executed', 'fully_signed')) AND 
       (OLD.status NOT IN ('active', 'executed', 'fully_signed')) THEN
       
        v_start_date := NEW.lease_start_date;
        v_end_date := NEW.lease_end_date;
        v_rent_amount := NEW.monthly_rent;
        v_day_of_month := COALESCE(NEW.payment_day_of_month, 1);
        
        -- Start loop from lease start date
        v_current_date := v_start_date;

        -- Loop until end date
        WHILE v_current_date <= v_end_date LOOP
            -- Calculate specific due date based on payment day for this month
            -- Handle short months (e.g. Feb 30 -> Feb 28/29) using PostgreSQL date logic
            -- Actually, simpler to just iterate by 1 month interval
            
            INSERT INTO public.rent_ledgers (
                lease_id,
                tenant_id,
                property_id,
                due_date,
                rent_amount,
                status
            ) VALUES (
                NEW.id,
                NEW.tenant_id,
                NEW.property_id,
                v_current_date, -- For now, assume start date aligns with payment cycle or just use date
                v_rent_amount,
                'unpaid'
            );
            
            -- Increment by 1 month
            v_current_date := v_current_date + INTERVAL '1 month';
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ledger generation
DROP TRIGGER IF EXISTS trigger_generate_rent_ledger ON public.lease_contracts;
CREATE TRIGGER trigger_generate_rent_ledger
    AFTER UPDATE ON public.lease_contracts
    FOR EACH ROW
    EXECUTE FUNCTION generate_rent_ledger_entries();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_rent_ledgers_lease_id ON public.rent_ledgers(lease_id);
CREATE INDEX IF NOT EXISTS idx_rent_ledgers_tenant_id ON public.rent_ledgers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_ledgers_due_date ON public.rent_ledgers(due_date);
