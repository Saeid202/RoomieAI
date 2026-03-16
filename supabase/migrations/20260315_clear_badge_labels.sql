-- Clear all badge_label values from construction_products
UPDATE public.construction_products
  SET badge_label = NULL
  WHERE badge_label IS NOT NULL;

-- Verify
SELECT id, title, badge_label FROM public.construction_products WHERE badge_label IS NOT NULL;
