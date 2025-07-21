import { supabase } from "@/integrations/supabase/client";
import type { PlanAheadProfile, PlanAheadMatch, MatchFactors } from "@/types/planAhead";
import type { Database } from "@/integrations/supabase/types";

type DatabasePlanAheadMatch = Database['public']['Tables']['plan_ahead_matches']['Row'];
type DatabasePlanAheadMatchInsert = Database['public']['Tables']['plan_ahead_matches']['Insert'];

export const planAheadMatchingService = {
  // Calculate compatibility between two profiles
  calculateCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): MatchFactors {
    const factors = {
      timeline_compatibility: calculateTimelineCompatibility(profile1, profile2),
      location_compatibility: calculateLocationCompatibility(profile1, profile2),
      budget_compatibility: calculateBudgetCompatibility(profile1, profile2),
      lifestyle_compatibility: calculateLifestyleCompatibility(profile1, profile2),
      housing_compatibility: calculateHousingCompatibility(profile1, profile2),
      preference_compatibility: calculatePreferenceCompatibility(profile1, profile2),
      overall_score: 0
    };

    // Calculate weighted overall score
    factors.overall_score = 
      (factors.timeline_compatibility * 0.25) +
      (factors.location_compatibility * 0.20) +
      (factors.budget_compatibility * 0.15) +
      (factors.lifestyle_compatibility * 0.15) +
      (factors.housing_compatibility * 0.15) +
      (factors.preference_compatibility * 0.10);

    return factors;
  },

  // Find matches for a user's profile
  async findMatches(userProfile: PlanAheadProfile): Promise<PlanAheadMatch[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get all other active profiles
    const { data: otherProfiles, error } = await supabase
      .from('plan_ahead_profiles')
      .select('*')
      .eq('is_active', true)
      .eq('profile_visibility', 'public')
      .neq('user_id', user.id);

    if (error) throw error;

    if (!otherProfiles || otherProfiles.length === 0) {
      return [];
    }

    // Calculate compatibility for each profile
    const matches: PlanAheadMatch[] = [];
    
    for (const otherProfile of otherProfiles) {
      const compatibility = this.calculateCompatibility(userProfile, otherProfile as PlanAheadProfile);
      
      // Only create matches above a certain threshold
      if (compatibility.overall_score >= 0.3) {
        matches.push({
          user_id: user.id,
          matched_user_id: otherProfile.user_id!,
          profile_id: userProfile.id!,
          matched_profile_id: otherProfile.id!,
          compatibility_score: compatibility.overall_score,
          match_factors: compatibility,
          status: 'pending'
        });
      }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return matches;
  },

  // Save matches to database
  async saveMatches(matches: PlanAheadMatch[]): Promise<void> {
    if (matches.length === 0) return;

    const matchInserts: DatabasePlanAheadMatchInsert[] = matches.map(match => ({
      user_id: match.user_id,
      matched_user_id: match.matched_user_id,
      profile_id: match.profile_id,
      matched_profile_id: match.matched_profile_id,
      compatibility_score: match.compatibility_score,
      match_factors: match.match_factors as any,
      status: match.status
    }));

    const { error } = await supabase
      .from('plan_ahead_matches')
      .upsert(matchInserts, {
        onConflict: 'user_id,matched_user_id,profile_id,matched_profile_id'
      });

    if (error) throw error;
  },

  // Get user's matches
  async getUserMatches(userId?: string): Promise<PlanAheadMatch[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plan_ahead_matches')
      .select('*')
      .eq('user_id', targetUserId)
      .order('compatibility_score', { ascending: false });

    if (error) throw error;
    return (data as unknown as PlanAheadMatch[]) || [];
  },

  // Update match action
  async updateMatchAction(
    matchId: string, 
    action: 'liked' | 'passed' | 'bookmarked'
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('plan_ahead_matches')
      .update({ user_action: action })
      .eq('id', matchId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Check if this creates a mutual match
    await this.checkMutualMatch(matchId);
  },

  // Check for mutual matches
  async checkMutualMatch(matchId: string): Promise<void> {
    const { data: match, error } = await supabase
      .from('plan_ahead_matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error || !match) return;

    // Look for reciprocal match
    const { data: reciprocalMatch, error: reciprocalError } = await supabase
      .from('plan_ahead_matches')
      .select('*')
      .eq('user_id', match.matched_user_id)
      .eq('matched_user_id', match.user_id)
      .single();

    if (reciprocalError || !reciprocalMatch) return;

    // If both users liked each other, create mutual match
    if (match.user_action === 'liked' && reciprocalMatch.user_action === 'liked') {
      await supabase
        .from('plan_ahead_matches')
        .update({ status: 'mutual_match' })
        .in('id', [match.id, reciprocalMatch.id]);
    }
  }
};

// Helper functions for compatibility calculations
function calculateTimelineCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): number {
  const date1 = new Date(profile1.planned_move_date);
  const date2 = new Date(profile2.planned_move_date);
  
  const daysDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  
  // Consider flexibility
  const maxFlexibility = Math.max(
    (profile1.flexibility_weeks || 0) * 7,
    (profile2.flexibility_weeks || 0) * 7
  );
  
  const effectiveDiff = Math.max(0, daysDiff - maxFlexibility);
  
  // Score decreases as difference increases
  if (effectiveDiff <= 14) return 1.0;
  if (effectiveDiff <= 30) return 0.8;
  if (effectiveDiff <= 60) return 0.6;
  if (effectiveDiff <= 90) return 0.4;
  return 0.2;
}

function calculateLocationCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): number {
  // Check for overlap in target cities or states
  const cities1 = profile1.target_cities || [];
  const cities2 = profile2.target_cities || [];
  const states1 = profile1.target_states || [];
  const states2 = profile2.target_states || [];
  
  const cityOverlap = cities1.some(city => cities2.includes(city));
  const stateOverlap = states1.some(state => states2.includes(state));
  
  if (cityOverlap) return 1.0;
  if (stateOverlap) return 0.7;
  
  // Both willing to relocate anywhere
  if (profile1.willing_to_relocate_anywhere && profile2.willing_to_relocate_anywhere) {
    return 0.6;
  }
  
  return 0.2;
}

function calculateBudgetCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): number {
  const [min1, max1] = profile1.budget_range;
  const [min2, max2] = profile2.budget_range;
  
  // Calculate overlap
  const overlapMin = Math.max(min1, min2);
  const overlapMax = Math.min(max1, max2);
  
  if (overlapMax < overlapMin) return 0; // No overlap
  
  const overlapSize = overlapMax - overlapMin;
  const range1Size = max1 - min1;
  const range2Size = max2 - min2;
  const avgRangeSize = (range1Size + range2Size) / 2;
  
  return Math.min(1.0, overlapSize / avgRangeSize);
}

function calculateLifestyleCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): number {
  let score = 0;
  let factors = 0;
  
  // Cleanliness level compatibility
  const cleanlinessDiff = Math.abs(profile1.cleanliness_level - profile2.cleanliness_level);
  score += Math.max(0, 1 - cleanlinessDiff / 10);
  factors++;
  
  // Social level compatibility
  if (profile1.social_level && profile2.social_level) {
    const socialMatch = profile1.social_level === profile2.social_level;
    score += socialMatch ? 1 : 0.5;
    factors++;
  }
  
  // Daily schedule compatibility
  if (profile1.daily_schedule && profile2.daily_schedule) {
    const scheduleMatch = profile1.daily_schedule === profile2.daily_schedule;
    score += scheduleMatch ? 1 : 0.7;
    factors++;
  }
  
  // Smoking preferences
  if (profile1.smoking_preference && profile2.smoking_preference) {
    const smokingMatch = profile1.smoking_preference === profile2.smoking_preference;
    score += smokingMatch ? 1 : 0.3;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0.5;
}

function calculateHousingCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): number {
  let score = 0;
  let factors = 0;
  
  // Housing type overlap
  const typeOverlap = profile1.preferred_housing_types?.some(type => 
    profile2.preferred_housing_types?.includes(type)
  );
  if (typeOverlap) score += 1;
  factors++;
  
  // Living arrangement overlap
  const arrangementOverlap = profile1.preferred_living_arrangements?.some(arr => 
    profile2.preferred_living_arrangements?.includes(arr)
  );
  if (arrangementOverlap) score += 1;
  factors++;
  
  // Room type compatibility
  if (profile1.room_type_preference && profile2.room_type_preference) {
    const roomMatch = profile1.room_type_preference === profile2.room_type_preference;
    score += roomMatch ? 1 : 0.5;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0.5;
}

function calculatePreferenceCompatibility(profile1: PlanAheadProfile, profile2: PlanAheadProfile): number {
  let score = 0;
  let factors = 0;
  
  // Age range compatibility
  const [min1, max1] = profile1.age_range_preference;
  const [min2, max2] = profile2.age_range_preference;
  
  const ageOverlap = Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
  const avgRange = ((max1 - min1) + (max2 - min2)) / 2;
  score += ageOverlap / avgRange;
  factors++;
  
  // Gender preference compatibility
  if (profile1.gender_preference?.length && profile2.gender_preference?.length) {
    const genderOverlap = profile1.gender_preference.some(gender => 
      profile2.gender_preference?.includes(gender)
    );
    score += genderOverlap ? 1 : 0.3;
    factors++;
  }
  
  // Lifestyle compatibility interests
  if (profile1.lifestyle_compatibility?.length && profile2.lifestyle_compatibility?.length) {
    const lifestyleOverlap = profile1.lifestyle_compatibility.some(lifestyle => 
      profile2.lifestyle_compatibility?.includes(lifestyle)
    );
    score += lifestyleOverlap ? 1 : 0.4;
    factors++;
  }
  
  // Shared interests
  if (profile1.shared_interests?.length && profile2.shared_interests?.length) {
    const interestOverlap = profile1.shared_interests.some(interest => 
      profile2.shared_interests?.includes(interest)
    );
    score += interestOverlap ? 1 : 0.4;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0.5;
}