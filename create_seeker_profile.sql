
-- Create or update the 'profiles' table to support Seeker Profile fields

-- 1. Create table if it doesn't exist (assuming 'profiles' might already exist based on service code, but let's be sure)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns if they don't exist
DO $$
BEGIN
    -- first_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;

    -- last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;

    -- age (User specifically asked for Age, though DOB is common, we'll store Age as requested or keep DOB if existing and calculate? User asked for Age input.)
    -- Let's stick to 'age' as requested.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age') THEN
        ALTER TABLE public.profiles ADD COLUMN age INTEGER;
    END IF;

    -- linkedin (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin') THEN
        ALTER TABLE public.profiles ADD COLUMN linkedin TEXT;
    END IF;

    -- nationality
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nationality') THEN
        ALTER TABLE public.profiles ADD COLUMN nationality TEXT;
    END IF;

    -- about_me
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'about_me') THEN
        ALTER TABLE public.profiles ADD COLUMN about_me TEXT;
    END IF;
    
    -- Ensure full_name exists as legacy or derived? Service uses it. Let's leave it be or sync it.
    -- We won't remove full_name if it exists.
END $$;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Users can view/update their own profile)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

