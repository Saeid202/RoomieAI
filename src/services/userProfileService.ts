import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

// Cache for user profiles to avoid repeated queries
const userProfileCache = new Map<string, UserProfile>();

/**
 * Get user profile by user ID
 * Uses caching to minimize database queries
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Check cache first
  if (userProfileCache.has(userId)) {
    return userProfileCache.get(userId) || null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error("Error fetching user profile:", error);
      return null;
    }

    const profile = data as UserProfile;
    userProfileCache.set(userId, profile);
    return profile;
  } catch (e) {
    console.error("Error fetching user profile:", e);
    return null;
  }
}

/**
 * Get multiple user profiles by user IDs
 * More efficient than calling getUserProfile multiple times
 */
export async function getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const result = new Map<string, UserProfile>();
  const uncachedIds = userIds.filter(id => !userProfileCache.has(id));

  // Add cached profiles to result
  userIds.forEach(id => {
    const cached = userProfileCache.get(id);
    if (cached) result.set(id, cached);
  });

  // If all are cached, return early
  if (uncachedIds.length === 0) return result;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', uncachedIds);

    if (error) {
      console.error("Error fetching user profiles:", error);
      return result;
    }

    const profiles = data as UserProfile[];
    profiles.forEach(profile => {
      userProfileCache.set(profile.id, profile);
      result.set(profile.id, profile);
    });

    return result;
  } catch (e) {
    console.error("Error fetching user profiles:", e);
    return result;
  }
}

/**
 * Get display name for a user
 * Returns full_name if available, otherwise returns a formatted user ID
 */
export function getDisplayName(profile: UserProfile | null, userId: string): string {
  if (profile?.full_name) {
    return profile.full_name;
  }
  return `User ${userId.slice(0, 8)}`;
}

/**
 * Clear the user profile cache (useful for testing or manual refresh)
 */
export function clearUserProfileCache(): void {
  userProfileCache.clear();
}
