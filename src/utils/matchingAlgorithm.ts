
// This is a simplified mock matching algorithm
// In a real application, this would connect to a backend service

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
  interests: string[];
};

type MatchResult = ProfileData & {
  compatibilityScore: number;
};

// Mock database of potential roommates
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
    interests: ["Fitness", "Tech", "Gaming", "Cooking"],
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
    interests: ["Reading", "Movies", "Pets", "Music"],
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
    interests: ["Fitness", "Travel", "Cooking", "Outdoors"],
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
    interests: ["Art", "Music", "Gaming", "Photography"],
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
    interests: ["Fitness", "Reading", "Cooking", "Travel"],
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
    interests: ["Reading", "Sports", "Cooking", "Movies"],
  },
];

// Calculate compatibility score between two profiles
const calculateCompatibilityScore = (userProfile: ProfileData, potentialMatch: ProfileData): number => {
  let score = 0;
  const maxScore = 100;
  
  // Budget compatibility (20%)
  const userMinBudget = userProfile.budget[0];
  const userMaxBudget = userProfile.budget[1];
  const matchMinBudget = potentialMatch.budget[0];
  const matchMaxBudget = potentialMatch.budget[1];
  
  const budgetOverlap = Math.min(userMaxBudget, matchMaxBudget) - Math.max(userMinBudget, matchMinBudget);
  const budgetRange = Math.max(userMaxBudget - userMinBudget, matchMaxBudget - matchMinBudget);
  
  if (budgetOverlap > 0) {
    score += 20 * (budgetOverlap / budgetRange);
  }
  
  // Cleanliness compatibility (15%)
  const cleanlinessScore = 15 * (1 - Math.abs(userProfile.cleanliness - potentialMatch.cleanliness) / 100);
  score += cleanlinessScore;
  
  // Pets compatibility (10%)
  if (userProfile.pets === potentialMatch.pets) {
    score += 10;
  }
  
  // Smoking compatibility (10%)
  if (userProfile.smoking === potentialMatch.smoking) {
    score += 10;
  }
  
  // Drinking habits compatibility (5%)
  if (userProfile.drinking === potentialMatch.drinking) {
    score += 5;
  } else if (
    (userProfile.drinking === "never" && potentialMatch.drinking === "rarely") ||
    (userProfile.drinking === "rarely" && potentialMatch.drinking === "never") ||
    (userProfile.drinking === "sometimes" && potentialMatch.drinking === "rarely") ||
    (userProfile.drinking === "rarely" && potentialMatch.drinking === "sometimes")
  ) {
    score += 2.5;
  }
  
  // Guests habits compatibility (5%)
  if (userProfile.guests === potentialMatch.guests) {
    score += 5;
  } else if (
    (userProfile.guests === "never" && potentialMatch.guests === "rarely") ||
    (userProfile.guests === "rarely" && potentialMatch.guests === "never") ||
    (userProfile.guests === "sometimes" && potentialMatch.guests === "rarely") ||
    (userProfile.guests === "rarely" && potentialMatch.guests === "sometimes")
  ) {
    score += 2.5;
  }
  
  // Sleep schedule compatibility (10%)
  if (userProfile.sleepSchedule === potentialMatch.sleepSchedule) {
    score += 10;
  } else if (
    (userProfile.sleepSchedule === "variable") ||
    (potentialMatch.sleepSchedule === "variable")
  ) {
    score += 5;
  } else if (
    (userProfile.sleepSchedule === "normal" && (potentialMatch.sleepSchedule === "early" || potentialMatch.sleepSchedule === "night")) ||
    (potentialMatch.sleepSchedule === "normal" && (userProfile.sleepSchedule === "early" || userProfile.sleepSchedule === "night"))
  ) {
    score += 5;
  }
  
  // Interests compatibility (25%)
  const commonInterests = userProfile.interests.filter(interest => 
    potentialMatch.interests.includes(interest)
  );
  
  score += 25 * (commonInterests.length / Math.max(userProfile.interests.length, potentialMatch.interests.length, 1));
  
  // Round score to nearest whole number
  return Math.round(score);
};

export const findMatches = (userProfile: ProfileData): MatchResult[] => {
  // Calculate compatibility scores for all potential roommates
  const matches = potentialRoommates.map(roommate => ({
    ...roommate,
    compatibilityScore: calculateCompatibilityScore(userProfile, roommate)
  }));
  
  // Sort by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
