
// This is an enhanced matching algorithm that considers work schedules, lifestyle compatibility,
// and property sharing preferences

import { ProfileFormValues } from "@/types/profile";

type ProfileData = {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  movingDate: string;
  budget: number[];
  location: string;
  cleanliness: number;
  pets: boolean;
  smoking: boolean;
  drinking: string;
  guests: string;
  sleepSchedule: string;
  workSchedule: string; // Added work schedule
  interests: string[];
  traits: string[];
  preferredLiving: string; // "findRoommate" or "shareProperty"
  propertyDetails?: {
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    address: string;
  };
};

export type MatchResult = ProfileData & {
  compatibilityScore: number;
  compatibilityBreakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    schedule: number;
    interests: number;
    cleanliness: number;
  };
};

// Enhanced mock database with work schedules and property sharing preferences
const potentialRoommates: ProfileData[] = [
  {
    name: "Alex",
    age: "28",
    gender: "male",
    occupation: "Software Engineer",
    movingDate: "2023-09-01",
    budget: [800, 1200],
    location: "Downtown",
    cleanliness: 80,
    pets: false,
    smoking: false,
    drinking: "sometimes",
    guests: "rarely",
    sleepSchedule: "normal",
    workSchedule: "9AM-5PM",
    interests: ["Fitness", "Tech", "Gaming", "Cooking"],
    traits: ["Clean", "Responsible", "Quiet", "Organized", "Reliable"],
    preferredLiving: "findRoommate"
  },
  {
    name: "Jamie",
    age: "25",
    gender: "non-binary",
    occupation: "Graduate Student",
    movingDate: "2023-09-15",
    budget: [750, 1100],
    location: "University District",
    cleanliness: 60,
    pets: true,
    smoking: false,
    drinking: "sometimes",
    guests: "sometimes",
    sleepSchedule: "night",
    workSchedule: "Flexible",
    interests: ["Reading", "Movies", "Pets", "Music"],
    traits: ["Adaptable", "Sociable", "Friendly", "Easygoing", "Considerate"],
    preferredLiving: "findRoommate"
  },
  {
    name: "Taylor",
    age: "31",
    gender: "female",
    occupation: "Marketing Manager",
    movingDate: "2023-08-20",
    budget: [900, 1500],
    location: "Ballard",
    cleanliness: 90,
    pets: false,
    smoking: false,
    drinking: "rarely",
    guests: "sometimes",
    sleepSchedule: "early",
    workSchedule: "8AM-4PM",
    interests: ["Fitness", "Travel", "Cooking", "Outdoors"],
    traits: ["Clean", "Organized", "Punctual", "Responsible", "Communicative"],
    preferredLiving: "shareProperty",
    propertyDetails: {
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 1,
      address: "123 Main St, Ballard"
    }
  },
  {
    name: "Jordan",
    age: "26",
    gender: "male",
    occupation: "Graphic Designer",
    movingDate: "2023-10-01",
    budget: [700, 1100],
    location: "Capitol Hill",
    cleanliness: 50,
    pets: true,
    smoking: true,
    drinking: "often",
    guests: "often",
    sleepSchedule: "night",
    workSchedule: "10AM-6PM",
    interests: ["Art", "Music", "Gaming", "Photography"],
    traits: ["Creative", "Sociable", "Easygoing", "Adaptable", "Friendly"],
    preferredLiving: "findRoommate"
  },
  {
    name: "Morgan",
    age: "29",
    gender: "female",
    occupation: "Nurse",
    movingDate: "2023-09-10",
    budget: [850, 1300],
    location: "Queen Anne",
    cleanliness: 85,
    pets: false,
    smoking: false,
    drinking: "rarely",
    guests: "rarely",
    sleepSchedule: "variable",
    workSchedule: "Night Shift 11PM-7AM",
    interests: ["Fitness", "Reading", "Cooking", "Travel"],
    traits: ["Clean", "Quiet", "Respectful", "Reliable", "Considerate"],
    preferredLiving: "shareProperty",
    propertyDetails: {
      propertyType: "house",
      bedrooms: 3,
      bathrooms: 2,
      address: "456 Oak St, Queen Anne"
    }
  },
  {
    name: "Casey",
    age: "32",
    gender: "non-binary",
    occupation: "Teacher",
    movingDate: "2023-08-15",
    budget: [800, 1100],
    location: "Fremont",
    cleanliness: 70,
    pets: true,
    smoking: false,
    drinking: "sometimes",
    guests: "sometimes",
    sleepSchedule: "early",
    workSchedule: "7AM-3PM",
    interests: ["Reading", "Sports", "Cooking", "Movies"],
    traits: ["Patient", "Communicative", "Friendly", "Organized", "Reliable"],
    preferredLiving: "findRoommate"
  },
];

// Function to check if work schedules are compatible
const areWorkSchedulesCompatible = (schedule1: string, schedule2: string): number => {
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
const calculateCompatibilityScore = (userProfile: ProfileData, potentialMatch: ProfileData): {
  score: number;
  breakdown: { 
    budget: number; 
    location: number; 
    lifestyle: number; 
    schedule: number; 
    interests: number;
    cleanliness: number;
  }
} => {
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

// Map form values to the format expected by the matching algorithm
const mapFormToProfileData = (formData: ProfileFormValues): ProfileData => {
  const workSchedule = formData.workSchedule || "9AM-5PM"; 
  
  return {
    name: formData.fullName,
    age: formData.age,
    gender: formData.gender || "prefer-not-to-say",
    occupation: "Not specified", // Default value
    movingDate: formData.moveInDate.toISOString().split('T')[0],
    budget: formData.budgetRange,
    location: formData.preferredLocation,
    cleanliness: formData.cleanliness === "veryTidy" ? 90 : 
                formData.cleanliness === "somewhatTidy" ? 60 : 30,
    pets: formData.hasPets,
    smoking: formData.smoking,
    drinking: "sometimes", // Default value
    guests: formData.guestsOver === "yes" ? "often" : 
           formData.guestsOver === "occasionally" ? "sometimes" : "rarely",
    sleepSchedule: formData.dailyRoutine === "morning" ? "early" : 
                  formData.dailyRoutine === "night" ? "night" : "normal",
    workSchedule: workSchedule,
    interests: formData.hobbies || [],
    traits: formData.importantRoommateTraits || [],
    preferredLiving: "findRoommate" // Default, would come from form in real implementation
  };
};

export const findMatches = (userProfile: ProfileFormValues): MatchResult[] => {
  // Convert form data to the format expected by the matching algorithm
  const profileData = mapFormToProfileData(userProfile);
  
  // Calculate compatibility scores for all potential roommates
  const matches = potentialRoommates.map(roommate => {
    // Apply gender preference filter
    let genderMatch = true;
    if (userProfile.roommateGenderPreference === "sameGender") {
      genderMatch = roommate.gender === profileData.gender;
    } else if (userProfile.roommateGenderPreference === "femaleOnly") {
      genderMatch = roommate.gender === "female";
    } else if (userProfile.roommateGenderPreference === "maleOnly") {
      genderMatch = roommate.gender === "male";
    }
    
    // Calculate compatibility score if gender matches
    if (!genderMatch) {
      return {
        ...roommate,
        compatibilityScore: 0,
        compatibilityBreakdown: {
          budget: 0,
          location: 0,
          lifestyle: 0,
          schedule: 0,
          interests: 0,
          cleanliness: 0
        }
      };
    }
    
    const { score, breakdown } = calculateCompatibilityScore(profileData, roommate);
    
    return {
      ...roommate,
      compatibilityScore: score,
      compatibilityBreakdown: breakdown
    };
  });
  
  // Sort by compatibility score (highest first) and filter out non-matches (score of 0)
  return matches
    .filter(match => match.compatibilityScore > 0)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

// New function to find properties with available roommates
export const findPropertyShareMatches = (userProfile: ProfileFormValues): MatchResult[] => {
  // Convert form data to the format expected by the matching algorithm
  const profileData = mapFormToProfileData(userProfile);
  
  // Filter for profiles that are sharing properties
  const propertyShareProfiles = potentialRoommates.filter(profile => 
    profile.preferredLiving === "shareProperty" && profile.propertyDetails
  );
  
  // Calculate compatibility for property sharing
  const matches = propertyShareProfiles.map(profile => {
    const { score, breakdown } = calculateCompatibilityScore(profileData, profile);
    
    // Apply additional criteria for property sharing
    let adjustedScore = score;
    
    // Budget adjustment: If property is within user's budget range
    if (profile.propertyDetails) {
      const estimatedRent = profile.budget[0]; // Use minimum as estimated rent
      if (estimatedRent >= profileData.budget[0] && estimatedRent <= profileData.budget[1]) {
        adjustedScore += 10;
        // Cap at 100
        if (adjustedScore > 100) adjustedScore = 100;
      }
    }
    
    return {
      ...profile,
      compatibilityScore: adjustedScore,
      compatibilityBreakdown: breakdown
    };
  });
  
  // Sort by compatibility score (highest first) and filter out low matches
  return matches
    .filter(match => match.compatibilityScore > 50) // Higher threshold for property sharing
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
