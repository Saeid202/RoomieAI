-- Create a table for co-ownership signals
CREATE TABLE public.co_ownership_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  capital_available TEXT NOT NULL,
  household_type TEXT NOT NULL CHECK (household_type IN ('Single', 'Couple', 'Family')),
  intended_use TEXT NOT NULL CHECK (intended_use IN ('Live-in', 'Investment', 'Mixed')),
  time_horizon TEXT NOT NULL CHECK (time_horizon IN ('1–2 years', '3–5 years', 'Flexible')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.co_ownership_signals ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view signals
CREATE POLICY "Signals are viewable by everyone" 
ON public.co_ownership_signals FOR SELECT 
USING (true);

-- Policy: Authenticated users can create signals
CREATE POLICY "Users can create their own signals" 
ON public.co_ownership_signals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update/delete their own signals
CREATE POLICY "Users can delete their own signals" 
ON public.co_ownership_signals FOR DELETE 
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_signals_created_at ON public.co_ownership_signals(created_at DESC);
