import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";
import { UserPreferences, PreferenceImportance } from "@/types/preferences";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

// Database roommate interface matching the Supabase table structure
export interface DatabaseUser {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  email: string;
  phone_number: string;
  linkedin_profile?: string;
  preferred_location: string;
  budget_range: string;
  move_in_date: string;
  housing_type: string;
  living_space: string;
  smoking: boolean;
  lives_with_smokers: boolean;
  has_pets: boolean;
  pet_preference?: string;
  work_location?: string;
  work_schedule: string;
  hobbies: string[];
  diet: string;
  roommate_gender_preference?: string;
  roommate_lifestyle_preference?: string;
  important_roommate_traits: string[];
  created_at: string;
  updated_at: string;
}

export interface CustomMatchCriteria {
  currentUser: ProfileFormValues;
  currentUserId?: string;
  userPreferences: UserPreferences;
  maxResults?: number;
  minScore?: number;
}

export interface CustomMatchResult {
  user: DatabaseUser;
  matchScore: number;
  matchReasons: string[];
  compatibilityAnalysis: CompatibilityAnalysis;
  failedRequirements: string[];
}

export interface CompatibilityAnalysis {
  gender: number;
  age: number;
  nationality: number;
  language: number;
  ethnicity: number;
  religion: number;
  occupation: number;
  location: number;
  budget: number;
  housingType: number;
  livingSpace: number;
  smoking: number;
  pets: number;
  workSchedule: number;
  diet: number;
  hobbies: number;
  cleanliness: number;
  socialLevel: number;
  guests: number;
  sleepSchedule: number;
}

class CustomPreferenceMatchingEngine {
  
  // Calculate gender compatibility
  private calculateGenderCompatibility(
    userGender: string, 
    userGenderPreference: string[], 
    candidateGender: string
  ): number {
    if (!userGenderPreference || userGenderPreference.length === 0) return 80;
    
    if (userGenderPreference.includes('noPreference') || 
        userGenderPreference.includes('any')) return 80;
    
    return userGenderPreference.includes(candidateGender) ? 100 : 0;
  }

  // Calculate age compatibility
  private calculateAgeCompatibility(
    userAgeRange: number[] | undefined,
    candidateAge: number
  ): number {
    if (!userAgeRange || userAgeRange.length !== 2) return 80;
    
    const [minAge, maxAge] = userAgeRange;
    if (candidateAge >= minAge && candidateAge <= maxAge) return 100;
    
    // Calculate distance from range
    const distance = candidateAge < minAge ? minAge - candidateAge : candidateAge - maxAge;
    return Math.max(0, 100 - (distance * 10));
  }

  // Calculate location compatibility
  private calculateLocationCompatibility(
    userLocations: string[],
    candidateLocation: string
  ): number {
    if (!userLocations || userLocations.length === 0) return 50;
    
    const userLocationLower = userLocations.map(loc => loc.toLowerCase());
    const candidateLocationLower = candidateLocation.toLowerCase();
    
    // Exact match
    if (userLocationLower.includes(candidateLocationLower)) return 100;
    
    // Partial match
    for (const userLoc of userLocationLower) {
      if (userLoc.includes(candidateLocationLower) || 
          candidateLocationLower.includes(userLoc)) {
        return 75;
      }
    }
    
    return 0;
  }

  // Calculate budget compatibility
  private calculateBudgetCompatibility(
    userBudget: number[],
    candidateBudgetRange: string
  ): number {
    if (!userBudget || userBudget.length !== 2) return 50;
    
    // Parse candidate budget (e.g., "$1200-$1800")
    const budgetMatch = candidateBudgetRange.match(/\$?(\d+)-?\$?(\d+)?/);
    if (!budgetMatch) return 50;
    
    const candidateMin = parseInt(budgetMatch[1]);
    const candidateMax = parseInt(budgetMatch[2] || budgetMatch[1]);
    
    const [userMin, userMax] = userBudget;
    
    // Calculate overlap
    const overlapMin = Math.max(userMin, candidateMin);
    const overlapMax = Math.min(userMax, candidateMax);
    
    if (overlapMin <= overlapMax) {
      const overlapRange = overlapMax - overlapMin;
      const totalRange = Math.max(userMax - userMin, candidateMax - candidateMin);
      return Math.min(100, (overlapRange / totalRange) * 100);
    }
    
    return 0;
  }

  // Calculate housing type compatibility
  private calculateHousingTypeCompatibility(
    userHousingType: string,
    candidateHousingType: string
  ): number {
    if (userHousingType === candidateHousingType) return 100;
    return 50; // Neutral for different housing types
  }

  // Calculate smoking compatibility
  private calculateSmokingCompatibility(
    userSmoking: boolean,
    candidateSmoking: boolean
  ): number {
    if (userSmoking === candidateSmoking) return 100;
    if (!userSmoking && candidateSmoking) return 0; // Non-smoker with smoker
    return 70; // Smoker with non-smoker (more tolerant)
  }

  // Calculate pet compatibility
  private calculatePetCompatibility(
    userHasPets: boolean,
    candidateHasPets: boolean
  ): number {
    if (userHasPets === candidateHasPets) return 100;
    return 60; // Different pet situations can work
  }

  // Calculate work schedule compatibility
  private calculateWorkScheduleCompatibility(
    userWorkSchedule: string,
    candidateWorkSchedule: string
  ): number {
    const scheduleCompatibilityMap: { [key: string]: { [key: string]: number } } = {
      'dayShift': { 'dayShift': 80, 'afternoonShift': 60, 'overnightShift': 100 },
      'afternoonShift': { 'dayShift': 60, 'afternoonShift': 80, 'overnightShift': 70 },
      'overnightShift': { 'dayShift': 100, 'afternoonShift': 70, 'overnightShift': 80 }
    };
    
    return scheduleCompatibilityMap[userWorkSchedule]?.[candidateWorkSchedule] || 50;
  }

  // Calculate hobbies compatibility
  private calculateHobbiesCompatibility(
    userHobbies: string[],
    candidateHobbies: string[]
  ): number {
    if (!userHobbies || !candidateHobbies || 
        userHobbies.length === 0 || candidateHobbies.length === 0) return 50;
    
    const commonHobbies = userHobbies.filter(hobby =>
      candidateHobbies.some(ch => 
        ch.toLowerCase().includes(hobby.toLowerCase()) ||
        hobby.toLowerCase().includes(ch.toLowerCase())
      )
    );
    
    const totalHobbies = Math.max(userHobbies.length, candidateHobbies.length);
    return Math.min(100, (commonHobbies.length / totalHobbies) * 100 + 30);
  }

  // Check if candidate meets required criteria
  private checkRequiredCriteria(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    userPreferences: UserPreferences
  ): { passes: boolean; failures: string[] } {
    const failures: string[] = [];

    // Check all required preferences
    Object.entries(userPreferences).forEach(([key, preference]) => {
      if (preference.importance === 'required') {
        let passes = true;
        let failureReason = '';

        switch (key) {
          case 'gender':
            if (currentUser.genderPreference && currentUser.genderPreference.length > 0) {
              if (!currentUser.genderPreference.includes('noPreference') && 
                  !currentUser.genderPreference.includes(candidate.gender)) {
                passes = false;
                failureReason = `Must be ${currentUser.genderPreference.join(' or ')}`;
              }
            }
            break;
          case 'location':
            if (currentUser.preferredLocation && currentUser.preferredLocation.length > 0) {
              const locationMatch = this.calculateLocationCompatibility(
                currentUser.preferredLocation, 
                candidate.preferred_location
              );
              if (locationMatch < 75) {
                passes = false;
                failureReason = `Must be in preferred location areas`;
              }
            }
            break;
          case 'smoking':
            if (!currentUser.smoking && candidate.smoking) {
              passes = false;
              failureReason = 'Must be non-smoker';
            }
            break;
          case 'budget':
            const budgetCompatibility = this.calculateBudgetCompatibility(
              currentUser.budgetRange || [0, 0], 
              candidate.budget_range
            );
            if (budgetCompatibility < 50) {
              passes = false;
              failureReason = 'Budget ranges must overlap';
            }
            break;
          // Add more required criteria checks as needed
        }

        if (!passes) {
          failures.push(failureReason);
        }
      }
    });

    return { passes: failures.length === 0, failures };
  }

  // Calculate overall compatibility score
  private calculateCompatibilityScore(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    userPreferences: UserPreferences
  ): CompatibilityAnalysis {
    const scores: CompatibilityAnalysis = {
      gender: this.calculateGenderCompatibility(
        currentUser.gender || '', 
        currentUser.genderPreference || [], 
        candidate.gender
      ),
      age: this.calculateAgeCompatibility(
        currentUser.ageRangePreference, 
        candidate.age
      ),
      nationality: 75, // Default - can be enhanced with nationality matching
      language: 75, // Default - can be enhanced with language matching
      ethnicity: 75, // Default - can be enhanced with ethnicity matching
      religion: 75, // Default - can be enhanced with religion matching
      occupation: 75, // Default - can be enhanced with occupation matching
      location: this.calculateLocationCompatibility(
        currentUser.preferredLocation || [], 
        candidate.preferred_location
      ),
      budget: this.calculateBudgetCompatibility(
        currentUser.budgetRange || [0, 0], 
        candidate.budget_range
      ),
      housingType: this.calculateHousingTypeCompatibility(
        currentUser.housingType || '', 
        candidate.housing_type
      ),
      livingSpace: this.calculateHousingTypeCompatibility(
        currentUser.livingSpace || '', 
        candidate.living_space
      ),
      smoking: this.calculateSmokingCompatibility(
        currentUser.smoking || false, 
        candidate.smoking
      ),
      pets: this.calculatePetCompatibility(
        currentUser.hasPets || false, 
        candidate.has_pets
      ),
      workSchedule: this.calculateWorkScheduleCompatibility(
        currentUser.workSchedule || '', 
        candidate.work_schedule
      ),
      diet: 75, // Default - can be enhanced with diet matching
      hobbies: this.calculateHobbiesCompatibility(
        currentUser.hobbies || [], 
        candidate.hobbies || []
      ),
      cleanliness: 75, // Default - not available in current data
      socialLevel: 75, // Default - not available in current data
      guests: 75, // Default - not available in current data
      sleepSchedule: 75 // Default - not available in current data
    };

    return scores;
  }

  // Generate match reasons
  private generateMatchReasons(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    compatibilityAnalysis: CompatibilityAnalysis
  ): string[] {
    const reasons: string[] = [];

    if (compatibilityAnalysis.location >= 90) {
      reasons.push(`Perfect location match in ${candidate.preferred_location}`);
    }
    if (compatibilityAnalysis.budget >= 80) {
      reasons.push('Compatible budget ranges');
    }
    if (compatibilityAnalysis.workSchedule >= 90) {
      reasons.push('Ideal work schedule compatibility');
    }
    if (compatibilityAnalysis.smoking === 100) {
      reasons.push(currentUser.smoking ? 'Both comfortable with smoking' : 'Both prefer smoke-free environment');
    }
    if (compatibilityAnalysis.pets === 100) {
      reasons.push(currentUser.hasPets ? 'Both are pet-friendly' : 'Both prefer no pets');
    }
    if (compatibilityAnalysis.hobbies >= 70) {
      const commonHobbies = (currentUser.hobbies || []).filter(hobby =>
        (candidate.hobbies || []).some(ch => 
          ch.toLowerCase().includes(hobby.toLowerCase())
        )
      );
      if (commonHobbies.length > 0) {
        reasons.push(`Shared interests: ${commonHobbies.slice(0, 2).join(', ')}`);
      }
    }

    return reasons.slice(0, 4);
  }

  // Main matching method
  async findMatches(criteria: CustomMatchCriteria): Promise<CustomMatchResult[]> {
    const { 
      currentUser, 
      currentUserId,
      userPreferences, 
      maxResults = 10, 
      minScore = 60 
    } = criteria;

    // Fetch candidate users from database
    const { data: candidates, error } = await supabase
      .from('roommate')
      .select('*')
      .order('created_at', { ascending: false });

    console.log("candidates===================>", candidates);

    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }

    const results: CustomMatchResult[] = [];

    for (const candidate of candidates || []) {
      // Skip self-matching if userId is provided
      if (currentUserId && candidate.user_id === currentUserId) {
        console.log(`Skipping self-match for user ${currentUserId}`);
        continue;
      }

      // Check required criteria first
      const requirementCheck = this.checkRequiredCriteria(
        currentUser, 
        candidate, 
        userPreferences
      );

      // Skip candidates who don't meet required criteria
      if (!requirementCheck.passes) {
        continue;
      }

      // Calculate compatibility scores
      const compatibilityAnalysis = this.calculateCompatibilityScore(
        currentUser, 
        candidate, 
        userPreferences
      );

      // Calculate weighted total score using user preferences
      let totalScore = 0;
      let totalWeight = 0;

      Object.entries(userPreferences).forEach(([key, preference]) => {
        const score = compatibilityAnalysis[key as keyof CompatibilityAnalysis];
        if (typeof score === 'number') {
          totalScore += score * preference.weight;
          totalWeight += preference.weight;
        }
      });

      // Normalize score
      const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;

      // Only include matches above minimum score
      if (normalizedScore >= minScore) {
        const matchReasons = this.generateMatchReasons(
          currentUser, 
          candidate, 
          compatibilityAnalysis
        );

        results.push({
          user: candidate,
          matchScore: Math.round(normalizedScore),
          matchReasons,
          compatibilityAnalysis,
          failedRequirements: []
        });
      }
    }

    // Sort by match score and limit results
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  // Convert to standard MatchResult format for compatibility
  convertToMatchResult(customResult: CustomMatchResult): MatchResult {
    const user = customResult.user;
    const budget = user.budget_range?.match(/\$?(\d+)-?\$?(\d+)?/);
    const budgetArray = budget ? [parseInt(budget[1]), parseInt(budget[2] || budget[1])] : [0, 0];

    return {
      name: user.full_name || "Unknown",
      age: user.age?.toString() || "N/A",
      gender: user.gender || "Not specified",
      occupation: "Professional",
      movingDate: user.move_in_date || "TBD",
      budget: budgetArray,
      location: user.preferred_location || "Any location",
      cleanliness: customResult.compatibilityAnalysis.cleanliness,
      pets: user.has_pets || false,
      smoking: user.smoking || false,
      drinking: "socially",
      guests: "sometimes",
      sleepSchedule: user.work_schedule?.includes("morning") ? "early" : "normal",
      workSchedule: user.work_schedule || "Not specified",
      interests: user.hobbies || [],
      traits: user.important_roommate_traits || [],
      preferredLiving: "findRoommate",
      compatibilityScore: customResult.matchScore,
      compatibilityBreakdown: {
        budget: customResult.compatibilityAnalysis.budget,
        location: customResult.compatibilityAnalysis.location,
        lifestyle: Math.round((
          customResult.compatibilityAnalysis.smoking + 
          customResult.compatibilityAnalysis.pets + 
          customResult.compatibilityAnalysis.diet
        ) / 3),
        schedule: customResult.compatibilityAnalysis.workSchedule,
        interests: customResult.compatibilityAnalysis.hobbies,
        cleanliness: customResult.compatibilityAnalysis.cleanliness
      }
    };
  }
}

// Export singleton instance
export const customPreferenceMatchingEngine = new CustomPreferenceMatchingEngine(); 