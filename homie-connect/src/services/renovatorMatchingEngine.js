import { query } from './homieDB.js';
import { cacheProvider, cacheSeeker, findCachedMatches } from './inMemoryMatchingCache.js';

/**
 * Detect if user is a renovator provider or customer seeker
 * Returns 'provider' or 'seeker' or null if unclear
 */
export function detectRenovationRole(message) {
  const lower = message.toLowerCase();
  
  // Seeker indicators - CHECK FIRST (higher priority)
  const seekerKeywords = [
    'i need',
    'i\'m looking for',
    'i need a',
    'find me',
    'help me find',
    'looking for a',
    'need help with',
    'broken',
    'leak',
    'damage',
    'repair needed',
    'looking for',
    'i\'m a client',
    'i am a client',
    'contact in your network',
    'any contact',
    'looking for renovator',
    'need renovator',
    'need contractor',
    'need plumber',
    'need electrician',
  ];
  
  // Provider indicators
  const providerKeywords = [
    'i am a renovator',
    'i\'m a renovator',
    'i do renovations',
    'i\'m ready to work',
    'i can do',
    'i specialize',
    'i offer',
    'i provide',
    'contractor',
    'handyman',
    'plumber',
    'electrician',
    'carpenter',
    'based on',
    'based in',
    'phone number',
    'if anybody needs',
    'help please',
    'my name is',
    'i\'m a',
  ];
  
  // Check seeker FIRST - if user says "looking for", they're a seeker
  const isSeeker = seekerKeywords.some(kw => lower.includes(kw));
  if (isSeeker) return 'seeker';
  
  // Then check provider
  const isProvider = providerKeywords.some(kw => lower.includes(kw));
  if (isProvider) return 'provider';
  
  // If message is just an address or location, it's likely a seeker answering Q2
  // (Which property address is this for?)
  // Check for street suffixes
  if (lower.includes('street') || lower.includes('ave') || lower.includes('rd') || 
      lower.includes('dr') || lower.includes('blvd') || lower.includes('lane') ||
      lower.includes('court') || lower.includes('way') || lower.includes('road') ||
      /^\d+\s+\w+/.test(lower)) { // Starts with number (like "123 Main")
    return 'seeker';
  }
  
  // Check for known Canadian cities (common seeker responses for address question)
  const cities = [
    'toronto', 'north york', 'mississauga', 'brampton', 'scarborough',
    'etobicoke', 'markham', 'richmond hill', 'vaughan', 'pickering',
    'ajax', 'whitby', 'oshawa', 'hamilton', 'london', 'windsor',
    'vancouver', 'calgary', 'edmonton', 'montreal', 'ottawa',
  ];
  
  if (cities.some(city => lower.includes(city))) {
    return 'seeker';
  }
  
  return null;
}

/**
 * Get provider-specific questions
 */
export function getProviderQuestions() {
  return {
    keys: ['services', 'serviceArea', 'availability', 'rateRange', 'responseTime'],
    text: [
      'What services do you specialize in? (e.g., plumbing, electrical, general, carpentry)',
      'What\'s your service area? (city or radius in km)',
      'When are you available to start? (ASAP, this week, this month)',
      'What\'s your typical hourly rate range? (e.g., $50-75)',
      'How quickly can you respond to requests? (same day, 24hrs, 48hrs)',
    ],
  };
}

/**
 * Get seeker-specific questions (existing renovation questions)
 */
export function getSeekerQuestions() {
  return {
    keys: ['address'],
    text: [
      'Which area are you in? (e.g., North York, Toronto)',
    ],
  };
}

/**
 * Build provider profile from answers
 */
export function buildProviderProfile(answers) {
  const services = answers.services ? answers.services.split(',').map(s => s.trim().toLowerCase()) : [];
  const rateRangeMatch = answers.rateRange ? answers.rateRange.match(/\d+/g) : null;
  const rateRange = rateRangeMatch || [0, 0];
  
  return {
    user_type: 'provider',
    status: 'active',
    service_categories: services,
    service_radius_km: extractRadius(answers.serviceArea) || 25,
    availability_start: parseAvailability(answers.availability),
    hourly_rate_min: parseInt(rateRange[0]) || 0,
    hourly_rate_max: parseInt(rateRange[1]) || 0,
    response_time_hours: parseResponseTime(answers.responseTime),
  };
}

/**
 * Build customer request from answers
 */
export function buildCustomerRequest(userId, answers) {
  return {
    user_id: userId,
    intent: 'renovation',
    emergency: false,
    address: answers.address || 'General Area',
    city: extractCity(answers.address) || 'Local',
    work_type: 'General renovation',
    timeline: 'flexible',
    status: 'open',
  };
}

/**
 * Extract city from address
 */
function extractCity(address) {
  if (!address) return null;
  
  // Common Canadian cities
  const cities = [
    'Toronto', 'North York', 'Mississauga', 'Brampton', 'Scarborough',
    'Etobicoke', 'Markham', 'Richmond Hill', 'Vaughan', 'Pickering',
    'Ajax', 'Whitby', 'Oshawa', 'Hamilton', 'London', 'Windsor',
    'Vancouver', 'Calgary', 'Edmonton', 'Montreal', 'Ottawa',
  ];
  
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  
  return null;
}

/**
 * Extract service radius from area description
 */
function extractRadius(serviceArea) {
  if (!serviceArea) return null;
  
  const match = serviceArea.match(/(\d+)\s*km/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Parse availability date
 */
function parseAvailability(availability) {
  if (!availability) return new Date();
  
  const lower = availability.toLowerCase();
  const today = new Date();
  
  if (lower.includes('asap') || lower.includes('immediately') || lower.includes('now')) {
    return today;
  } else if (lower.includes('this week')) {
    return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (lower.includes('this month')) {
    return new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  
  return today;
}

/**
 * Parse response time in hours
 */
function parseResponseTime(responseTime) {
  if (!responseTime) return 24;
  
  const lower = responseTime.toLowerCase();
  
  if (lower.includes('same day')) return 4;
  if (lower.includes('24')) return 24;
  if (lower.includes('48')) return 48;
  
  return 24;
}

/**
 * Parse timeline for matching
 */
function parseTimeline(isEmergency) {
  if (!isEmergency) return 'flexible';
  
  const lower = isEmergency.toLowerCase();
  
  if (lower.includes('yes') || lower.includes('emergency')) {
    return 'urgent';
  } else if (lower.includes('week')) {
    return 'this_week';
  } else if (lower.includes('month')) {
    return 'this_month';
  }
  
  return 'flexible';
}

/**
 * Find renovation matches for a customer request
 */
export async function findRenovationMatches(requestId, limit = 3, seekerData = null) {
  try {
    const result = await query(
      'SELECT * FROM find_renovation_matches($1, $2)',
      [requestId, limit]
    );
    
    return result.rows.map(row => ({
      user_id: row.renovator_id,
      score: Math.round(row.match_score),
      name: row.name,
      rating: row.rating,
      completed_jobs: row.completed_jobs,
      services: row.services,
      availability_start: row.availability_start,
      hourly_rate_min: row.hourly_rate_min,
      hourly_rate_max: row.hourly_rate_max,
    }));
  } catch (error) {
    console.error('Error finding renovation matches:', error);
    // Fallback to in-memory cache if database fails
    console.log(`⚠️ Database query failed, trying in-memory cache...`);
    
    if (seekerData) {
      const cachedMatches = findCachedMatches(seekerData, limit);
      if (cachedMatches.length > 0) {
        console.log(`✅ Found ${cachedMatches.length} matches from in-memory cache`);
        return cachedMatches;
      }
    }
    
    return [];
  }
}

/**
 * Create renovation request
 */
export async function createRenovationRequest(userId, requestData) {
  try {
    // Skip database for now due to Supabase timeout issues
    // Generate a fake ID for cache-based matching
    const fakeId = `cache-${userId}-${Date.now()}`;
    console.log(`⏭️ Skipping database insert, using cache ID: ${fakeId}`);
    return fakeId;
  } catch (error) {
    console.error('Error creating renovation request:', error);
    return null;
  }
}

/**
 * Create renovation match
 */
export async function createRenovationMatch(requestId, renovatorId, customerId, matchScore, reason) {
  try {
    const result = await query(
      `INSERT INTO renovation_matches 
       (request_id, renovator_id, customer_id, match_score, match_reason, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [requestId, renovatorId, customerId, matchScore, reason, 'pending']
    );
    
    return result.rows[0]?.id;
  } catch (error) {
    console.error('Error creating renovation match:', error);
    return null;
  }
}

/**
 * Update provider profile
 */
export async function updateProviderProfile(userId, profileData) {
  try {
    // Cache the provider in memory immediately (for instant matching)
    cacheProvider(userId, profileData);
    console.log(`✅ Provider cached in memory for instant matching`);
    
    // Skip database for now due to Supabase timeout issues
    // Database will be attempted when it's back online
    console.log(`⏭️ Skipping database insert due to infrastructure issues`);
    console.log(`✅ Provider is cached in memory and ready for matching`);
    
    return true;
  } catch (error) {
    console.error('Error caching provider profile:', error);
    return false;
  }
}

/**
 * Get provider profile
 */
export async function getProviderProfile(userId) {
  try {
    const result = await query(
      'SELECT * FROM renovator_profiles WHERE user_id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting provider profile:', error);
    return null;
  }
}
