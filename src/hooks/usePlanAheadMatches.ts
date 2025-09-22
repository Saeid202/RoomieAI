import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getPlanAheadMatches } from "@/services/planAheadService";

export type PlanAheadMatch = {
  id: string;
  user_id: string;
  current_location: string;
  target_locations: string[];
  move_date: string;
  property_type: string;
  looking_for_roommate: boolean;
  roommate_gender_pref: string | null;
  language_pref: string | null;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    user_metadata: any;
  };
};

export type PlanAheadProfile = {
  id: string;
  user_id: string;
  current_location: string;
  target_locations: string[];
  move_date: string;
  property_type: string;
  looking_for_roommate: boolean;
  roommate_gender_pref: string | null;
  language_pref: string | null;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
};

export function usePlanAheadMatches() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<PlanAheadMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const matches = await getPlanAheadMatches(userId);
        if (isMounted) setMatches(matches);
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
