import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

export type PreferenceImportance = 'notImportant' | 'important' | 'must';

// Enhanced database roommate interface including all preference fields
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
  move_in_date_start?: string;
  move_in_date_end?: string;
  move_in_date: string; // Legacy field for compatibility
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
  
  // Enhanced preference fields
  age_range_preference?: number[];
  gender_preference?: string[];
  nationality_preference?: string;
  nationality_custom?: string;
  language_preference?: string;
  language_specific?: string;
  dietary_preferences?: string;
  dietary_other?: string;
  occupation_preference?: boolean;
  occupation_specific?: string;
  work_schedule_preference?: string;
  ethnicity_preference?: string;
  ethnicity_other?: string;
  religion_preference?: string;
  religion_other?: string;
  pet_specification?: string;
  smoking_preference?: string;
  
  // Importance fields for ideal roommate preferences
  age_range_preference_importance?: PreferenceImportance;
  gender_preference_importance?: PreferenceImportance;
  nationality_preference_importance?: PreferenceImportance;
  language_preference_importance?: PreferenceImportance;
  dietary_preferences_importance?: PreferenceImportance;
  occupation_preference_importance?: PreferenceImportance;
  work_schedule_preference_importance?: PreferenceImportance;
  ethnicity_preference_importance?: PreferenceImportance;
  religion_preference_importance?: PreferenceImportance;
  pet_preference_importance?: PreferenceImportance;
  smoking_preference_importance?: PreferenceImportance;
  
  created_at: string;
  updated_at: string;
}

export interface CustomMatchCriteria {
  currentUser: ProfileFormValues;
  currentUserId?: string;
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
  
  // Enhanced gender compatibility using detailed preferences
  private calculateGenderCompatibility(
    currentUserGender: string,
    currentUserGenderPreference: string[],
    candidateGender: string,
    candidateGenderPreference?: string[]
  ): number {
    // Check if current user's preference matches candidate's gender
    let userToCandidate = 80; // Default neutral score
    if (currentUserGenderPreference && currentUserGenderPreference.length > 0) {
      if (currentUserGenderPreference.includes('noPreference') || 
          currentUserGenderPreference.includes('any') ||
          currentUserGenderPreference.includes('no-preference')) {
        userToCandidate = 80;
      } else if (currentUserGenderPreference.some(pref => 
        pref.toLowerCase() === candidateGender.toLowerCase() ||
        (pref.toLowerCase() === 'male' && candidateGender.toLowerCase() === 'male') ||
        (pref.toLowerCase() === 'female' && candidateGender.toLowerCase() === 'female')
      )) {
        userToCandidate = 100;
      } else {
        userToCandidate = 0;
      }
    }

    // Check if candidate's preference matches current user's gender
    let candidateToUser = 80; // Default neutral score
    if (candidateGenderPreference && candidateGenderPreference.length > 0) {
      if (candidateGenderPreference.includes('noPreference') || 
          candidateGenderPreference.includes('any') ||
          candidateGenderPreference.includes('no-preference')) {
        candidateToUser = 80;
      } else if (candidateGenderPreference.some(pref => 
        pref.toLowerCase() === currentUserGender.toLowerCase() ||
        (pref.toLowerCase() === 'male' && currentUserGender.toLowerCase() === 'male') ||
        (pref.toLowerCase() === 'female' && currentUserGender.toLowerCase() === 'female')
      )) {
        candidateToUser = 100;
      } else {
        candidateToUser = 0;
      }
    }

    // Return the minimum to ensure mutual compatibility
    const finalScore = Math.min(userToCandidate, candidateToUser);
    return finalScore;
  }

  // Enhanced age compatibility using detailed preferences
  private calculateAgeCompatibility(
    currentUserAge: number,
    currentUserAgePreference: number[] | undefined,
    candidateAge: number,
    candidateAgePreference?: number[]
  ): number {
    // Check if candidate's age fits current user's preference
    let userToCandidate = 80; // Default neutral score
    if (currentUserAgePreference && currentUserAgePreference.length === 2) {
      const [minAge, maxAge] = currentUserAgePreference;
      if (candidateAge >= minAge && candidateAge <= maxAge) {
        userToCandidate = 100;
      } else {
        const distance = candidateAge < minAge ? minAge - candidateAge : candidateAge - maxAge;
        userToCandidate = Math.max(0, 100 - (distance * 8));
      }
    }

    // Check if current user's age fits candidate's preference
    let candidateToUser = 80; // Default neutral score
    if (candidateAgePreference && candidateAgePreference.length === 2) {
      const [minAge, maxAge] = candidateAgePreference;
      if (currentUserAge >= minAge && currentUserAge <= maxAge) {
        candidateToUser = 100;
      } else {
        const distance = currentUserAge < minAge ? minAge - currentUserAge : currentUserAge - maxAge;
        candidateToUser = Math.max(0, 100 - (distance * 8));
      }
    }

    // Return the minimum to ensure mutual compatibility
    const finalScore = Math.min(userToCandidate, candidateToUser);
    return finalScore;
  }

  // Calculate nationality compatibility using detailed preferences
  private calculateNationalityCompatibility(
    currentUserNationality: string,
    currentUserNationalityPreference: string,
    currentUserNationalityCustom: string,
    candidateNationality: string
  ): number {
    if (!currentUserNationalityPreference || currentUserNationalityPreference === 'noPreference') {
      return 75; // Neutral
    }

    if (currentUserNationalityPreference === 'sameCountry') {
      return currentUserNationality === candidateNationality ? 100 : 30;
    }

    if (currentUserNationalityPreference === 'custom' && currentUserNationalityCustom) {
      const customPreferences = currentUserNationalityCustom.toLowerCase().split(',').map(s => s.trim());
      const candidateNationalityLower = candidateNationality.toLowerCase();
      return customPreferences.some(pref => 
        pref.includes(candidateNationalityLower) || candidateNationalityLower.includes(pref)
      ) ? 100 : 20;
    }

    return 75; // Default neutral
  }

  // Calculate language compatibility using detailed preferences
  private calculateLanguageCompatibility(
    currentUserLanguage: string,
    currentUserLanguagePreference: string,
    currentUserLanguageSpecific: string,
    candidateLanguage: string
  ): number {
    if (!currentUserLanguagePreference || currentUserLanguagePreference === 'noPreference') {
      return 75; // Neutral
    }

    if (currentUserLanguagePreference === 'sameLanguage') {
      return currentUserLanguage === candidateLanguage ? 100 : 40;
    }

    if (currentUserLanguagePreference === 'specific' && currentUserLanguageSpecific) {
      const specificLanguages = currentUserLanguageSpecific.toLowerCase().split(',').map(s => s.trim());
      const candidateLanguageLower = candidateLanguage.toLowerCase();
      return specificLanguages.some(lang => 
        lang.includes(candidateLanguageLower) || candidateLanguageLower.includes(lang)
      ) ? 100 : 30;
    }

    return 75; // Default neutral
  }

  // Calculate ethnicity compatibility using detailed preferences
  private calculateEthnicityCompatibility(
    currentUserEthnicity: string,
    currentUserEthnicityPreference: string,
    currentUserEthnicityOther: string,
    candidateEthnicity: string
  ): number {
    if (!currentUserEthnicityPreference || currentUserEthnicityPreference === 'noPreference') {
      return 75; // Neutral
    }

    if (currentUserEthnicityPreference === 'same') {
      return currentUserEthnicity === candidateEthnicity ? 100 : 30;
    }

    if (currentUserEthnicityPreference === 'others' && currentUserEthnicityOther) {
      const otherEthnicities = currentUserEthnicityOther.toLowerCase().split(',').map(s => s.trim());
      const candidateEthnicityLower = candidateEthnicity.toLowerCase();
      return otherEthnicities.some(eth => 
        eth.includes(candidateEthnicityLower) || candidateEthnicityLower.includes(eth)
      ) ? 100 : 20;
    }

    return 75; // Default neutral
  }

  // Calculate religion compatibility using detailed preferences
  private calculateReligionCompatibility(
    currentUserReligion: string,
    currentUserReligionPreference: string,
    currentUserReligionOther: string,
    candidateReligion: string
  ): number {
    if (!currentUserReligionPreference || currentUserReligionPreference === 'noPreference') {
      return 75; // Neutral
    }

    if (currentUserReligionPreference === 'same') {
      return currentUserReligion === candidateReligion ? 100 : 25;
    }

    if (currentUserReligionPreference === 'others' && currentUserReligionOther) {
      const otherReligions = currentUserReligionOther.toLowerCase().split(',').map(s => s.trim());
      const candidateReligionLower = candidateReligion.toLowerCase();
      return otherReligions.some(rel => 
        rel.includes(candidateReligionLower) || candidateReligionLower.includes(rel)
      ) ? 100 : 20;
    }

    return 75; // Default neutral
  }

  // Calculate occupation compatibility using detailed preferences
  private calculateOccupationCompatibility(
    currentUserOccupation: string,
    currentUserOccupationPreference: boolean,
    currentUserOccupationSpecific: string,
    candidateOccupation: string
  ): number {
    if (!currentUserOccupationPreference) {
      return 75; // Neutral - no specific preference
    }

    if (currentUserOccupationSpecific) {
      const specificOccupations = currentUserOccupationSpecific.toLowerCase().split(',').map(s => s.trim());
      const candidateOccupationLower = candidateOccupation.toLowerCase();
      return specificOccupations.some(occ => 
        occ.includes(candidateOccupationLower) || candidateOccupationLower.includes(occ)
      ) ? 100 : 30;
    }

    // If preference is enabled but no specific occupation mentioned, prefer similar occupations
    return currentUserOccupation === candidateOccupation ? 100 : 60;
  }

  // Enhanced location compatibility
  private calculateLocationCompatibility(
    userLocations: string[],
    candidateLocation: string
  ): number {
    if (!userLocations || userLocations.length === 0) return 50;
    
    const userLocationLower = userLocations.map(loc => loc.toLowerCase());
    const candidateLocationLower = candidateLocation.toLowerCase();
    
    // Exact match
    if (userLocationLower.includes(candidateLocationLower)) return 100;
    
    // Partial match (city within region, etc.)
    for (const userLoc of userLocationLower) {
      if (userLoc.includes(candidateLocationLower) || 
          candidateLocationLower.includes(userLoc)) {
        return 85;
      }
    }
    
    // Check for nearby areas (basic keyword matching)
    const proximityKeywords = ['near', 'close', 'adjacent', 'metro', 'area', 'district'];
    for (const userLoc of userLocationLower) {
      for (const keyword of proximityKeywords) {
        if (userLoc.includes(keyword) && candidateLocationLower.includes(keyword)) {
          return 60;
        }
      }
    }
    
    return 0;
  }

  // Enhanced budget compatibility
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
      const userRange = userMax - userMin;
      const candidateRange = candidateMax - candidateMin;
      const avgRange = (userRange + candidateRange) / 2;
      
      if (avgRange === 0) return 100; // Both have exact amounts
      
      const overlapPercentage = (overlapRange / avgRange) * 100;
      return Math.min(100, Math.max(60, overlapPercentage)); // At least 60% for any overlap
    }
    
    // No overlap - calculate distance penalty
    const distance = overlapMin - overlapMax;
    const penaltyPercentage = Math.min(50, (distance / userMax) * 100);
    return Math.max(0, 50 - penaltyPercentage);
  }

  // Enhanced work schedule compatibility using detailed preferences
  private calculateWorkScheduleCompatibility(
    currentUserWorkSchedule: string,
    currentUserWorkSchedulePreference: string,
    candidateWorkSchedule: string
  ): number {
    // If user has a specific work schedule preference
    if (currentUserWorkSchedulePreference && currentUserWorkSchedulePreference !== 'noPreference') {
      if (currentUserWorkSchedulePreference === 'opposite') {
        // User wants opposite schedules for more personal space
        const oppositeMatches: { [key: string]: string[] } = {
          'dayShift': ['afternoonShift', 'overnightShift'],
          'afternoonShift': ['dayShift', 'overnightShift'],
          'overnightShift': ['dayShift', 'afternoonShift']
        };
        return oppositeMatches[currentUserWorkSchedule]?.includes(candidateWorkSchedule) ? 100 : 20;
      } else {
        // User wants specific schedule match
        return currentUserWorkSchedulePreference === candidateWorkSchedule ? 100 : 30;
      }
    }

    // Default compatibility based on schedule harmony
    const scheduleCompatibilityMap: { [key: string]: { [key: string]: number } } = {
      'dayShift': { 'dayShift': 85, 'afternoonShift': 70, 'overnightShift': 95 },
      'afternoonShift': { 'dayShift': 70, 'afternoonShift': 85, 'overnightShift': 75 },
      'overnightShift': { 'dayShift': 95, 'afternoonShift': 75, 'overnightShift': 85 }
    };
    
    return scheduleCompatibilityMap[currentUserWorkSchedule]?.[candidateWorkSchedule] || 50;
  }

  // Enhanced pet compatibility using detailed preferences
  private calculatePetCompatibility(
    currentUserHasPets: boolean,
    currentUserPetPreference: string,
    currentUserPetSpecification: string,
    candidateHasPets: boolean,
    candidatePetPreference?: string
  ): number {
    if (!currentUserPetPreference || currentUserPetPreference === 'noPets') {
      if (candidateHasPets) return 0; // User doesn't want pets, candidate has pets
      return 100; // Both prefer no pets
    }

    if (currentUserPetPreference === 'catOk') {
      if (!candidateHasPets) return 90; // User ok with cats, candidate has none
      // Check if candidate has cats (would need more detailed pet data)
      return 85; // Assume moderate compatibility
    }

    if (currentUserPetPreference === 'smallPetsOk') {
      if (!candidateHasPets) return 90; // User ok with small pets, candidate has none
      return 80; // Assume good compatibility with small pets
    }

    // Default: both have pets or are pet-friendly
    return currentUserHasPets === candidateHasPets ? 100 : 70;
  }

  // Enhanced smoking compatibility using detailed preferences
  private calculateSmokingCompatibility(
    currentUserSmoking: boolean,
    currentUserSmokingPreference: string,
    candidateSmoking: boolean
  ): number {
    if (!currentUserSmokingPreference || currentUserSmokingPreference === 'noSmoking') {
      if (candidateSmoking) return 0; // User doesn't want smoking, candidate smokes
      return 100; // Both prefer no smoking
    }

    if (currentUserSmokingPreference === 'noVaping') {
      // Assuming smoking includes vaping, this is stricter than general smoking
      if (candidateSmoking) return 20; // Low compatibility
      return 100; // Candidate doesn't smoke/vape
    }

    if (currentUserSmokingPreference === 'socialOk') {
      if (!candidateSmoking) return 90; // User ok with social smoking, candidate doesn't smoke
      return 85; // User ok with social smoking, candidate smokes
    }

    // Default compatibility
    return currentUserSmoking === candidateSmoking ? 100 : 60;
  }

  // Enhanced diet compatibility using detailed preferences
  private calculateDietCompatibility(
    currentUserDiet: string,
    currentUserDietaryPreferences: string,
    currentUserDietaryOther: string,
    candidateDiet: string
  ): number {
    if (!currentUserDietaryPreferences || currentUserDietaryPreferences === 'noPreference') {
      return 75; // Neutral
    }

    // Exact match preference
    if (currentUserDietaryPreferences === candidateDiet) {
      return 100;
    }

    // Compatibility matrix for different diets
    const dietCompatibility: { [key: string]: { [key: string]: number } } = {
      'vegetarian': {
        'vegetarian': 100, 'halal': 85, 'kosher': 85, 'others': 40, 
        'noPreference': 60, 'vegan': 95
      },
      'halal': {
        'halal': 100, 'vegetarian': 80, 'kosher': 70, 'others': 40, 
        'noPreference': 50, 'pescatarian': 70
      },
      'kosher': {
        'kosher': 100, 'vegetarian': 80, 'halal': 70, 'others': 40, 
        'noPreference': 50, 'pescatarian': 70
      },
      'others': {
        'others': 100, 'vegetarian': 70, 'halal': 60, 'kosher': 60, 
        'noPreference': 80, 'paleo': 90, 'keto': 85, 'vegan': 70
      }
    };

    if (currentUserDietaryPreferences === 'others' && currentUserDietaryOther) {
      const customDiets = currentUserDietaryOther.toLowerCase().split(',').map(s => s.trim());
      const candidateDietLower = candidateDiet.toLowerCase();
      return customDiets.some(diet => 
        diet.includes(candidateDietLower) || candidateDietLower.includes(diet)
      ) ? 100 : 50;
    }

    return dietCompatibility[currentUserDietaryPreferences]?.[candidateDiet] || 50;
  }

  // Enhanced hobbies compatibility
  private calculateHobbiesCompatibility(
    currentUserHobbies: string[],
    currentUserRoommateHobbies: string[],
    candidateHobbies: string[]
  ): number {
    const allUserHobbies = [...(currentUserHobbies || []), ...(currentUserRoommateHobbies || [])];
    
    if (!allUserHobbies || !candidateHobbies || 
        allUserHobbies.length === 0 || candidateHobbies.length === 0) return 50;
    
    // Find common hobbies
    const commonHobbies = allUserHobbies.filter(hobby =>
      candidateHobbies.some(ch => 
        ch.toLowerCase().includes(hobby.toLowerCase()) ||
        hobby.toLowerCase().includes(ch.toLowerCase())
      )
    );
    
    const totalUniqueHobbies = new Set([...allUserHobbies, ...candidateHobbies]).size;
    const commonHobbyScore = totalUniqueHobbies > 0 ? (commonHobbies.length / totalUniqueHobbies) * 100 : 0;
    
    // Bonus for having any common interests
    const bonusScore = commonHobbies.length > 0 ? 30 : 0;
    
    return Math.min(100, commonHobbyScore + bonusScore);
  }

  // Enhanced required criteria checking using detailed preferences - HARD FILTER
  private checkRequiredCriteria(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    userPreferences: UserPreferences
  ): { passes: boolean; failures: string[] } {
    const failures: string[] = [];
    
    // Check all required preferences with HARD FILTER logic
    Object.entries(userPreferences).forEach(([key, preference]) => {
      if (preference.importance === 'must') {
        let passes = true;
        let failureReason = '';

        switch (key) {
          case 'gender':
            // Use the user's gender preference to filter candidates
            if (currentUser.genderPreference && currentUser.genderPreference.length > 0) {
              const genderScore = this.calculateGenderCompatibility(
                currentUser.gender || '',
                currentUser.genderPreference || [],
                candidate.gender,
                candidate.gender_preference
              );
              // Hard filter: 0 tolerance for gender mismatch when it's a MUST
              if (genderScore < 80) {
                passes = false;
                failureReason = `❌ Gender preference REQUIRED: Want ${JSON.stringify(currentUser.genderPreference)}, Candidate is ${candidate.gender} (score: ${genderScore})`;
              }
            }
            break;

          case 'age':
            // Use the user's age range preference to filter candidates
            if (currentUser.ageRangePreference && currentUser.ageRangePreference.length === 2) {
              const ageScore = this.calculateAgeCompatibility(
                parseInt(currentUser.age || '25'),
                currentUser.ageRangePreference,
                candidate.age,
                candidate.age_range_preference
              );
              // Hard filter: Strict age requirement when it's a MUST
              if (ageScore < 70) {
                passes = false;
                failureReason = `❌ Age range REQUIRED: Want ${currentUser.ageRangePreference[0]}-${currentUser.ageRangePreference[1]}, Candidate is ${candidate.age} (score: ${ageScore})`;
              }
            }
            break;

          case 'diet':
            // Use the user's dietary preferences to filter candidates
            if (currentUser.dietaryPreferences && currentUser.dietaryPreferences !== 'noPreference') {
              const dietScore = this.calculateDietCompatibility(
                currentUser.diet || '',
                currentUser.dietaryPreferences || 'noPreference',
                currentUser.dietaryOther || '',
                candidate.diet
              );
              // Hard filter: Dietary compatibility is essential when MUST
              if (dietScore < 70) {
                passes = false;
                failureReason = `❌ Dietary preference REQUIRED: Want ${currentUser.dietaryPreferences}, Candidate has ${candidate.diet} (score: ${dietScore})`;
              }
            }
            break;

          case 'smoking':
            // Use the user's smoking preferences to filter candidates
            if (currentUser.smokingPreference && currentUser.smokingPreference !== 'noSmoking') {
              const smokingScore = this.calculateSmokingCompatibility(
                currentUser.smoking || false,
                currentUser.smokingPreference || 'noSmoking',
                candidate.smoking
              );
              // Hard filter: Smoking is a dealbreaker when MUST
              if (smokingScore < 80) {
                passes = false;
                failureReason = `❌ Smoking policy REQUIRED: Want ${currentUser.smokingPreference}, Candidate ${candidate.smoking ? 'smokes' : "doesn't smoke"} (score: ${smokingScore})`;
              }
            } else {
              const smokingScore = this.calculateSmokingCompatibility(
                currentUser.smoking || false,
                currentUser.smokingPreference || 'noSmoking',
                candidate.smoking
              );
              if (smokingScore < 80) {
                passes = false;
                failureReason = `❌ Smoking policy REQUIRED: User prefers no smoking, but candidate ${candidate.smoking ? 'smokes' : "doesn't smoke"} (score: ${smokingScore})`;
              }
            }
            break;

          case 'pets':
            // Use the user's pet preferences to filter candidates
            if (currentUser.petPreference && currentUser.petPreference !== 'noPets') {
              const petScore = this.calculatePetCompatibility(
                currentUser.hasPets || false,
                currentUser.petPreference || 'noPets',
                currentUser.petSpecification || '',
                candidate.has_pets,
                candidate.pet_preference
              );
              // Hard filter: Pet policy is non-negotiable when MUST
              if (petScore < 70) {
                passes = false;
                failureReason = `❌ Pet policy REQUIRED: Want ${currentUser.petPreference}, Candidate ${candidate.has_pets ? 'has pets' : 'no pets'} (score: ${petScore})`;
              }
            } else {
              const petScore = this.calculatePetCompatibility(
                currentUser.hasPets || false,
                currentUser.petPreference || 'noPets',
                currentUser.petSpecification || '',
                candidate.has_pets,
                candidate.pet_preference
              );
              if (petScore < 70) {
                passes = false;
                failureReason = `❌ Pet policy REQUIRED: User prefers no pets, but candidate ${candidate.has_pets ? 'has pets' : 'no pets'} (score: ${petScore})`;
              }
            }
            break;

          case 'workSchedule':
            // Use the user's work schedule preferences to filter candidates
            if (currentUser.workSchedulePreference && currentUser.workSchedulePreference !== 'noPreference') {
              const scheduleScore = this.calculateWorkScheduleCompatibility(
                currentUser.workSchedule || '',
                currentUser.workSchedulePreference || 'noPreference',
                candidate.work_schedule
              );
              // Hard filter: Work schedule compatibility is essential when MUST
              if (scheduleScore < 70) {
                passes = false;
                failureReason = `❌ Work schedule REQUIRED: Want ${currentUser.workSchedulePreference}, Candidate has ${candidate.work_schedule} (score: ${scheduleScore})`;
              }
            }
            break;

          case 'location':
            if (currentUser.preferredLocation && currentUser.preferredLocation.length > 0) {
              const locationMatch = this.calculateLocationCompatibility(
                currentUser.preferredLocation, 
                candidate.preferred_location
              );
              // Hard filter: Location is critical - no tolerance for mismatch when MUST
              if (locationMatch < 70) {
                passes = false;
                failureReason = `❌ Location REQUIRED: Want ${currentUser.preferredLocation.join(', ')}, Candidate in ${candidate.preferred_location} (score: ${locationMatch})`;
              }
            }
            break;

          case 'budget':
            if (currentUser.budgetRange && currentUser.budgetRange.length === 2) {
              const budgetCompatibility = this.calculateBudgetCompatibility(
                currentUser.budgetRange || [0, 0], 
                candidate.budget_range
              );
              // Hard filter: Budget overlap is essential when MUST
              if (budgetCompatibility < 60) {
                passes = false;
                failureReason = `❌ Budget REQUIRED: Want $${currentUser.budgetRange?.[0]}-$${currentUser.budgetRange?.[1]}, Candidate has ${candidate.budget_range} (score: ${budgetCompatibility})`;
              }
            }
            break;

          case 'nationality':
            // Use the user's nationality preferences to filter candidates
            if (currentUser.nationalityPreference && currentUser.nationalityPreference !== 'noPreference') {
              const nationalityScore = this.calculateNationalityCompatibility(
                currentUser.nationality || '',
                currentUser.nationalityPreference || 'noPreference',
                currentUser.nationalityCustom || '',
                candidate.nationality_preference || ''
              );
              // Hard filter for nationality when it's a MUST
              if (nationalityScore < 80) {
                passes = false;
                failureReason = `❌ Nationality REQUIRED: Want ${currentUser.nationalityPreference}, Candidate nationality unknown or incompatible (score: ${nationalityScore})`;
              }
            }
            break;

          case 'language':
            // Use the user's language preferences to filter candidates
            if (currentUser.languagePreference && currentUser.languagePreference !== 'noPreference') {
              const languageScore = this.calculateLanguageCompatibility(
                currentUser.language || '',
                currentUser.languagePreference || 'noPreference',
                currentUser.languageSpecific || '',
                candidate.language_preference || ''
              );
              // Hard filter for language when it's a MUST
              if (languageScore < 70) {
                passes = false;
                failureReason = `❌ Language REQUIRED: Want ${currentUser.languagePreference}, Candidate language unknown or incompatible (score: ${languageScore})`;
              }
            }
            break;

          default:
            break;
        }

        if (!passes) {
          failures.push(failureReason);
        }
      }
    });

    const overallPasses = failures.length === 0;
    
    return { passes: overallPasses, failures };
  }

  // Enhanced compatibility score calculation
  private calculateCompatibilityScore(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    userPreferences: UserPreferences
  ): CompatibilityAnalysis {
    const currentUserAge = parseInt(currentUser.age || '25');
    
    const scores: CompatibilityAnalysis = {
      gender: this.calculateGenderCompatibility(
        currentUser.gender || '', 
        currentUser.genderPreference || [], 
        candidate.gender,
        candidate.gender_preference
      ),
      age: this.calculateAgeCompatibility(
        currentUserAge,
        currentUser.ageRangePreference, 
        candidate.age,
        candidate.age_range_preference
      ),
      nationality: this.calculateNationalityCompatibility(
        currentUser.nationality || '',
        currentUser.nationalityPreference || 'noPreference',
        currentUser.nationalityCustom || '',
        candidate.nationality_preference || ''
      ),
      language: this.calculateLanguageCompatibility(
        currentUser.language || '',
        currentUser.languagePreference || 'noPreference',
        currentUser.languageSpecific || '',
        candidate.language_preference || ''
      ),
      ethnicity: this.calculateEthnicityCompatibility(
        currentUser.ethnicity || '',
        currentUser.ethnicityPreference || 'noPreference',
        currentUser.ethnicityOther || '',
        candidate.ethnicity_preference || ''
      ),
      religion: this.calculateReligionCompatibility(
        currentUser.religion || '',
        currentUser.religionPreference || 'noPreference',
        currentUser.religionOther || '',
        candidate.religion_preference || ''
      ),
      occupation: this.calculateOccupationCompatibility(
        currentUser.occupation || '',
        currentUser.occupationPreference || false,
        currentUser.occupationSpecific || '',
        candidate.occupation_specific || ''
      ),
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
        currentUser.smokingPreference || 'noSmoking',
        candidate.smoking
      ),
      pets: this.calculatePetCompatibility(
        currentUser.hasPets || false,
        currentUser.petPreference || 'noPets',
        currentUser.petSpecification || '',
        candidate.has_pets,
        candidate.pet_preference
      ),
      workSchedule: this.calculateWorkScheduleCompatibility(
        currentUser.workSchedule || '',
        currentUser.workSchedulePreference || 'noPreference',
        candidate.work_schedule
      ),
      diet: this.calculateDietCompatibility(
        currentUser.diet || '',
        currentUser.dietaryPreferences || 'noPreference',
        currentUser.dietaryOther || '',
        candidate.diet
      ),
      hobbies: this.calculateHobbiesCompatibility(
        currentUser.hobbies || [], 
        currentUser.roommateHobbies || [],
        candidate.hobbies || []
      ),
      cleanliness: 75, // Default - not available in current data
      socialLevel: 75, // Default - not available in current data
      guests: 75, // Default - not available in current data
      sleepSchedule: 75 // Default - not available in current data
    };

    return scores;
  }

  // Enhanced match reasons generation
  private generateMatchReasons(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    compatibilityAnalysis: CompatibilityAnalysis
  ): string[] {
    const reasons: string[] = [];

    if (compatibilityAnalysis.location >= 95) {
      reasons.push(`✨ Perfect location match in ${candidate.preferred_location}`);
    } else if (compatibilityAnalysis.location >= 85) {
      reasons.push(`📍 Great location compatibility in ${candidate.preferred_location}`);
    }

    if (compatibilityAnalysis.budget >= 90) {
      reasons.push(`💰 Excellent budget alignment`);
    } else if (compatibilityAnalysis.budget >= 70) {
      reasons.push(`💵 Compatible budget ranges`);
    }

    if (compatibilityAnalysis.workSchedule >= 95) {
      reasons.push(`⏰ Perfect work schedule compatibility`);
    } else if (compatibilityAnalysis.workSchedule >= 80) {
      reasons.push(`🕐 Great schedule harmony`);
    }

    if (compatibilityAnalysis.smoking === 100) {
      reasons.push(currentUser.smoking ? '🚬 Both comfortable with smoking' : '🚭 Both prefer smoke-free environment');
    }

    if (compatibilityAnalysis.pets === 100) {
      reasons.push(currentUser.hasPets ? '🐕 Both are pet lovers' : '🏠 Both prefer pet-free living');
    }

    if (compatibilityAnalysis.diet >= 85) {
      reasons.push(`🍽️ Compatible dietary preferences`);
    }

    if (compatibilityAnalysis.hobbies >= 80) {
      const commonHobbies = (currentUser.hobbies || []).filter(hobby =>
        (candidate.hobbies || []).some(ch => 
          ch.toLowerCase().includes(hobby.toLowerCase())
        )
      );
      if (commonHobbies.length > 0) {
        reasons.push(`🎯 Shared interests: ${commonHobbies.slice(0, 2).join(', ')}`);
      }
    }

    if (compatibilityAnalysis.gender >= 95) {
      reasons.push(`👤 Mutual gender preference match`);
    }

    if (compatibilityAnalysis.age >= 95) {
      reasons.push(`🎂 Perfect age compatibility`);
    }

    return reasons.slice(0, 5); // Return top 5 reasons
  }

  // Calculate housing type compatibility
  private calculateHousingTypeCompatibility(
    userHousingType: string,
    candidateHousingType: string
  ): number {
    if (userHousingType === candidateHousingType) return 100;
    return 50; // Neutral for different housing types
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

    try {
      // Step 1: Fetch current user's complete database record to get their preferences
      let currentUserDbRecord: DatabaseUser | null = null;
      
      if (currentUserId) {
        const { data: userRecord, error: userError } = await supabase
          .from('roommate')
          .select('*')
          .eq('user_id', currentUserId)
          .single();

        if (userError) {
          // Silently handle error
        } else if (userRecord) {
          currentUserDbRecord = userRecord;
        }
      }

      // Step 2: Create enhanced current user data by merging ProfileFormValues with database preferences
      const enhancedCurrentUser: ProfileFormValues = {
        ...currentUser,
        // Override with database preferences if they exist, with proper type casting
        ageRangePreference: currentUserDbRecord?.age_range_preference || currentUser.ageRangePreference,
        genderPreference: currentUserDbRecord?.gender_preference || currentUser.genderPreference,
        nationalityPreference: (currentUserDbRecord?.nationality_preference as "custom" | "sameCountry" | "noPreference") || currentUser.nationalityPreference,
        nationalityCustom: currentUserDbRecord?.nationality_custom || currentUser.nationalityCustom,
        languagePreference: (currentUserDbRecord?.language_preference as "sameLanguage" | "specific" | "noPreference") || currentUser.languagePreference,
        languageSpecific: currentUserDbRecord?.language_specific || currentUser.languageSpecific,
        dietaryPreferences: (currentUserDbRecord?.dietary_preferences as "vegetarian" | "halal" | "kosher" | "others" | "noPreference") || currentUser.dietaryPreferences,
        dietaryOther: currentUserDbRecord?.dietary_other || currentUser.dietaryOther,
        smokingPreference: (currentUserDbRecord?.smoking_preference as "noSmoking" | "noVaping" | "socialOk") || currentUser.smokingPreference,
        workSchedulePreference: (currentUserDbRecord?.work_schedule_preference as "dayShift" | "overnightShift" | "noPreference" | "opposite" | "afternoonShift") || currentUser.workSchedulePreference,
        ethnicityPreference: (currentUserDbRecord?.ethnicity_preference as "noPreference" | "same" | "others") || currentUser.ethnicityPreference,
        ethnicityOther: currentUserDbRecord?.ethnicity_other || currentUser.ethnicityOther,
        religionPreference: (currentUserDbRecord?.religion_preference as "noPreference" | "same" | "others") || currentUser.religionPreference,
        religionOther: currentUserDbRecord?.religion_other || currentUser.religionOther,
        occupationPreference: currentUserDbRecord?.occupation_preference || currentUser.occupationPreference,
        occupationSpecific: currentUserDbRecord?.occupation_specific || currentUser.occupationSpecific,
        petSpecification: currentUserDbRecord?.pet_specification || currentUser.petSpecification
      };



      // Step 3: Fetch all roommate records for matching
      const { data: candidates, error } = await supabase
        .from('roommate')
        .select('*')
        .order('created_at', { ascending: false });



      if (error) {
        return [];
      }

      if (!candidates || candidates.length === 0) {
        return [];
      }

      // If only one candidate and it's the current user, RLS policy is restricting access
      if (candidates.length === 1 && currentUserId && candidates[0].user_id === currentUserId) {
        return [];
      }

      // HARD FILTER Statistics
      const mustHaveRequirements = Object.entries(userPreferences)
        .filter(([_, preference]) => preference.importance === 'must')
        .map(([key, _]) => key);
      

      
      // Statistics tracking
      let selfExcluded = 0;
      let hardFilteredOut = 0;
      let lowScoreFiltered = 0;
      let finalResults = 0;

      const results: CustomMatchResult[] = [];

      for (const candidate of candidates || []) {
        // Skip self-matching if userId is provided
        if (currentUserId && candidate.user_id === currentUserId) {
          selfExcluded++;
          continue;
        }

        // 🚫 HARD FILTER - Check required criteria first using enhanced current user data
        const requirementCheck = this.checkRequiredCriteria(
          enhancedCurrentUser, 
          candidate, 
          userPreferences
        );

        // Skip candidates who don't meet required criteria (HARD FILTER)
        if (!requirementCheck.passes) {
          hardFilteredOut++;
          continue;
        }

        // Calculate compatibility scores using enhanced current user data
        const compatibilityAnalysis = this.calculateCompatibilityScore(
          enhancedCurrentUser, 
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
            enhancedCurrentUser, 
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
          finalResults++;
        } else {
          lowScoreFiltered++;
        }
      }



      // Sort by match score and limit results
      const sortedResults = results
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, maxResults);
        
      return sortedResults;
    } catch (error) {
      return [];
    }
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