import { query } from './homieDB.js';

// Scoring constants
const ROOMMATE_MAX = 100;
const COBUY_MAX = 100;
const RENOVATION_NORMAL_LIMIT = 3;
const RENOVATION_EMERGENCY_LIMIT = 4;

// Helper: Calculate budget/score overlap percentage
function calculateOverlap(userMin, userMax, targetMin, targetMax) {
  if (userMin > targetMax || userMax < targetMin) return 0;
  const overlapMin = Math.max(userMin, targetMin);
  const overlapMax = Math.min(userMax, targetMax);
  const overlap = overlapMax - overlapMin;
  const range = Math.max(userMax - userMin, targetMax - targetMin);
  return range > 0 ? overlap / range : 0;
}

// ROOMMATE scoring (100 pts max)
// - Budget range overlap: 40 pts
// - Schedule match (early/night): 30 pts
// - Dealbreaker compatibility (pets, smoking): 30 pts
export async function findRoommateMatches(answers) {
  const { area, budget, schedule, pets, smoking } = answers;
  
  // Parse budget
  const [minBudget, maxBudget] = budget.split('-').map(s => parseInt(s.replace(/[^0-9]/g, '')) || 0);
  
  // Query seekers with co_ownership_profiles (roommate seekers)
  const result = await query(`
    SELECT 
      u.id as user_id,
      u.email,
      u.first_name,
      u.last_name,
      cp.profile_completeness,
      cp.preferred_locations,
      cp.budget_min,
      cp.budget_max,
      cp.living_arrangements,
      cp.age_range,
      cp.occupation,
      cp.why_co_ownership
    FROM auth.users u
    JOIN co_ownership_profiles cp ON u.id = cp.user_id
    WHERE u.id != $1
      AND cp.is_active = true
      AND cp.profile_completeness >= 40
  `, [answers.userId]);
  
  const matches = [];
  
  for (const candidate of result.rows) {
    let score = 0;
    
    // Budget overlap (40 pts)
    const budgetOverlap = calculateOverlap(
      minBudget, maxBudget,
      candidate.budget_min, candidate.budget_max
    );
    score += budgetOverlap * 40;
    
    // Schedule match (30 pts) - simplified
    if (schedule) {
      const candidateSchedule = candidate.living_arrangements?.[0] || '';
      if (candidateSchedule.toLowerCase().includes(schedule.toLowerCase())) {
        score += 30;
      } else if (candidateSchedule.toLowerCase().includes('flexible')) {
        score += 15;
      }
    }
    
    // Dealbreaker compatibility (30 pts)
    if (pets || smoking) {
      const candidatePets = candidate.living_arrangements?.includes('pets') || false;
      const candidateSmoking = candidate.living_arrangements?.includes('smoking') || false;
      
      if (pets && !candidatePets) score += 15;
      if (!pets && candidatePets) score += 0;
      if (smoking && !candidateSmoking) score += 15;
      if (!smoking && candidateSmoking) score += 0;
    }
    
    if (score > 0) {
      matches.push({
        user_id: candidate.user_id,
        score: Math.round(score),
        profile_completeness: candidate.profile_completeness,
        name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
      });
    }
  }
  
  // Sort by score descending, return top 2
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2);
}

// COBUY scoring (100 pts max)
// - Price range overlap: 50 pts
// - Purpose match (live-in vs investment): 30 pts
// - Down payment proximity (within 30%): 20 pts
export async function findCoBuyMatches(answers) {
  const { city, priceRange, downPayment, purpose } = answers;
  
  // Parse price range
  const [minPrice, maxPrice] = priceRange.split('-').map(s => parseInt(s.replace(/[^0-9]/g, '')) || 0);
  
  // Query seekers looking for co-ownership
  const result = await query(`
    SELECT 
      u.id as user_id,
      u.email,
      u.first_name,
      u.last_name,
      cp.profile_completeness,
      cp.preferred_locations,
      cp.budget_min,
      cp.budget_max,
      cp.down_payment,
      cp.co_ownership_purposes,
      cp.age_range,
      cp.occupation,
      cp.why_co_ownership
    FROM auth.users u
    JOIN co_ownership_profiles cp ON u.id = cp.user_id
    WHERE u.id != $1
      AND cp.is_active = true
      AND cp.profile_completeness >= 40
  `, [answers.userId]);
  
  const matches = [];
  
  for (const candidate of result.rows) {
    let score = 0;
    
    // Price range overlap (50 pts)
    const priceOverlap = calculateOverlap(
      minPrice, maxPrice,
      candidate.budget_min, candidate.budget_max
    );
    score += priceOverlap * 50;
    
    // Purpose match (30 pts)
    if (purpose) {
      const candidatePurposes = candidate.co_ownership_purposes || [];
      if (candidatePurposes.some(p => p.toLowerCase().includes(purpose.toLowerCase()))) {
        score += 30;
      } else if (candidatePurposes.some(p => p.toLowerCase().includes('flexible'))) {
        score += 15;
      }
    }
    
    // Down payment proximity (20 pts)
    if (downPayment && candidate.down_payment) {
      const ratio = candidate.down_payment / downPayment;
      if (ratio >= 0.7 && ratio <= 1.3) {
        score += 20;
      } else if (ratio >= 0.5 && ratio <= 2.0) {
        score += 10;
      }
    }
    
    if (score > 0) {
      matches.push({
        user_id: candidate.user_id,
        score: Math.round(score),
        profile_completeness: candidate.profile_completeness,
        name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
      });
    }
  }
  
  // Sort by score descending, return top 2
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2);
}

// EXPERT matching (no scoring — filter by verified, city, availability)
export async function findExpertMatches(answers) {
  const { expertType, city, purpose } = answers;
  
  let result;
  
  if (expertType === 'lawyer') {
    result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        lp.profile_completeness,
        lp.city,
        lp.available_this_week,
        lp.specialization
      FROM auth.users u
      JOIN lawyer_profiles lp ON u.id = lp.user_id
      WHERE u.id != $1
        AND lp.verified = true
        AND lp.city ILIKE $2
        AND lp.available_this_week = true
    `, [answers.userId, `%${city}%`]);
  } else if (expertType === 'mortgage broker') {
    result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        mp.profile_completeness,
        mp.city,
        mp.available_this_week,
        mp.specialization
      FROM auth.users u
      JOIN mortgage_profiles mp ON u.id = mp.user_id
      WHERE u.id != $1
        AND mp.verified = true
        AND mp.city ILIKE $2
        AND mp.available_this_week = true
    `, [answers.userId, `%${city}%`]);
  } else {
    // Both
    result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        COALESCE(lp.profile_completeness, mp.profile_completeness) as profile_completeness,
        COALESCE(lp.city, mp.city) as city,
        COALESCE(lp.available_this_week, mp.available_this_week) as available_this_week,
        COALESCE(lp.specialization, mp.specialization) as specialization
      FROM auth.users u
      LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id AND lp.verified = true AND lp.city ILIKE $2 AND lp.available_this_week = true
      LEFT JOIN mortgage_profiles mp ON u.id = mp.user_id AND mp.verified = true AND mp.city ILIKE $2 AND mp.available_this_week = true
      WHERE u.id != $1
        AND (lp.user_id IS NOT NULL OR mp.user_id IS NOT NULL)
    `, [answers.userId, `%${city}%`]);
  }
  
  // Sort by profile_completeness descending, return top 2
  const matches = result.rows.map(r => ({
    user_id: r.user_id,
    score: Math.round(r.profile_completeness),
    profile_completeness: r.profile_completeness,
    name: `${r.first_name} ${r.last_name}`,
    email: r.email,
    specialization: r.specialization,
  }));
  
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2);
}

// RENOVATION matching
// Normal: Filter by verified, specialization match, available = true, return top 3
// Emergency: Skip scoring, query top 4 with emergency_available = true, blast all 4
export async function findRenovationMatches(answers) {
  const { isEmergency, address, workType } = answers;
  
  if (isEmergency) {
    // Emergency: Blast top 4 renovators with emergency_available = true
    const result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        rp.profile_completeness,
        rp.city,
        rp.emergency_available,
        rp.services
      FROM auth.users u
      JOIN renovator_profiles rp ON u.id = rp.user_id
      WHERE rp.verified = true
        AND rp.emergency_available = true
      ORDER BY rp.profile_completeness DESC
      LIMIT 4
    `);
    
    return result.rows.map(r => ({
      user_id: r.user_id,
      score: 100, // Emergency gets max score
      profile_completeness: r.profile_completeness,
      name: `${r.first_name} ${r.last_name}`,
      email: r.email,
      services: r.services,
      isEmergency: true,
    }));
  }
  
  // Normal: Filter by verified, specialization match, available = true, return top 3
  const result = await query(`
    SELECT 
      u.id as user_id,
      u.email,
      u.first_name,
      u.last_name,
      rp.profile_completeness,
      rp.city,
      rp.available,
      rp.specialization,
      rp.services
    FROM auth.users u
    JOIN renovator_profiles rp ON u.id = rp.user_id
    WHERE rp.verified = true
      AND rp.available = true
      AND rp.city ILIKE $1
  `, [answers.city || '%']);
  
  // Filter by work type if specified
  let matches = result.rows;
  if (workType) {
    matches = matches.filter(r => 
      r.services?.some(s => s.toLowerCase().includes(workType.toLowerCase())) ||
      r.specialization?.toLowerCase().includes(workType.toLowerCase())
    );
  }
  
  // Sort by profile_completeness descending, return top 3
  matches = matches.map(r => ({
    user_id: r.user_id,
    score: Math.round(r.profile_completeness),
    profile_completeness: r.profile_completeness,
    name: `${r.first_name} ${r.last_name}`,
    email: r.email,
    services: r.services,
    specialization: r.specialization,
  }));
  
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3);
}

// Main matching function
export async function findMatches(intent, answers) {
  switch (intent) {
    case 'ROOMMATE':
      return await findRoommateMatches(answers);
    case 'COBUY':
      return await findCoBuyMatches(answers);
    case 'EXPERT':
      return await findExpertMatches(answers);
    case 'RENOVATION':
      return await findRenovationMatches(answers);
    default:
      return [];
  }
}
