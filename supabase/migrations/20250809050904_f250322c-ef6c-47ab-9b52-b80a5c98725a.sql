-- Phase 1: Minimal CMS schema for editable pages

-- 1) Enum for status
DO $$ BEGIN
  CREATE TYPE public.cms_status AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) cms_pages table
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_canonical TEXT,
  open_graph JSONB,
  content JSONB, -- array of blocks or structured content
  status public.cms_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id UUID
);

-- 3) cms_sections table (prepared for future granular blocks)
CREATE TABLE IF NOT EXISTS public.cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) cms_navigation table
CREATE TABLE IF NOT EXISTS public.cms_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL, -- expected: 'header' | 'footer'
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Enable RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_navigation ENABLE ROW LEVEL SECURITY;

-- 6) Policies
-- Admins can manage all
CREATE POLICY IF NOT EXISTS "Admins manage cms_pages"
ON public.cms_pages
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage cms_sections"
ON public.cms_sections
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage cms_navigation"
ON public.cms_navigation
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public/anon can view published pages
CREATE POLICY IF NOT EXISTS "Public can view published pages"
ON public.cms_pages
AS PERMISSIVE
FOR SELECT
USING (status = 'published');

-- Public/anon can view sections of published pages
CREATE POLICY IF NOT EXISTS "Public can view sections for published pages"
ON public.cms_sections
AS PERMISSIVE
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cms_pages p
    WHERE p.id = cms_sections.page_id AND p.status = 'published'
  )
);

-- Public/anon can view visible navigation
CREATE POLICY IF NOT EXISTS "Public can view visible navigation"
ON public.cms_navigation
AS PERMISSIVE
FOR SELECT
USING (visible = true);

-- 7) Updated_at triggers
CREATE OR REPLACE TRIGGER trg_cms_pages_updated
BEFORE UPDATE ON public.cms_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_cms_sections_updated
BEFORE UPDATE ON public.cms_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_cms_navigation_updated
BEFORE UPDATE ON public.cms_navigation
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_sections_page_order ON public.cms_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_cms_navigation_location ON public.cms_navigation(location, order_index);
