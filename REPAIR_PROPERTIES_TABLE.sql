-- Database Repair Script: Fix missing 'listing_category' and other columns in properties table
-- Safe & Idempotent

DO $$
BEGIN
    -- 1. Ensure listing_category exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'listing_category') THEN
        ALTER TABLE public.properties ADD COLUMN listing_category TEXT DEFAULT 'rental';
    END IF;

    -- 2. Ensure description_audio_url exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'description_audio_url') THEN
        ALTER TABLE public.properties ADD COLUMN description_audio_url TEXT;
    END IF;

    -- 3. Ensure three_d_model_url exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'three_d_model_url') THEN
        ALTER TABLE public.properties ADD COLUMN three_d_model_url TEXT;
    END IF;

    -- 4. Ensure video/audio script columns exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'video_script') THEN
        ALTER TABLE public.properties ADD COLUMN video_script TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'background_music_url') THEN
        ALTER TABLE public.properties ADD COLUMN background_music_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'video_enabled') THEN
        ALTER TABLE public.properties ADD COLUMN video_enabled BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'audio_enabled') THEN
        ALTER TABLE public.properties ADD COLUMN audio_enabled BOOLEAN DEFAULT true;
    END IF;

    -- 5. Ensure lease_terms exists (since 20251002 migration dropped it, but propertyService.ts still uses it)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'lease_terms') THEN
        ALTER TABLE public.properties ADD COLUMN lease_terms TEXT;
    END IF;

END $$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
