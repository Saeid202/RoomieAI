-- Auto-match Plan Ahead profiles on insert/update
-- 1) Unique index to avoid duplicate pairs regardless of order
CREATE UNIQUE INDEX IF NOT EXISTS plan_ahead_matches_unique_pair
ON public.plan_ahead_matches (LEAST(profile_id, matched_profile_id), GREATEST(profile_id, matched_profile_id));

-- Helpful indexes for matching
CREATE INDEX IF NOT EXISTS idx_plan_ahead_profiles_target_cities ON public.plan_ahead_profiles USING GIN (target_cities);
CREATE INDEX IF NOT EXISTS idx_plan_ahead_profiles_move_date ON public.plan_ahead_profiles (planned_move_date);

-- 2) Matching trigger function
CREATE OR REPLACE FUNCTION public.find_plan_ahead_matches()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_start date;
  new_end date;
  other_start date;
  other_end date;
  overlap_days int;
  date_diff int;
  matched record;
  score numeric;
  matched_city text;
BEGIN
  -- Only consider eligible profiles
  IF COALESCE(NEW.is_active, true) IS DISTINCT FROM true OR NEW.profile_visibility <> 'public' OR COALESCE(NEW.looking_for_roommate, true) IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  new_start := NEW.planned_move_date - COALESCE(NEW.flexibility_weeks, 0) * 7;
  new_end   := NEW.planned_move_date + COALESCE(NEW.flexibility_weeks, 0) * 7;

  FOR matched IN
    SELECT p.*
    FROM public.plan_ahead_profiles p
    WHERE COALESCE(p.is_active, true) = true
      AND p.profile_visibility = 'public'
      AND COALESCE(p.looking_for_roommate, true) = true
      AND p.user_id <> NEW.user_id
      AND p.target_cities && NEW.target_cities
  LOOP
    other_start := matched.planned_move_date - COALESCE(matched.flexibility_weeks, 0) * 7;
    other_end   := matched.planned_move_date + COALESCE(matched.flexibility_weeks, 0) * 7;

    -- Overlapping date windows?
    IF NOT (new_end < other_start OR other_end < new_start) THEN
      overlap_days := (LEAST(new_end, other_end) - GREATEST(new_start, other_start)) + 1;
      date_diff := ABS(NEW.planned_move_date - matched.planned_move_date);
      SELECT c INTO matched_city FROM unnest(NEW.target_cities) c WHERE c = ANY(matched.target_cities) LIMIT 1;

      -- Simple score: base 60 + date proximity (<=30) + overlap bonus (<=10)
      score := 60 
        + LEAST(30, GREATEST(0, 30 - date_diff))
        + LEAST(10, GREATEST(0, overlap_days / 3));

      INSERT INTO public.plan_ahead_matches (
        user_id, matched_user_id, profile_id, matched_profile_id, compatibility_score, match_factors, status
      )
      VALUES (
        NEW.user_id, matched.user_id, NEW.id, matched.id, score,
        jsonb_build_object(
          'city', matched_city,
          'date_diff_days', date_diff,
          'overlap_days', overlap_days
        ),
        'pending'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 3) Trigger on inserts/updates of matching-relevant fields
DROP TRIGGER IF EXISTS trg_find_plan_ahead_matches ON public.plan_ahead_profiles;
CREATE TRIGGER trg_find_plan_ahead_matches
AFTER INSERT OR UPDATE OF planned_move_date, flexible_move_date, flexibility_weeks, target_cities, is_active, profile_visibility, looking_for_roommate
ON public.plan_ahead_profiles
FOR EACH ROW
EXECUTE FUNCTION public.find_plan_ahead_matches();