-- Add lawyer to role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'user_role' AND e.enumlabel = 'lawyer'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'lawyer';
  END IF;
END $$;
