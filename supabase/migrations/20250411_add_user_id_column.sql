
-- Add user_id column to roommate table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'roommate' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public.roommate ADD COLUMN user_id uuid REFERENCES auth.users;
    END IF;
END $$;

-- Add user_id column to co-owner table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'co-owner' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public."co-owner" ADD COLUMN user_id uuid REFERENCES auth.users;
    END IF;
END $$;

-- Add user_id column to Both table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'Both' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public."Both" ADD COLUMN user_id uuid REFERENCES auth.users;
    END IF;
END $$;

-- Add proper RLS policies for the tables
-- For roommate table
ALTER TABLE public.roommate ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND schemaname = 'public' 
        AND policyname = 'Users can view own profiles'
    ) THEN
        CREATE POLICY "Users can view own profiles" 
        ON public.roommate 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND schemaname = 'public' 
        AND policyname = 'Users can insert own profiles'
    ) THEN
        CREATE POLICY "Users can insert own profiles" 
        ON public.roommate 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND schemaname = 'public' 
        AND policyname = 'Users can update own profiles'
    ) THEN
        CREATE POLICY "Users can update own profiles" 
        ON public.roommate 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND schemaname = 'public' 
        AND policyname = 'Users can delete own profiles'
    ) THEN
        CREATE POLICY "Users can delete own profiles" 
        ON public.roommate 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- For co-owner table
ALTER TABLE public."co-owner" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'co-owner' 
        AND schemaname = 'public' 
        AND policyname = 'Users can view own profiles'
    ) THEN
        CREATE POLICY "Users can view own profiles" 
        ON public."co-owner" 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'co-owner' 
        AND schemaname = 'public' 
        AND policyname = 'Users can insert own profiles'
    ) THEN
        CREATE POLICY "Users can insert own profiles" 
        ON public."co-owner" 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'co-owner' 
        AND schemaname = 'public' 
        AND policyname = 'Users can update own profiles'
    ) THEN
        CREATE POLICY "Users can update own profiles" 
        ON public."co-owner" 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'co-owner' 
        AND schemaname = 'public' 
        AND policyname = 'Users can delete own profiles'
    ) THEN
        CREATE POLICY "Users can delete own profiles" 
        ON public."co-owner" 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- For Both table
ALTER TABLE public."Both" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Both' 
        AND schemaname = 'public' 
        AND policyname = 'Users can view own profiles'
    ) THEN
        CREATE POLICY "Users can view own profiles" 
        ON public."Both" 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Both' 
        AND schemaname = 'public' 
        AND policyname = 'Users can insert own profiles'
    ) THEN
        CREATE POLICY "Users can insert own profiles" 
        ON public."Both" 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Both' 
        AND schemaname = 'public' 
        AND policyname = 'Users can update own profiles'
    ) THEN
        CREATE POLICY "Users can update own profiles" 
        ON public."Both" 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Both' 
        AND schemaname = 'public' 
        AND policyname = 'Users can delete own profiles'
    ) THEN
        CREATE POLICY "Users can delete own profiles" 
        ON public."Both" 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;
