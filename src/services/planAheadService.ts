import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export type PlanAheadFormInput = {
  currentLocation: string;
  targetLocations: string[];
  moveDate: string; // YYYY-MM-DD
  propertyType: string;
  lookingForRoommate: string; // "yes" | "no"
  roommateGenderPref: string; // "any" | "male" | "female" | "nonbinary"
  languagePref: string;
  additionalInfo: string;
};

function mapToPayload(userId: string, input: PlanAheadFormInput) {
  // Map UI fields to DB columns based on the new plan_ahead_profiles table schema
  return {
    user_id: userId,
    current_location: input.currentLocation,
    target_locations: input.targetLocations || [],
    move_date: input.moveDate,
    property_type: input.propertyType,
    looking_for_roommate: input.lookingForRoommate === "yes",
    roommate_gender_pref: input.lookingForRoommate === "yes" ? input.roommateGenderPref : null,
    language_pref: input.lookingForRoommate === "yes" ? input.languagePref : null,
    additional_info: input.additionalInfo || null,
  } as Record<string, any>;
}

export async function savePlanAheadProfile(
  userId: string,
  input: PlanAheadFormInput
): Promise<{ id: string }> {
  const payload = mapToPayload(userId, input);

  // Try to find existing profile for this user
  const { data: existing, error: selectError } = await sb
    .from("plan_ahead_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError && (selectError as any).code && (selectError as any).code !== "PGRST116") {
    // PGRST116 is no rows found for maybeSingle, safe to ignore
    throw selectError;
  }

  if (existing?.id) {
    const { data, error } = await sb
      .from("plan_ahead_profiles")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to update plan ahead profile");
    return { id: String(data.id) };
  } else {
    const { data, error } = await sb
      .from("plan_ahead_profiles")
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create plan ahead profile");
    return { id: String(data.id) };
  }
}

// Fetch user's plan ahead profile
export async function getPlanAheadProfile(userId: string): Promise<PlanAheadFormInput | null> {
  const { data, error } = await sb
    .from("plan_ahead_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && (error as any).code !== "PGRST116") {
    throw error;
  }

  if (!data) {
    return null;
  }

  // Map database fields back to form input format
  return {
    currentLocation: data.current_location || "",
    targetLocations: data.target_locations || [],
    moveDate: data.move_date || "",
    propertyType: data.property_type || "",
    lookingForRoommate: data.looking_for_roommate ? "yes" : "no",
    roommateGenderPref: data.roommate_gender_pref || "",
    languagePref: data.language_pref || "",
    additionalInfo: data.additional_info || "",
  };
}

// Get potential matches for the current user
export async function getPlanAheadMatches(userId: string): Promise<any[]> {
  // First get the current user's profile
  const { data: userProfile, error: userError } = await sb
    .from("plan_ahead_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (userError) {
    throw userError;
  }

  if (!userProfile) {
    return []; // No profile means no matches
  }

  // Find potential matches based on location and move date
  const { data: matches, error: matchesError } = await sb
    .from("plan_ahead_profiles")
    .select(`
      *,
      user:user_id (
        email,
        user_metadata
      )
    `)
    .neq("user_id", userId) // Exclude current user
    .gte("move_date", new Date().toISOString().split('T')[0]) // Only future moves
    .order("move_date", { ascending: true });

  if (matchesError) {
    throw matchesError;
  }

  // Filter matches based on location overlap and other criteria
  const filteredMatches = matches?.filter((match: any) => {
    // Check if there's location overlap
    const hasLocationOverlap = match.target_locations?.some((location: string) =>
      userProfile.target_locations?.includes(location)
    ) || userProfile.target_locations?.some((location: string) =>
      match.target_locations?.includes(location)
    );

    // Check if both are looking for roommates and have compatible preferences
    const roommateCompatible = !userProfile.looking_for_roommate || !match.looking_for_roommate || 
      (userProfile.looking_for_roommate && match.looking_for_roommate && 
       (userProfile.roommate_gender_pref === "any" || match.roommate_gender_pref === "any" ||
        userProfile.roommate_gender_pref === match.roommate_gender_pref) &&
       userProfile.language_pref === match.language_pref);

    return hasLocationOverlap && roommateCompatible;
  }) || [];

  return filteredMatches;
}
