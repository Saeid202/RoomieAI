import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export type PlanAheadFormInput = {
  currentLocation: string;
  targetLocations: string[];
  moveDate: string; // YYYY-MM-DD
  ageRange: string;
  genderPref: string; // any | male | female | nonbinary
  nationality: string;
  languagePref: string;
  dietaryPref: Record<string, boolean>;
  occupationPref: Record<string, boolean>;
  workSchedulePref: string;
  ethnicityPref: string;
  religionPref: string;
  petPref: string; // yes | no | nopref
  smokePref: string; // yes | no | nopref
  additionalInfo: string;
};

function mapToPayload(userId: string, input: PlanAheadFormInput) {
  // Map UI fields to DB columns. Provide safe defaults for NOT NULL arrays
  const petPref =
    input.petPref === "nopref"
      ? "no_preference"
      : input.petPref === "yes"
      ? "allowed"
      : "not_allowed";

  const smokingPref =
    input.smokePref === "nopref"
      ? "no_preference"
      : input.smokePref === "yes"
      ? "allowed"
      : "not_allowed";

  return {
    user_id: userId,
    planned_move_date: input.moveDate,
    current_city: input.currentLocation || null,
    target_cities: input.targetLocations ?? [],
    gender_preference:
      input.genderPref && input.genderPref !== "any" ? [input.genderPref] : [],
    smoking_preference: smokingPref,
    pet_preferences: petPref,
    daily_schedule: input.workSchedulePref || null,
    additional_notes: input.additionalInfo || null,

    // Required arrays in schema → provide empty arrays by default
    target_states: [],
    budget_range: [],
    preferred_living_arrangements: [],
    preferred_housing_types: [],
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
