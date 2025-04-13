
import { ProfileData, CompatibilityResult } from "./types";

// Function to check if work schedules are compatible
export const areWorkSchedulesCompatible = (schedule1: string, schedule2: string): number => {
  // Night shift compatibility
  const isNightShift1 = schedule1.toLowerCase().includes('night') || schedule1.includes('11PM') || schedule1.includes('12AM');
  const isNightShift2 = schedule2.toLowerCase().includes('night') || schedule2.includes('11PM') || schedule2.includes('12AM');
  
  // Day shift compatibility
  const isDayShift1 = schedule1.toLowerCase().includes('9AM') || schedule1.toLowerCase().includes('8AM') || schedule1.toLowerCase().includes('day');
  const isDayShift2 = schedule2.toLowerCase().includes('9AM') || schedule2.toLowerCase().includes('8AM') || schedule2.toLowerCase().includes('day');
  
  // Perfect match: One works days, one works nights (different schedules)
  if ((isNightShift1 && isDayShift2) || (isDayShift1 && isNightShift2)) {
    return 100; // Ideal for people wanting opposite schedules
  }
  
  // Both work similar schedules (both day or both night)
  if ((isNightShift1 && isNightShift2) || (isDayShift1 && isDayShift2)) {
    return 80; // Good match for people with similar schedules
  }
  
  // If either schedule is flexible
  if (schedule1.toLowerCase().includes('flexible') || schedule2.toLowerCase().includes('flexible')) {
    return 90; // Very compatible due to flexibility
  }
  
  // Default medium compatibility
  return 70;
};

// Calculate compatibility score between two profiles
export const calculateCompatibilityScore = (userProfile: ProfileData, potentialMatch: ProfileData): CompatibilityResult => {
  const breakdown = {
    budget: 0,
    location: 0,
    lifestyle: 0,
    schedule: 0,
    interests: 0,
    cleanliness: 0
  };
  
  // Budget compatibility (15%)
  const userMinBudget = userProfile.budget[0];
  const userMaxBudget = userProfile.budget[1];
  const matchMinBudget = potentialMatch.budget[0];
  const matchMaxBudget = potentialMatch.budget[1];
  
  const budgetOverlap = Math.min(userMaxBudget, matchMaxBudget) - Math.max(userMinBudget, matchMinBudget);
  const budgetRange = Math.max(userMaxBudget - userMinBudget, matchMaxBudget - matchMinBudget);
  
  if (budgetOverlap > 0) {
    breakdown.budget = 15 * (budgetOverlap / budgetRange);
  }
  
  // Location compatibility (15%)
  // Simple match for now, could be enhanced with geocoding
  if (userProfile.location.toLowerCase() === potentialMatch.location.toLowerCase()) {
    breakdown.location = 15;
  } else {
    // Partial match on some locations
    const userLocLower = userProfile.location.toLowerCase();
    const matchLocLower = potentialMatch.location.toLowerCase();
    if (userLocLower.includes(matchLocLower) || matchLocLower.includes(userLocLower)) {
      breakdown.location = 10;
    } else {
      breakdown.location = 0;
    }
  }
  
  // Cleanliness compatibility (10%)
  breakdown.cleanliness = 10 * (1 - Math.abs(userProfile.cleanliness - potentialMatch.cleanliness) / 100);
  
  // Lifestyle compatibility (25%)
  let lifestyleScore = 0;
  
  // Pets compatibility (5%)
  if (userProfile.pets === potentialMatch.pets) {
    lifestyleScore += 5;
  } else if (!userProfile.pets && !potentialMatch.pets) {
    lifestyleScore += 5; // Both don't have pets
  }
  
  // Smoking compatibility (5%)
  if (userProfile.smoking === potentialMatch.smoking) {
    lifestyleScore += 5;
  } else if (!userProfile.smoking && !potentialMatch.smoking) {
    lifestyleScore += 5; // Both don't smoke
  }
  
  // Guests habits compatibility (5%)
  if (userProfile.guests === potentialMatch.guests) {
    lifestyleScore += 5;
  } else if (
    (userProfile.guests === "rarely" && potentialMatch.guests === "sometimes") ||
    (userProfile.guests === "sometimes" && potentialMatch.guests === "rarely")
  ) {
    lifestyleScore += 3;
  }
  
  // Sleep schedule compatibility (10%)
  if (userProfile.sleepSchedule === potentialMatch.sleepSchedule) {
    lifestyleScore += 10;
  } else if (
    (userProfile.sleepSchedule === "variable") ||
    (potentialMatch.sleepSchedule === "variable")
  ) {
    lifestyleScore += 7;
  } else if (
    (userProfile.sleepSchedule === "normal" && potentialMatch.sleepSchedule === "early") ||
    (userProfile.sleepSchedule === "early" && potentialMatch.sleepSchedule === "normal")
  ) {
    lifestyleScore += 5;
  }
  
  breakdown.lifestyle = lifestyleScore;
  
  // Work schedule compatibility (15%) - New major factor
  const scheduleCompatibility = areWorkSchedulesCompatible(userProfile.workSchedule, potentialMatch.workSchedule);
  breakdown.schedule = 15 * (scheduleCompatibility / 100);
  
  // Interests compatibility (10%)
  const commonInterests = userProfile.interests.filter(interest => 
    potentialMatch.interests.includes(interest)
  );
  
  breakdown.interests = 10 * (commonInterests.length / Math.max(userProfile.interests.length, potentialMatch.interests.length, 1));
  
  // Calculate final score
  const totalScore = breakdown.budget + breakdown.location + breakdown.lifestyle + 
                    breakdown.schedule + breakdown.interests + breakdown.cleanliness;
  
  // Normalize to 100
  const normalizedScore = Math.min(100, Math.round(totalScore));
  
  return {
    score: normalizedScore,
    breakdown
  };
};
