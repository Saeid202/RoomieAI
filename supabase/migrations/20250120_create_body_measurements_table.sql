-- Create body measurements table for TailorAI
-- This table stores user body measurements captured by the AI system

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS public.body_measurements CASCADE;

-- Create body_measurements table
CREATE TABLE public.body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    height DECIMAL(5,2),
    shoulders DECIMAL(5,2),
    neck DECIMAL(5,2),
    left_arm DECIMAL(5,2),
    right_arm DECIMAL(5,2),
    chest DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    left_leg DECIMAL(5,2),
    right_leg DECIMAL(5,2),
    recommended_top_size TEXT,
    recommended_bottom_size TEXT,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX idx_body_measurements_date ON public.body_measurements(measurement_date DESC);
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);

-- Enable Row Level Security
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own measurements" ON public.body_measurements
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own measurements" ON public.body_measurements
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own measurements" ON public.body_measurements
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own measurements" ON public.body_measurements
    FOR DELETE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_measurements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
CREATE TRIGGER trg_update_measurements_updated_at
    BEFORE UPDATE ON public.body_measurements
    FOR EACH ROW EXECUTE FUNCTION public.update_measurements_updated_at();
