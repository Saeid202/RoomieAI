import { supabase } from "@/integrations/supabase/client";

export interface UserProfileData {
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  occupation?: string;
}

/**
 * Fetch user profile data for rental application auto-population
 * Uses a comprehensive fallback strategy to get the best available data
 */
export async function fetchUserProfileForApplication(
  userId: string
): Promise<UserProfileData> {
  console.log("Fetching user profile for application, userId:", userId);

  try {
    // Priority 1: Check user_profiles table (primary source) - with error handling
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, email, date_of_birth, occupation')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        console.log("Found profile data:", profile);
        return {
          fullName: profile.full_name || '',
          email: profile.email || '',
          phone: undefined,
          dateOfBirth: profile.date_of_birth || undefined,
          occupation: profile.occupation || undefined,
        };
      }
    } catch (profileTableError) {
      console.log("Profiles table not accessible, using auth user data:", profileTableError);
    }

    console.log("No profile found, using auth user data");
    
    // Priority 2: Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error('User not authenticated');
    }

    // Priority 3: Fall back to user metadata and email
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.user_metadata?.display_name ||
                     '';

    const email = user.email || '';
    const phone = user.user_metadata?.phone || undefined;

    console.log("Using auth user data:", { fullName, email, phone });

    return {
      fullName,
      email,
      phone,
    };

  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    // Final fallback - return minimal data
    const { data: { user } } = await supabase.auth.getUser();
    return {
      fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      email: user?.email || '',
    };
  }
}

/**
 * Check if user has a complete profile
 */
export async function hasCompleteProfile(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return false;
    }

    return !!(profile.full_name && profile.email);
  } catch (error) {
    console.error("Error checking profile completeness:", error);
    return false;
  }
}
