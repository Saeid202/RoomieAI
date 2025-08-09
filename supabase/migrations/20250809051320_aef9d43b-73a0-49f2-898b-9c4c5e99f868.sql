-- Fix: recreate policies without IF NOT EXISTS (not supported)

-- Ensure enum exists
DO $$ BEGIN
  CREATE TYPE public.cms_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_canonical TEXT,
  open_graph JSONB,
  content JSONB,
  status public.cms_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id UUID
);

CREATE TABLE IF NOT EXISTS public.cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_navigation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cms_pages' AND policyname = 'Admins manage cms_pages'
  ) THEN
    DROP POLICY "Admins manage cms_pages" ON public.cms_pages;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cms_sections' AND policyname = 'Admins manage cms_sections'
  ) THEN
    DROP POLICY "Admins manage cms_sections" ON public.cms_sections;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cms_navigation' AND policyname = 'Admins manage cms_navigation'
  ) THEN
    DROP POLICY "Admins manage cms_navigation" ON public.cms_navigation;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cms_pages' AND policyname = 'Public can view published pages'
  ) THEN
    DROP POLICY "Public can view published pages" ON public.cms_pages;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cms_sections' AND policyname = 'Public can view sections for published pages'
  ) THEN
    DROP POLICY "Public can view sections for published pages" ON public.cms_sections;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cms_navigation' AND policyname = 'Public can view visible navigation'
  ) THEN
    DROP POLICY "Public can view visible navigation" ON public.cms_navigation;
  END IF;
END $$;

-- Policies
CREATE POLICY "Admins manage cms_pages"
ON public.cms_pages
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage cms_sections"
ON public.cms_sections
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage cms_navigation"
ON public.cms_navigation
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view published pages"
ON public.cms_pages
AS PERMISSIVE
FOR SELECT
USING (status = 'published');

CREATE POLICY "Public can view sections for published pages"
ON public.cms_sections
AS PERMISSIVE
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cms_pages p
    WHERE p.id = cms_sections.page_id AND p.status = 'published'
  )
);

CREATE POLICY "Public can view visible navigation"
ON public.cms_navigation
AS PERMISSIVE
FOR SELECT
USING (visible = true);

-- Triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_cms_pages_updated
BEFORE UPDATE ON public.cms_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_cms_sections_updated
BEFORE UPDATE ON public.cms_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_cms_navigation_updated
BEFORE UPDATE ON public.cms_navigation
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_sections_page_order ON public.cms_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_cms_navigation_location ON public.cms_navigation(location, order_index);
