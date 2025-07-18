import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

export type PreferenceImportance = 'notImportant' | 'important' | 'must';

// Enhanced database roommate interface including all preference fields and importance
export interface DatabaseUser {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  email: string;
  phone_number: string;
  linkedin_profile?: string;
  preferred_location: string | string[] | null;
  budget_range: string | number[] | null;
  move_in_date_start?: string;
  move_in_date_end?: string;
  
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
  
  // Actual demographic information
  nationality?: string;
  language?: string;
  ethnicity?: string;
  religion?: string;
  
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

export interface IdealRoommateMatchCriteria {
  currentUser: ProfileFormValues;
  currentUserId?: string;
  maxResults?: number;
  minScore?: number;
}

export interface IdealRoommateMatchResult {
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

// Importance weight mapping
const IMPORTANCE_WEIGHTS = {
  notImportant: 0.3,
  important: 0.7,
  must: 1.0
};

class IdealRoommateMatchingEngine {
  
  // Basic compatibility calculations
  private calculateGenderCompatibility(
    currentUserGender: string,
    currentUserGenderPreference: string[],
    candidateGender: string
  ): number {
    if (!currentUserGenderPreference || currentUserGenderPreference.length === 0) {
      return 75; // Neutral
    }
    
    if (currentUserGenderPreference.includes('noPreference') || 
        currentUserGenderPreference.includes('any')) {
      return 85;
    }
    
    const matches = currentUserGenderPreference.some(pref => 
      pref.toLowerCase() === candidateGender.toLowerCase()
    );
    
    return matches ? 100 : 20;
  }

  private calculateAgeCompatibility(
    currentUserAge: number,
    currentUserAgePreference: number[],
    candidateAge: number
  ): number {
    if (!currentUserAgePreference || currentUserAgePreference.length !== 2) {
      return 75; // Neutral
    }
    
    const [minAge, maxAge] = currentUserAgePreference;
    
    if (candidateAge >= minAge && candidateAge <= maxAge) {
      return 100;
    }
    
    // For strict age filtering: anyone outside range gets 0 score
    // This ensures "must" importance will filter them out completely
    return 0;
  }

  private calculateLocationCompatibility(
    userLocations: string[],
    candidateLocation: string[] | null | undefined
  ): number {
    if (!userLocations || userLocations.length === 0) return 50;
    if (!candidateLocation || !Array.isArray(candidateLocation) || candidateLocation.length === 0) return 30;
    
    const userLocationLower = userLocations.map(loc => loc.toLowerCase());
    const candidateLocationLower = candidateLocation.map(loc => loc.toLowerCase());
    
    // Exact match - any user location matches any candidate location
    for (const userLoc of userLocationLower) {
      if (candidateLocationLower.includes(userLoc)) return 100;
    }
    
    // Partial match
    for (const userLoc of userLocationLower) {
      for (const candidateLoc of candidateLocationLower) {
        if (userLoc.includes(candidateLoc) || candidateLoc.includes(userLoc)) {
          return 85;
        }
      }
    }
    
    return 20;
  }

  private calculateBudgetCompatibility(
    userBudget: number[],
    candidateBudget: number[] | null
  ): number {
    if (!userBudget || userBudget.length !== 2) return 50;
    if (!candidateBudget || !Array.isArray(candidateBudget) || candidateBudget.length !== 2) return 50;
    
    const candidateMin = candidateBudget[0];
    const candidateMax = candidateBudget[1];
    
    const [userMin, userMax] = userBudget;
    
    // Check for overlap
    const overlapMin = Math.max(userMin, candidateMin);
    const overlapMax = Math.min(userMax, candidateMax);
    
    if (overlapMin <= overlapMax) {
      const overlapSize = overlapMax - overlapMin;
      const userRange = userMax - userMin;
      const overlapPercentage = overlapSize / userRange;
      return Math.min(100, 60 + (overlapPercentage * 40));
    }
    
    return 10;
  }

  private calculateSmokingCompatibility(
    currentUserSmoking: boolean,
    currentUserSmokingPreference: string,
    candidateSmoking: boolean
  ): number {
    if (currentUserSmokingPreference === 'socialOk') return 90;
    
    if (currentUserSmokingPreference === 'noSmoking' || 
        currentUserSmokingPreference === 'noVaping') {
      return candidateSmoking ? 0 : 100;
    }
    
    return currentUserSmoking === candidateSmoking ? 100 : 30;
  }

  private calculatePetCompatibility(
    currentUserHasPets: boolean,
    currentUserPetPreference: string,
    candidateHasPets: boolean
  ): number {
    if (currentUserPetPreference === 'noPets') {
      return candidateHasPets ? 0 : 100;
    }
    
    if (currentUserPetPreference === 'catOk' || 
        currentUserPetPreference === 'smallPetsOk') {
      return 85; // Generally compatible
    }
    
    return currentUserHasPets === candidateHasPets ? 100 : 70;
  }

  private calculateDietCompatibility(
    currentUserDiet: string,
    currentUserDietaryPreferences: string,
    candidateDiet: string
  ): number {
    if (!currentUserDietaryPreferences || 
        currentUserDietaryPreferences === 'noPreference') {
      return 75;
    }
    
    if (currentUserDietaryPreferences === candidateDiet) {
      return 100;
    }
    
    // Basic compatibility matrix
    const compatibilityMap: { [key: string]: { [key: string]: number } } = {
      vegetarian: { vegetarian: 100, halal: 80, kosher: 80, noPreference: 60 },
      halal: { halal: 100, vegetarian: 85, kosher: 70, noPreference: 50 },
      kosher: { kosher: 100, vegetarian: 85, halal: 70, noPreference: 50 }
    };
    
    return compatibilityMap[currentUserDietaryPreferences]?.[candidateDiet] || 50;
  }

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

  private calculateNationalityCompatibility(
    currentUserNationality: string,
    currentUserNationalityPreference: string,
    currentUserNationalityCustom: string,
    candidateNationality: string
  ): number {
    if (currentUserNationalityPreference === 'noPreference') {
      return 75; // Neutral - no specific preference
    }

    if (currentUserNationalityPreference === 'sameCountry') {
      if (!candidateNationality) {
        return 50; // Missing data, but not completely negative
      }
      return currentUserNationality.toLowerCase() === candidateNationality.toLowerCase() ? 100 : 30;
    }

    if (currentUserNationalityPreference === 'custom' && currentUserNationalityCustom) {
      if (!candidateNationality) {
        return 50; // Missing data, but not completely negative
      }
      const preferredNationalities = currentUserNationalityCustom.toLowerCase().split(',').map(s => s.trim());
      const candidateNationalityLower = candidateNationality.toLowerCase();
      return preferredNationalities.some(nat => 
        nat.includes(candidateNationalityLower) || candidateNationalityLower.includes(nat)
      ) ? 100 : 30;
    }

    return 75; // Default neutral score
  }

  private calculateLanguageCompatibility(
    currentUserLanguage: string,
    currentUserLanguagePreference: string,
    currentUserLanguageSpecific: string,
    candidateLanguage: string
  ): number {
    if (currentUserLanguagePreference === 'noPreference') {
      return 75; // Neutral - no specific preference
    }

    if (currentUserLanguagePreference === 'sameLanguage') {
      if (!candidateLanguage) {
        return 50; // Missing data, but not completely negative
      }
      return currentUserLanguage.toLowerCase() === candidateLanguage.toLowerCase() ? 100 : 30;
    }

    if (currentUserLanguagePreference === 'specific' && currentUserLanguageSpecific) {
      if (!candidateLanguage) {
        return 50; // Missing data, but not completely negative
      }
      const preferredLanguages = currentUserLanguageSpecific.toLowerCase().split(',').map(s => s.trim());
      const candidateLanguageLower = candidateLanguage.toLowerCase();
      return preferredLanguages.some(lang => 
        lang.includes(candidateLanguageLower) || candidateLanguageLower.includes(lang)
      ) ? 100 : 30;
    }

    return 75; // Default neutral score
  }

  private calculateEthnicityCompatibility(
    currentUserEthnicity: string,
    currentUserEthnicityPreference: string,
    currentUserEthnicityOther: string,
    candidateEthnicity: string
  ): number {
    if (currentUserEthnicityPreference === 'noPreference') {
      return 75; // Neutral - no specific preference
    }

    if (currentUserEthnicityPreference === 'same') {
      if (!candidateEthnicity) {
        return 50; // Missing data, but not completely negative
      }
      return currentUserEthnicity.toLowerCase() === candidateEthnicity.toLowerCase() ? 100 : 30;
    }

    if (currentUserEthnicityPreference === 'others' && currentUserEthnicityOther) {
      if (!candidateEthnicity) {
        return 50; // Missing data, but not completely negative
      }
      const preferredEthnicities = currentUserEthnicityOther.toLowerCase().split(',').map(s => s.trim());
      const candidateEthnicityLower = candidateEthnicity.toLowerCase();
      return preferredEthnicities.some(eth => 
        eth.includes(candidateEthnicityLower) || candidateEthnicityLower.includes(eth)
      ) ? 100 : 30;
    }

    return 75; // Default neutral score
  }

  private calculateReligionCompatibility(
    currentUserReligion: string,
    currentUserReligionPreference: string,
    currentUserReligionOther: string,
    candidateReligion: string
  ): number {
    if (currentUserReligionPreference === 'noPreference') {
      return 75; // Neutral - no specific preference
    }

    if (currentUserReligionPreference === 'same') {
      if (!candidateReligion) {
        return 50; // Missing data, but not completely negative
      }
      return currentUserReligion.toLowerCase() === candidateReligion.toLowerCase() ? 100 : 30;
    }

    if (currentUserReligionPreference === 'others' && currentUserReligionOther) {
      if (!candidateReligion) {
        return 50; // Missing data, but not completely negative
      }
      const preferredReligions = currentUserReligionOther.toLowerCase().split(',').map(s => s.trim());
      const candidateReligionLower = candidateReligion.toLowerCase();
      return preferredReligions.some(rel => 
        rel.includes(candidateReligionLower) || candidateReligionLower.includes(rel)
      ) ? 100 : 30;
    }

    return 75; // Default neutral score
  }

  private calculateWorkScheduleCompatibility(
    currentUserSchedule: string,
    currentUserSchedulePreference: string,
    candidateSchedule: string
  ): number {
    if (!currentUserSchedulePreference || 
        currentUserSchedulePreference === 'noPreference') {
      return 75;
    }
    
    // Clean the schedules by removing any whitespace/newlines
    const cleanCurrentSchedule = currentUserSchedule.trim();
    const cleanCandidateSchedule = candidateSchedule.trim();
    const cleanPreference = currentUserSchedulePreference.trim();
    
    if (cleanPreference === 'opposite') {
      // Check if schedules are complementary
      const isOpposite = (cleanCurrentSchedule.includes('night') && cleanCandidateSchedule.includes('day')) ||
                        (cleanCurrentSchedule.includes('day') && cleanCandidateSchedule.includes('night')) ||
                        (cleanCurrentSchedule.includes('Day') && cleanCandidateSchedule.includes('night')) ||
                        (cleanCurrentSchedule.includes('Night') && cleanCandidateSchedule.includes('day'));
      return isOpposite ? 100 : 30;
    }
    
    // Direct preference match (e.g., user wants "dayShift" roommates)
    if (cleanPreference === cleanCandidateSchedule) {
      return 100;
    }
    
    // More flexible matching for common schedule terms
    if (cleanPreference.toLowerCase().includes('day') && 
        cleanCandidateSchedule.toLowerCase().includes('day')) {
      return 90;
    }
    
    if (cleanPreference.toLowerCase().includes('night') && 
        cleanCandidateSchedule.toLowerCase().includes('night')) {
      return 90;
    }
    
    if (cleanPreference.toLowerCase().includes('afternoon') && 
        cleanCandidateSchedule.toLowerCase().includes('afternoon')) {
      return 90;
    }
    
    // If no match found
    return 30;
  }

  private calculateHobbiesCompatibility(
    currentUserHobbies: string[],
    roommateHobbies: string[],
    candidateHobbies: string[]
  ): number {
    if (!currentUserHobbies || currentUserHobbies.length === 0) return 50;
    
    const allUserHobbies = [...currentUserHobbies, ...(roommateHobbies || [])];
    const commonHobbies = allUserHobbies.filter(hobby =>
      candidateHobbies.some(ch => 
        ch.toLowerCase().includes(hobby.toLowerCase()) ||
        hobby.toLowerCase().includes(ch.toLowerCase())
      )
    );
    
    const compatibility = (commonHobbies.length / allUserHobbies.length) * 100;
    return Math.min(100, Math.max(30, compatibility));
  }

  // Check required criteria using importance from database
  private checkRequiredCriteria(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    currentUserDbRecord: DatabaseUser | null
  ): { passes: boolean; failures: string[] } {
    const failures: string[] = [];
    
    if (!currentUserDbRecord) {
      return { passes: true, failures: [] };
    }

    // Check each preference importance field
    const checks = [
      {
        importance: currentUserDbRecord.gender_preference_importance as PreferenceImportance,
        name: 'Gender',
        check: () => {
          if (currentUser.genderPreference?.length) {
            const score = this.calculateGenderCompatibility(
              currentUser.gender || '',
              currentUser.genderPreference,
              candidate.gender
            );
            return score >= 80;
          }
          return true; // If no gender preference, pass the check
        }
      },
      {
        importance: currentUserDbRecord.age_range_preference_importance as PreferenceImportance,
        name: 'Age Range',
        check: () => {
          if (currentUser.ageRangePreference?.length === 2) {
            const score = this.calculateAgeCompatibility(
              parseInt(currentUser.age || '25'),
              currentUser.ageRangePreference,
              candidate.age
            );
            return score === 100; // Must be exact match (within range)
          }
          return true;
        }
      },
      {
        importance: currentUserDbRecord.smoking_preference_importance as PreferenceImportance,
        name: 'Smoking',
        check: () => {
          const score = this.calculateSmokingCompatibility(
            currentUser.smoking || false,
            currentUser.smokingPreference || 'noSmoking',
            candidate.smoking
          );
          return score >= 80;
        }
      },
      {
        importance: currentUserDbRecord.pet_preference_importance as PreferenceImportance,
        name: 'Pets',
        check: () => {
          const score = this.calculatePetCompatibility(
            currentUser.hasPets || false,
            currentUser.petPreference || 'noPets',
            candidate.has_pets
          );
          return score >= 80;
        }
      },
      {
        importance: currentUserDbRecord.dietary_preferences_importance as PreferenceImportance,
        name: 'Dietary Preferences',
        check: () => {
          if (currentUser.dietaryPreferences && currentUser.dietaryPreferences !== 'noPreference') {
            const score = this.calculateDietCompatibility(
              currentUser.diet || '',
              currentUser.dietaryPreferences,
              candidate.diet
            );
            return score >= 80; // Must have high compatibility for dietary preferences
          }
          return true;
        }
      },
      {
        importance: currentUserDbRecord.occupation_preference_importance as PreferenceImportance,
        name: 'Occupation Preference',
        check: () => {
          if (currentUser.occupationPreference && currentUser.occupationSpecific) {
            const candidateOccupation = candidate.occupation_specific || '';
            // For "must" importance, candidates without occupation info should be filtered out
            if (!candidateOccupation || candidateOccupation.trim() === '') {
              return false; // No occupation info - cannot match specific requirement
            }
            const specificOccupations = currentUser.occupationSpecific.toLowerCase().split(',').map(s => s.trim());
            const candidateOccupationLower = candidateOccupation.toLowerCase();
            return specificOccupations.some(occ => 
              occ.includes(candidateOccupationLower) || candidateOccupationLower.includes(occ)
            );
          }
          return true; // If no specific preference, pass the check
        }
      },
      {
        importance: currentUserDbRecord.work_schedule_preference_importance as PreferenceImportance,
        name: 'Work Schedule',
        check: () => {
          if (currentUser.workSchedulePreference && currentUser.workSchedulePreference !== 'noPreference') {
            const score = this.calculateWorkScheduleCompatibility(
              currentUser.workSchedule || '',
              currentUser.workSchedulePreference,
              candidate.work_schedule
            );
            return score >= 70; // Lowered threshold to accommodate data variations
          }
          return true;
        }
      },
      {
        importance: currentUserDbRecord.nationality_preference_importance as PreferenceImportance,
        name: 'Nationality Preference',
        check: () => {
          if (currentUser.nationalityPreference && currentUser.nationalityPreference !== 'noPreference') {
            if (currentUser.nationalityPreference === 'custom' && currentUser.nationalityCustom) {
              const candidateNationality = candidate.nationality || '';
              // For "must" importance, candidates without nationality info should be filtered out
              if (!candidateNationality || candidateNationality.trim() === '') {
                return false; // No nationality info - cannot match specific requirement
              }
              const preferredNationalities = currentUser.nationalityCustom.toLowerCase().split(',').map(s => s.trim());
              const candidateNationalityLower = candidateNationality.toLowerCase();
              return preferredNationalities.some(nat => 
                nat.includes(candidateNationalityLower) || candidateNationalityLower.includes(nat)
              );
            } else if (currentUser.nationalityPreference === 'sameCountry') {
              const candidateNationality = candidate.nationality || '';
              const userNationality = currentUser.nationality || '';
              if (!candidateNationality || candidateNationality.trim() === '') {
                return false; // No nationality info - cannot match requirement
              }
              return userNationality.toLowerCase() === candidateNationality.toLowerCase();
            }
          }
          return true; // If no specific preference, pass the check
        }
      },
      {
        importance: currentUserDbRecord.language_preference_importance as PreferenceImportance,
        name: 'Language Preference',
        check: () => {
          if (currentUser.languagePreference && currentUser.languagePreference !== 'noPreference') {
            if (currentUser.languagePreference === 'specific' && currentUser.languageSpecific) {
              const candidateLanguage = candidate.language || '';
              // For "must" importance, candidates without language info should be filtered out
              if (!candidateLanguage || candidateLanguage.trim() === '') {
                return false; // No language info - cannot match specific requirement
              }
              const preferredLanguages = currentUser.languageSpecific.toLowerCase().split(',').map(s => s.trim());
              const candidateLanguageLower = candidateLanguage.toLowerCase();
              return preferredLanguages.some(lang => 
                lang.includes(candidateLanguageLower) || candidateLanguageLower.includes(lang)
              );
            } else if (currentUser.languagePreference === 'sameLanguage') {
              const candidateLanguage = candidate.language || '';
              const userLanguage = currentUser.language || '';
              if (!candidateLanguage || candidateLanguage.trim() === '') {
                return false; // No language info - cannot match requirement
              }
              return userLanguage.toLowerCase() === candidateLanguage.toLowerCase();
            }
          }
          return true; // If no specific preference, pass the check
        }
      },
      {
        importance: currentUserDbRecord.ethnicity_preference_importance as PreferenceImportance,
        name: 'Ethnicity Preference',
        check: () => {
          if (currentUser.ethnicityPreference && currentUser.ethnicityPreference !== 'noPreference') {
            if (currentUser.ethnicityPreference === 'others' && currentUser.ethnicityOther) {
              const candidateEthnicity = candidate.ethnicity || '';
              // For "must" importance, candidates without ethnicity info should be filtered out
              if (!candidateEthnicity || candidateEthnicity.trim() === '') {
                return false; // No ethnicity info - cannot match specific requirement
              }
              const preferredEthnicities = currentUser.ethnicityOther.toLowerCase().split(',').map(s => s.trim());
              const candidateEthnicityLower = candidateEthnicity.toLowerCase();
              return preferredEthnicities.some(eth => 
                eth.includes(candidateEthnicityLower) || candidateEthnicityLower.includes(eth)
              );
            } else if (currentUser.ethnicityPreference === 'same') {
              const candidateEthnicity = candidate.ethnicity || '';
              const userEthnicity = currentUser.ethnicity || '';
              if (!candidateEthnicity || candidateEthnicity.trim() === '') {
                return false; // No ethnicity info - cannot match requirement
              }
              return userEthnicity.toLowerCase() === candidateEthnicity.toLowerCase();
            }
          }
          return true; // If no specific preference, pass the check
        }
      },
      {
        importance: currentUserDbRecord.religion_preference_importance as PreferenceImportance,
        name: 'Religion Preference',
        check: () => {
          if (currentUser.religionPreference && currentUser.religionPreference !== 'noPreference') {
            if (currentUser.religionPreference === 'others' && currentUser.religionOther) {
              const candidateReligion = candidate.religion || '';
              // For "must" importance, candidates without religion info should be filtered out
              if (!candidateReligion || candidateReligion.trim() === '') {
                return false; // No religion info - cannot match specific requirement
              }
              const preferredReligions = currentUser.religionOther.toLowerCase().split(',').map(s => s.trim());
              const candidateReligionLower = candidateReligion.toLowerCase();
              return preferredReligions.some(rel => 
                rel.includes(candidateReligionLower) || candidateReligionLower.includes(rel)
              );
            } else if (currentUser.religionPreference === 'same') {
              const candidateReligion = candidate.religion || '';
              const userReligion = currentUser.religion || '';
              if (!candidateReligion || candidateReligion.trim() === '') {
                return false; // No religion info - cannot match requirement
              }
              return userReligion.toLowerCase() === candidateReligion.toLowerCase();
            }
          }
          return true; // If no specific preference, pass the check
        }
      }
    ];

    for (const { importance, name, check } of checks) {
      if (importance === 'must' && !check()) {
        console.log(`❌ ${name} requirement failed for candidate ${candidate.full_name}`);
        failures.push(`${name} requirement not met`);
      }
    }

    return { passes: failures.length === 0, failures };
  }

  // Calculate compatibility scores
  private calculateCompatibilityScore(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser
  ): CompatibilityAnalysis {
    return {
      gender: this.calculateGenderCompatibility(
        currentUser.gender || '',
        currentUser.genderPreference || [],
        candidate.gender
      ),
      age: this.calculateAgeCompatibility(
        parseInt(currentUser.age || '25'),
        currentUser.ageRangePreference || [18, 65],
        candidate.age
      ),
      location: this.calculateLocationCompatibility(
        currentUser.preferredLocation || [],
        Array.isArray(candidate.preferred_location) ? candidate.preferred_location : [candidate.preferred_location || ""]
      ),
      budget: this.calculateBudgetCompatibility(
        currentUser.budgetRange || [0, 0],
        Array.isArray(candidate.budget_range) ? candidate.budget_range : [900, 1500]
      ),
      smoking: this.calculateSmokingCompatibility(
        currentUser.smoking || false,
        currentUser.smokingPreference || 'noSmoking',
        candidate.smoking
      ),
      pets: this.calculatePetCompatibility(
        currentUser.hasPets || false,
        currentUser.petPreference || 'noPets',
        candidate.has_pets
      ),
      workSchedule: this.calculateWorkScheduleCompatibility(
        currentUser.workSchedule || '',
        currentUser.workSchedulePreference || 'noPreference',
        candidate.work_schedule
      ),
      diet: this.calculateDietCompatibility(
        currentUser.diet || '',
        currentUser.dietaryPreferences || 'noPreference',
        candidate.diet
      ),
      hobbies: this.calculateHobbiesCompatibility(
        currentUser.hobbies || [],
        currentUser.roommateHobbies || [],
        candidate.hobbies || []
      ),
      // Calculate actual compatibility scores
      nationality: this.calculateNationalityCompatibility(
        currentUser.nationality || '',
        currentUser.nationalityPreference || 'noPreference',
        currentUser.nationalityCustom || '',
        candidate.nationality || ''
      ),
      language: this.calculateLanguageCompatibility(
        currentUser.language || '',
        currentUser.languagePreference || 'noPreference',
        currentUser.languageSpecific || '',
        candidate.language || ''
      ),
      ethnicity: this.calculateEthnicityCompatibility(
        currentUser.ethnicity || '',
        currentUser.ethnicityPreference || 'noPreference',
        currentUser.ethnicityOther || '',
        candidate.ethnicity || ''
      ),
      religion: this.calculateReligionCompatibility(
        currentUser.religion || '',
        currentUser.religionPreference || 'noPreference',
        currentUser.religionOther || '',
        candidate.religion || ''
      ),
      occupation: this.calculateOccupationCompatibility(
        currentUser.occupation || '',
        currentUser.occupationPreference || false,
        currentUser.occupationSpecific || '',
        candidate.occupation_specific || ''
      ),
      housingType: 75,
      livingSpace: 75,
      cleanliness: 75,
      socialLevel: 75,
      guests: 75,
      sleepSchedule: 75
    };
  }

  // Generate match reasons
  private generateMatchReasons(
    currentUser: ProfileFormValues,
    candidate: DatabaseUser,
    compatibilityAnalysis: CompatibilityAnalysis
  ): string[] {
    const reasons: string[] = [];

    if (compatibilityAnalysis.location >= 95) {
      reasons.push(`✨ Perfect location match in ${candidate.preferred_location}`);
    }

    if (compatibilityAnalysis.budget >= 90) {
      reasons.push(`💰 Excellent budget alignment`);
    }

    if (compatibilityAnalysis.smoking === 100) {
      reasons.push(currentUser.smoking ? '🚬 Both comfortable with smoking' : '🚭 Both prefer smoke-free environment');
    }

    if (compatibilityAnalysis.pets === 100) {
      reasons.push(currentUser.hasPets ? '🐕 Both are pet lovers' : '🏠 Both prefer pet-free living');
    }

    if (compatibilityAnalysis.hobbies >= 80) {
      reasons.push('🎯 Shared interests and hobbies');
    }

    if (compatibilityAnalysis.gender >= 95) {
      reasons.push('👤 Perfect gender preference match');
    }

    if (compatibilityAnalysis.nationality === 100) {
      if (currentUser.nationalityPreference === 'sameCountry') {
        reasons.push('🌍 Same nationality match');
      } else if (currentUser.nationalityPreference === 'custom') {
        reasons.push('🌍 Preferred nationality match');
      }
    }

    if (compatibilityAnalysis.language === 100) {
      if (currentUser.languagePreference === 'sameLanguage') {
        reasons.push('🗣️ Same language speakers');
      } else if (currentUser.languagePreference === 'specific') {
        reasons.push('🗣️ Preferred language match');
      }
    }

    if (compatibilityAnalysis.ethnicity === 100) {
      if (currentUser.ethnicityPreference === 'same') {
        reasons.push('👥 Same ethnicity background');
      } else if (currentUser.ethnicityPreference === 'others') {
        reasons.push('👥 Preferred ethnicity match');
      }
    }

    if (compatibilityAnalysis.religion === 100) {
      if (currentUser.religionPreference === 'same') {
        reasons.push('🙏 Same religious background');
      } else if (currentUser.religionPreference === 'others') {
        reasons.push('🙏 Preferred religious match');
      }
    }

    if (reasons.length === 0) {
      reasons.push('🤝 Good overall compatibility');
    }

    return reasons;
  }

  // Main matching method
  async findMatches(criteria: IdealRoommateMatchCriteria): Promise<IdealRoommateMatchResult[]> {
    const { 
      currentUser, 
      currentUserId,
      maxResults = 10, 
      minScore = 60 
    } = criteria;

    try {
      // Fetch current user's complete database record to get importance preferences
      let currentUserDbRecord: DatabaseUser | null = null;
      
      if (currentUserId) {
        const { data: userRecord } = await supabase
          .from('roommate')
          .select('*')
          .eq('user_id', currentUserId)
          .single();

        if (userRecord) {
          currentUserDbRecord = userRecord as DatabaseUser;
        }
      }

      // Fetch all roommate records for matching
      const { data: candidates, error } = await supabase
        .from('roommate')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !candidates) {
        console.error('Error fetching candidates:', error);
        return [];
      }

      const results: IdealRoommateMatchResult[] = [];

      for (const candidateRaw of candidates) {
        const candidate = candidateRaw as DatabaseUser;
        
        // Skip self-matching
        if (currentUserId && candidate.user_id === currentUserId) {
          continue;
        }

        // Check required criteria
        const requirementCheck = this.checkRequiredCriteria(
          currentUser, 
          candidate, 
          currentUserDbRecord
        );

        if (!requirementCheck.passes) {
          continue;
        }

        // Calculate compatibility scores
        const compatibilityAnalysis = this.calculateCompatibilityScore(
          currentUser, 
          candidate
        );

        // Calculate weighted total score using importance from database
        let totalScore = 0;
        let totalWeight = 0;

        if (currentUserDbRecord) {
          const weightMap = [
            { score: compatibilityAnalysis.gender, importance: (currentUserDbRecord.gender_preference_importance || 'notImportant') as PreferenceImportance },
            { score: compatibilityAnalysis.age, importance: (currentUserDbRecord.age_range_preference_importance || 'notImportant') as PreferenceImportance },
            { score: compatibilityAnalysis.smoking, importance: (currentUserDbRecord.smoking_preference_importance || 'notImportant') as PreferenceImportance },
            { score: compatibilityAnalysis.pets, importance: (currentUserDbRecord.pet_preference_importance || 'notImportant') as PreferenceImportance },
            { score: compatibilityAnalysis.diet, importance: (currentUserDbRecord.dietary_preferences_importance || 'notImportant') as PreferenceImportance },
            { score: compatibilityAnalysis.workSchedule, importance: (currentUserDbRecord.work_schedule_preference_importance || 'notImportant') as PreferenceImportance },
            { score: compatibilityAnalysis.occupation, importance: (currentUserDbRecord.occupation_preference_importance || 'notImportant') as PreferenceImportance },
            // Add other preferences as needed
          ];

          for (const { score, importance } of weightMap) {
            const weight = IMPORTANCE_WEIGHTS[importance];
            totalScore += score * weight;
            totalWeight += weight;
          }
        }

        // Include location and budget with default importance
        totalScore += compatibilityAnalysis.location * IMPORTANCE_WEIGHTS.important;
        totalScore += compatibilityAnalysis.budget * IMPORTANCE_WEIGHTS.important;
        totalWeight += IMPORTANCE_WEIGHTS.important * 2;

        // Normalize score
        const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 50;

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

    } catch (error) {
      console.error('Error in findMatches:', error);
      return [];
    }
  }

  // Convert to standard MatchResult format
  convertToMatchResult(idealRoommateResult: IdealRoommateMatchResult): MatchResult {
    const user = idealRoommateResult.user;
    const budgetArray = Array.isArray(user.budget_range) && user.budget_range.length === 2
      ? user.budget_range
      : [0, 0];

    return {
      name: user.full_name || "Unknown",
      age: user.age?.toString() || "N/A",
      gender: user.gender || "Not specified",
      occupation: "Professional",
      movingDate: user.move_in_date_start || "TBD",
      budget: budgetArray,
      location: Array.isArray(user.preferred_location) 
        ? user.preferred_location.join(', ') || "Any location"
        : user.preferred_location || "Any location",
      cleanliness: idealRoommateResult.compatibilityAnalysis.cleanliness,
      pets: user.has_pets || false,
      smoking: user.smoking || false,
      drinking: "socially",
      guests: "sometimes",
      sleepSchedule: user.work_schedule?.includes("morning") ? "early" : "normal",
      workSchedule: user.work_schedule || "Not specified",
      interests: user.hobbies || [],
      traits: user.important_roommate_traits || [],
      preferredLiving: "findRoommate",
      compatibilityScore: idealRoommateResult.matchScore,
      compatibilityBreakdown: {
        budget: idealRoommateResult.compatibilityAnalysis.budget,
        location: idealRoommateResult.compatibilityAnalysis.location,
        lifestyle: Math.round((
          idealRoommateResult.compatibilityAnalysis.smoking + 
          idealRoommateResult.compatibilityAnalysis.pets + 
          idealRoommateResult.compatibilityAnalysis.diet
        ) / 3),
        schedule: idealRoommateResult.compatibilityAnalysis.workSchedule,
        interests: idealRoommateResult.compatibilityAnalysis.hobbies,
        cleanliness: idealRoommateResult.compatibilityAnalysis.cleanliness
      }
    };
  }
}

// Export a singleton instance
export const idealRoommateMatchingEngine = new IdealRoommateMatchingEngine(); 