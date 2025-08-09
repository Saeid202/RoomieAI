import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type PlanAheadMatch = {
  id: string;
  user_id: string;
  matched_user_id: string;
  profile_id: string;
  matched_profile_id: string;
  compatibility_score: number;
  match_factors: Record<string, any> | null;
  status: string | null;
  created_at: string | null;
};

export type PlanAheadProfile = {
  id: string;
  user_id: string;
  target_cities: string[];
  planned_move_date: string;
  flexible_move_date: boolean | null;
  flexibility_weeks: number | null;
  current_city: string | null;
  additional_notes: string | null;
};

export type EnrichedPlanAheadMatch = PlanAheadMatch & {
  other_profile: PlanAheadProfile | null;
};

export function usePlanAheadMatches() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<EnrichedPlanAheadMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: rawMatches, error: mErr } = await supabase
          .from("plan_ahead_matches")
          .select("*")
          .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
          .order("created_at", { ascending: false });
        if (mErr) throw mErr;
        const matches = rawMatches as PlanAheadMatch[] | null;
        if (!matches || matches.length === 0) {
          if (isMounted) setMatches([]);
          return;
        }

        const otherIds = matches.map((m) => (m.user_id === userId ? m.matched_profile_id : m.profile_id));
        const uniqueIds = Array.from(new Set(otherIds));

        const { data: profiles, error: pErr } = await supabase
          .from("plan_ahead_profiles")
          .select("id,user_id,target_cities,planned_move_date,flexible_move_date,flexibility_weeks,current_city,additional_notes")
          .in("id", uniqueIds);
        if (pErr) throw pErr;

        const profileMap = new Map<string, PlanAheadProfile>();
        (profiles || []).forEach((p) => profileMap.set(String(p.id), p as PlanAheadProfile));

        const enriched: EnrichedPlanAheadMatch[] = matches.map((m) => {
          const otherId = m.user_id === userId ? m.matched_profile_id : m.profile_id;
          return { ...m, other_profile: profileMap.get(otherId) || null };
        });

        if (isMounted) setMatches(enriched);
      } catch (err: any) {
        console.error("Failed to load plan ahead matches", err);
        if (isMounted) setError(err.message || "Failed to load matches");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const hasMatches = useMemo(() => matches.length > 0, [matches]);

  return { loading, matches, error, hasMatches };
}
