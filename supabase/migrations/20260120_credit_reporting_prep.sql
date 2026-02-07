-- Migration: Prep for Credit Reporting Phase 1 (Data Collection)
-- Adds reporting-related fields to rent_ledgers for silent data collection

ALTER TABLE public.rent_ledgers 
ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(20) CHECK (payment_method_type IN ('bank_account', 'credit', 'debit')),
ADD COLUMN IF NOT EXISTS on_time BOOLEAN,
ADD COLUMN IF NOT EXISTS days_late INTEGER;

-- Backfill landlord_id from lease_contracts for existing ledgers
UPDATE public.rent_ledgers rl
SET landlord_id = lc.landlord_id
FROM public.lease_contracts lc
WHERE rl.lease_id = lc.id
AND rl.landlord_id IS NULL;

-- Ensure landlord_id is also added to generate_rent_ledger_entries function
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
            INSERT INTO public.rent_ledgers (
                lease_id,
                tenant_id,
                landlord_id,
                property_id,
                due_date,
                rent_amount,
                status
            ) VALUES (
                NEW.id,
                NEW.tenant_id,
                NEW.landlord_id,
                NEW.property_id,
                v_current_date,
                v_rent_amount,
                'unpaid'
            );
            
            v_current_date := v_current_date + INTERVAL '1 month';
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
