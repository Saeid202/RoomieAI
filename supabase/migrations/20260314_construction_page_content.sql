-- ============================================
-- TABLE: construction_page_content
-- Stores all editable content for the construction landing page
-- ============================================

CREATE TABLE IF NOT EXISTS public.construction_page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE, -- 'hero', 'nav', 'categories', 'custom_design', 'footer'
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS so admin can freely read/write
ALTER TABLE public.construction_page_content DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DEFAULT CONTENT
-- ============================================

INSERT INTO public.construction_page_content (section, content) VALUES

('nav', '{
  "logo": "Homie Construction",
  "links": [
    { "label": "Marketplace", "href": "/construction" },
    { "label": "Custom Design", "href": "/construction/custom" },
    { "label": "Suppliers", "href": "/construction/signup" }
  ],
  "cta_label": "Get a Quote",
  "cta_href": "/construction/custom",
  "login_label": "Log in",
  "login_href": "/construction/login"
}'),

('hero', '{
  "badge": "Homie Construction",
  "title_line1": "Global Prefabricated",
  "title_line2": "Homes",
  "title_highlight": "Marketplace",
  "subtitle": "Source modular homes directly from verified manufacturers. Designed for Canada. Built for speed.",
  "trust_badges": ["Verified Suppliers", "Canada Compatible"],
  "search_placeholder": "What kind of home are you looking for?",
  "cta_primary_label": "Browse Homes",
  "cta_primary_href": "/construction",
  "cta_secondary_label": "Upload Custom Design",
  "cta_secondary_href": "/construction/custom",
  "hero_image_url": ""
}'),

('categories', '{
  "title": "Featured Prefab Homes",
  "subtitle": "Direct sourcing from top prefab manufacturing hubs",
  "items": [
    { "label": "Expandable Homes", "filter": "expandable", "image_url": "" },
    { "label": "Flat Pack Homes", "filter": "flat pack", "image_url": "" },
    { "label": "Capsule Homes", "filter": "capsule", "image_url": "" },
    { "label": "Luxury Modular Villas", "filter": "modular", "image_url": "" }
  ]
}'),

('custom_design', '{
  "title": "Design Your Own Prefab Home",
  "subtitle": "Upload your floor plan and manufacturers will quote your project.",
  "cta_primary_label": "Upload Floor Plan",
  "cta_primary_href": "/construction/custom",
  "cta_secondary_label": "Start Custom Project",
  "cta_secondary_href": "/construction/custom",
  "features": [
    { "label": "Architects", "icon": "triangle" },
    { "label": "Factories", "icon": "building" },
    { "label": "AI Cost Estimate", "icon": "sparkles" }
  ],
  "sample_card": {
    "badge": "Certified Manufacturer",
    "title": "Expandable Modular House",
    "location": "Foshan, China",
    "price": "$29,800 CAD Factories",
    "image_url": ""
  }
}'),

('footer', '{
  "logo": "Homie Construction",
  "links_col1": [
    { "label": "Supplier Registration", "href": "/construction/signup" },
    { "label": "Investor Relations", "href": "#" },
    { "label": "Contact", "href": "#" }
  ],
  "links_col2": [
    { "label": "About", "href": "#" },
    { "label": "Contact", "href": "#" }
  ],
  "legal": [
    { "label": "Privacy Policy", "href": "#" },
    { "label": "Terms of Service", "href": "#" }
  ],
  "copyright": "© 2026 Homie Construction. All rights reserved."
}')

ON CONFLICT (section) DO NOTHING;
