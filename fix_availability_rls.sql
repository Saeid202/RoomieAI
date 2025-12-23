
-- FIX: Update RLS policies to be more robust
-- Run this in your Supabase SQL Editor

-- 1. Ensure Renovator Availability has a unique constraint on renovator_id for simpler upserts
ALTER TABLE public.renovator_availability 
ADD CONSTRAINT unique_renovator_availability UNIQUE (renovator_id);

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Renovators manage their own availability" ON public.renovator_availability;

-- 3. Create a more robust policy for ALL operations (Select, Insert, Update, Delete)
CREATE POLICY "Renovators manage their own availability"
ON public.renovator_availability
FOR ALL
USING (
    renovator_id IN (
        SELECT id FROM public.renovation_partners WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    renovator_id IN (
        SELECT id FROM public.renovation_partners WHERE user_id = auth.uid()
    )
);

-- 4. Create a Helper RPC for toggling availability (Bypasses RLS complexity if needed)
CREATE OR REPLACE FUNCTION public.toggle_renovator_availability(
    p_field TEXT,
    p_value BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges
AS $$
DECLARE
    v_renovator_id UUID;
BEGIN
    -- Get Renovator ID
    SELECT id INTO v_renovator_id FROM public.renovation_partners WHERE user_id = auth.uid();
    
    IF v_renovator_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No renovator profile found');
    END IF;

    -- Upsert availability
    INSERT INTO public.renovator_availability (renovator_id, is_online, emergency_available)
    VALUES (
        v_renovator_id, 
        CASE WHEN p_field = 'is_online' THEN p_value ELSE false END,
        CASE WHEN p_field = 'emergency_available' THEN p_value ELSE false END
    )
    ON CONFLICT (renovator_id)
    DO UPDATE SET
        is_online = CASE WHEN p_field = 'is_online' THEN p_value ELSE renovator_availability.is_online END,
        emergency_available = CASE WHEN p_field = 'emergency_available' THEN p_value ELSE renovator_availability.emergency_available END,
        updated_at = now();

    RETURN jsonb_build_object('success', true);
END;
$$;
