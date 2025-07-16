import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

export interface DatabaseUser {
  user_id: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  phone_number: string;
  preferred_location: string;
  budget_range: string;
  move_in_date: string;
  housing_type: string;
  living_space: string;
  has_pets: boolean;
  smoking: boolean;
  lives_with_smokers: boolean;
  diet: string;
  work_location: string;
  work_schedule: string;
  pet_preference: string;
  roommate_gender_preference: string;
  roommate_lifestyle_preference: string;
  hobbies: string[];
  important_roommate_traits: string[];
  linkedin_profile: string;
}

export interface CompatibilityAnalysis {
  schedule: number;
  lifestyle: number;
  preferences: number;
  location: number;
  budget: number;
  cleanliness: number;
}

export interface EnhancedMatchResult {
  user: DatabaseUser;
  matchScore: number;
  matchReasons: string[];
  compatibilityAnalysis: CompatibilityAnalysis;
}

export interface MatchingCriteria {
  currentUser: ProfileFormValues;
  currentUserId?: string;
  maxResults?: number;
  minScore?: number;
  useAI?: boolean;
}

class EnhancedMatchingEngine {
  private readonly WEIGHTS = {
    schedule: 0.20,
    lifestyle: 0.25,
    preferences: 0.20,
    location: 0.15,
    budget: 0.15,
    cleanliness: 0.05
  };

  // Calculate schedule compatibility
  private calculateScheduleCompatibility(user1: ProfileFormValues, user2: DatabaseUser): number {
    let score = 0;

    // Work schedule compatibility
    const workScheduleScore = this.getWorkScheduleScore(
      user1.workSchedule,
      user2.work_schedule
    );
    score += workScheduleScore * 0.6;

    // Sleep schedule compatibility (if available in profile data)
    const sleepScore = this.getSleepScheduleScore(user1, user2);
    score += sleepScore * 0.4;

    return Math.min(100, score);
  }

  private getWorkScheduleScore(schedule1?: string, schedule2?: string): number {
    if (!schedule1 || !schedule2) return 50;
    
    // Perfect match
    if (schedule1 === schedule2) return 100;
    
    // Compatible schedules mapping ProfileFormValues enum to database values
    const compatibleSchedules: { [key: string]: string[] } = {
      'dayShift': ['9AM-5PM', 'day-shift', 'morning'],
      'afternoonShift': ['afternoon', 'evening', '2PM-10PM'],
      'overnightShift': ['night', 'overnight', '10PM-6AM'],
      'flexible': ['flexible', 'remote', 'various']
    };

    // Check direct match first
    const schedule1Mapped = compatibleSchedules[schedule1] || [schedule1];
    
    if (schedule1Mapped.some(s => schedule2.toLowerCase().includes(s.toLowerCase()))) {
      return 85;
    }

    return 40;
  }

  private getSleepScheduleScore(user1: ProfileFormValues, user2: DatabaseUser): number {
    // For now return a default score since sleep schedule details may not be in current schema
    // This can be expanded when more detailed schedule data is available
    return 50;
  }

  // Calculate lifestyle compatibility
  private calculateLifestyleCompatibility(user1: ProfileFormValues, user2: DatabaseUser): number {
    let score = 0;

    // Cleanliness compatibility (30%) - using default since no cleanliness field
    const cleanlinessScore = 75; // Default value since cleanliness not in ProfileFormValues
    score += cleanlinessScore * 0.30;

    // Pet compatibility (25%)
    const petScore = this.getPetCompatibility(user1.hasPets, user2.has_pets);
    score += petScore * 0.25;

    // Smoking compatibility (25%)
    const smokingScore = this.getSmokingCompatibility(user1.smoking, user2.smoking);
    score += smokingScore * 0.25;

    // Social preferences (20%)
    const socialScore = this.getSocialCompatibility(user1, user2);
    score += socialScore * 0.20;

    return Math.min(100, score);
  }

  private getCleanlinessScore(clean1?: string, clean2?: number): number {
    if (!clean1 || !clean2) return 50;
    
    // Convert string cleanliness to numeric scale
    const cleanScale: { [key: string]: number } = {
      'low': 25,
      'moderate': 50,
      'high': 75,
      'very high': 90
    };

    const score1 = cleanScale[clean1] || 50;
    const diff = Math.abs(score1 - clean2);
    
    return Math.max(20, 100 - diff * 0.8);
  }

  private getPetCompatibility(pets1?: boolean, pets2?: boolean): number {
    if (pets1 === undefined || pets2 === undefined) return 50;
    return pets1 === pets2 ? 100 : 40;
  }

  private getSmokingCompatibility(smoking1?: boolean, smoking2?: boolean): number {
    if (smoking1 === undefined || smoking2 === undefined) return 50;
    return smoking1 === smoking2 ? 100 : 20;
  }

  private getSocialCompatibility(user1: ProfileFormValues, user2: DatabaseUser): number {
    // Compare hobbies and interests
    const interests1 = user1.hobbies || [];
    const interests2 = user2.hobbies || [];
    
    const commonInterests = interests1.filter(interest => 
      interests2.some(hobby => hobby.toLowerCase().includes(interest.toLowerCase()))
    );
    
    const interestScore = commonInterests.length > 0 ? 
      Math.min(100, (commonInterests.length / Math.max(interests1.length, interests2.length)) * 100 + 30) : 50;
    
    return interestScore;
  }

  // Calculate preferences compatibility
  private calculatePreferencesCompatibility(user1: ProfileFormValues, user2: DatabaseUser): number {
    let score = 0;

    // Gender preference compatibility (50%)
    const genderScore = this.getGenderPreferenceCompatibility(
      user1.gender,
      user2.roommate_gender_preference,
      user2.gender
    );
    score += genderScore * 0.50;

    // Housing type preference (30%)
    const housingScore = this.getHousingTypeCompatibility(
      user1.housingType,
      user2.housing_type
    );
    score += housingScore * 0.30;

    // Lifestyle preferences (20%) - using roommateHobbies as proxy for traits
    const lifestyleScore = this.getLifestylePreferenceCompatibility(
      user1.roommateHobbies || [],
      user2.important_roommate_traits
    );
    score += lifestyleScore * 0.20;

    return Math.min(100, score);
  }

  private getGenderPreferenceCompatibility(
    userGender?: string,
    otherPreference?: string,
    otherGender?: string
  ): number {
    if (!userGender || !otherPreference || !otherGender) return 50;
    
    // If other user has no preference or prefers any gender
    if (otherPreference === 'any' || otherPreference === 'no preference') return 100;
    
    // Check if user's gender matches other's preference
    if (otherPreference.toLowerCase().includes(userGender.toLowerCase())) return 90;
    
    return 30;
  }

  private getHousingTypeCompatibility(type1?: string, type2?: string): number {
    if (!type1 || !type2) return 50;
    
    // Exact match
    if (type1.toLowerCase() === type2.toLowerCase()) return 100;
    
    // Compatible housing types
    const compatibleTypes: { [key: string]: string[] } = {
      'apartment': ['apartment', 'condo', 'studio'],
      'house': ['house', 'townhouse'],
      'studio': ['studio', 'apartment'],
      'condo': ['condo', 'apartment']
    };
    
    if (compatibleTypes[type1.toLowerCase()]?.includes(type2.toLowerCase())) {
      return 80;
    }
    
    return 40;
  }

  private getLifestylePreferenceCompatibility(traits1?: string[], traits2?: string[]): number {
    if (!traits1 || !traits2) return 50;
    
    const commonTraits = traits1.filter(trait =>
      traits2.some(t => t.toLowerCase().includes(trait.toLowerCase()))
    );
    
    if (commonTraits.length === 0) return 30;
    
    const compatibility = (commonTraits.length / Math.max(traits1.length, traits2.length)) * 100;
    return Math.min(100, compatibility + 20);
  }

  // Calculate location compatibility
  private calculateLocationCompatibility(user1: ProfileFormValues, user2: DatabaseUser): number {
    // Use preferredLocation array's first element as primary location
    const loc1 = user1.preferredLocation?.[0];
    const loc2 = user2.preferred_location;

    if (!loc1 || !loc2) return 50;

    return this.getCityMatch(loc1, loc2);
  }

  private getCityMatch(loc1: string, loc2: string): number {
    const city1 = loc1.split(',')[0].trim().toLowerCase();
    const city2 = loc2.split(',')[0].trim().toLowerCase();

    if (city1 === city2) return 100;

    // Check for similar areas/neighborhoods
    if (city1.includes(city2) || city2.includes(city1)) return 80;

    // Bay Area cluster example
    const bayAreaCities = ['san francisco', 'oakland', 'berkeley', 'palo alto', 'mountain view', 'san mateo'];
    const isBayArea1 = bayAreaCities.some(city => city1.includes(city));
    const isBayArea2 = bayAreaCities.some(city => city2.includes(city));

    if (isBayArea1 && isBayArea2) return 75;

    return 30;
  }

  // Calculate budget compatibility
  private calculateBudgetCompatibility(user1: ProfileFormValues, user2: DatabaseUser): number {
    const budget1 = user1.budgetRange;
    const budget2Str = user2.budget_range;

    if (!budget1 || !budget2Str) return 50;

    // Parse budget range
    const budgetMatch = budget2Str.match(/\$?(\d+)-?\$?(\d+)?/);
    if (!budgetMatch) return 50;

    const budget2 = {
      min: parseInt(budgetMatch[1]),
      max: parseInt(budgetMatch[2] || budgetMatch[1])
    };

    // Calculate overlap
    const overlapMin = Math.max(budget1[0], budget2.min);
    const overlapMax = Math.min(budget1[1], budget2.max);

    if (overlapMin > overlapMax) return 10; // No overlap

    const overlapSize = overlapMax - overlapMin;
    const totalRange = Math.max(budget1[1] - budget1[0], budget2.max - budget2.min);
    
    const overlapRatio = overlapSize / totalRange;
    return Math.min(100, overlapRatio * 100 + 20);
  }

  // Generate match reasons
  private generateMatchReasons(
    user1: ProfileFormValues,
    user2: DatabaseUser,
    scores: CompatibilityAnalysis
  ): string[] {
    const reasons: string[] = [];

    if (scores.schedule >= 75) {
      reasons.push(`Compatible work schedules (${user1.workSchedule} & ${user2.work_schedule})`);
    }

    if (scores.lifestyle >= 80) {
      if (user1.hasPets === user2.has_pets) {
        reasons.push(user1.hasPets ? 'Both are pet-friendly' : 'Both prefer no pets');
      }
      if (user1.smoking === user2.smoking) {
        reasons.push(user1.smoking ? 'Both are comfortable with smoking' : 'Both prefer smoke-free environment');
      }
    }

    if (scores.location >= 75) {
      reasons.push(`Great location match in ${user2.preferred_location}`);
    }

    if (scores.budget >= 70) {
      reasons.push('Compatible budget ranges');
    }

    if (scores.preferences >= 80) {
      const commonTraits = (user1.roommateHobbies || []).filter(trait =>
        (user2.important_roommate_traits || []).some(t => 
          t.toLowerCase().includes(trait.toLowerCase())
        )
      );
      if (commonTraits.length > 0) {
        reasons.push(`Shared values: ${commonTraits.slice(0, 2).join(', ')}`);
      }
    }

    // Add interests match
    const commonInterests = (user1.hobbies || []).filter(interest =>
      (user2.hobbies || []).some(hobby => 
        hobby.toLowerCase().includes(interest.toLowerCase())
      )
    );
    if (commonInterests.length > 0) {
      reasons.push(`Common interests: ${commonInterests.slice(0, 2).join(', ')}`);
    }

    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  // Main matching method
  async findMatches(criteria: MatchingCriteria): Promise<EnhancedMatchResult[]> {
    const { currentUser, currentUserId, maxResults = 10, minScore = 60 } = criteria;
    
    // Fetch candidate users from database
    const { data: candidates, error } = await supabase
      .from('roommate')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }

    const results: EnhancedMatchResult[] = [];

    for (const candidate of candidates || []) {
      // Skip self-matching if userId is provided
      if (currentUserId && candidate.user_id === currentUserId) {
        console.log(`Skipping self-match for user ${currentUserId}`);
        continue;
      }

      // Calculate compatibility scores
      const scheduleScore = this.calculateScheduleCompatibility(currentUser, candidate);
      const lifestyleScore = this.calculateLifestyleCompatibility(currentUser, candidate);
      const preferencesScore = this.calculatePreferencesCompatibility(currentUser, candidate);
      const locationScore = this.calculateLocationCompatibility(currentUser, candidate);
      const budgetScore = this.calculateBudgetCompatibility(currentUser, candidate);
      const cleanlinessScore = 75; // Default since no cleanliness in ProfileFormValues

      const compatibilityAnalysis: CompatibilityAnalysis = {
        schedule: scheduleScore,
        lifestyle: lifestyleScore,
        preferences: preferencesScore,
        location: locationScore,
        budget: budgetScore,
        cleanliness: cleanlinessScore
      };

      // Calculate weighted total score
      const totalScore = 
        scheduleScore * this.WEIGHTS.schedule +
        lifestyleScore * this.WEIGHTS.lifestyle +
        preferencesScore * this.WEIGHTS.preferences +
        locationScore * this.WEIGHTS.location +
        budgetScore * this.WEIGHTS.budget +
        cleanlinessScore * this.WEIGHTS.cleanliness;

      // Only include matches above minimum score
      if (totalScore >= minScore) {
        const matchReasons = this.generateMatchReasons(currentUser, candidate, compatibilityAnalysis);

        results.push({
          user: candidate,
          matchScore: Math.round(totalScore),
          matchReasons,
          compatibilityAnalysis
        });
      }
    }

    // Sort by match score and limit results
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  // Convert to existing MatchResult format for compatibility
  convertToMatchResult(enhancedResult: EnhancedMatchResult): MatchResult {
    const user = enhancedResult.user;
    const budget = user.budget_range.match(/\$?(\d+)-?\$?(\d+)?/);
    const budgetArray = budget ? [parseInt(budget[1]), parseInt(budget[2] || budget[1])] : [0, 0];

    return {
      name: user.full_name,
      age: user.age.toString(),
      gender: user.gender,
      occupation: "Professional",
      movingDate: user.move_in_date,
      budget: budgetArray,
      location: user.preferred_location,
      cleanliness: enhancedResult.compatibilityAnalysis.cleanliness,
      pets: user.has_pets,
      smoking: user.smoking,
      drinking: "socially",
      guests: "sometimes",
      sleepSchedule: user.work_schedule?.includes("AM") ? "early" : "normal",
      workSchedule: user.work_schedule,
      interests: user.hobbies || [],
      traits: user.important_roommate_traits || [],
      preferredLiving: "findRoommate",
      compatibilityScore: enhancedResult.matchScore,
      compatibilityBreakdown: {
        budget: enhancedResult.compatibilityAnalysis.budget,
        location: enhancedResult.compatibilityAnalysis.location,
        lifestyle: enhancedResult.compatibilityAnalysis.lifestyle,
        schedule: enhancedResult.compatibilityAnalysis.schedule,
        interests: enhancedResult.compatibilityAnalysis.preferences,
        cleanliness: enhancedResult.compatibilityAnalysis.cleanliness
      }
    };
  }
}

export const enhancedMatchingEngine = new EnhancedMatchingEngine();
export default enhancedMatchingEngine;