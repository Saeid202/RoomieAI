/**
 * In-memory matching cache for when Supabase is experiencing issues
 * This allows the system to continue matching users even during database downtime
 */

// Store providers and seekers in memory
const providers = new Map(); // userId -> provider profile
const seekers = new Map();   // userId -> seeker request

/**
 * Register a provider in the in-memory cache
 */
export function cacheProvider(userId, profileData) {
  console.log(`💾 Caching provider ${userId} in memory`);
  providers.set(userId, {
    userId,
    ...profileData,
    registeredAt: new Date(),
  });
  console.log(`📊 Total providers in cache: ${providers.size}`);
}

/**
 * Register a seeker request in the in-memory cache
 */
export function cacheSeeker(userId, requestData) {
  console.log(`💾 Caching seeker request ${userId} in memory`);
  seekers.set(userId, {
    userId,
    ...requestData,
    requestedAt: new Date(),
  });
  console.log(`📊 Total seekers in cache: ${seekers.size}`);
}

/**
 * Find matches for a seeker from cached providers
 */
export function findCachedMatches(seekerData, limit = 3) {
  console.log(`🔍 Finding cached matches for seeker in ${seekerData.city}`);
  
  if (providers.size === 0) {
    console.log(`⚠️ No providers in cache yet`);
    return [];
  }

  const matches = [];

  for (const [providerId, provider] of providers) {
    // Skip if it's the same user
    if (providerId === seekerData.user_id) continue;

    // Calculate match score
    let score = 0;

    // Location match (30 points)
    if (provider.city && seekerData.city) {
      const providerCity = provider.city.toLowerCase();
      const seekerCity = seekerData.city.toLowerCase();
      
      if (providerCity === seekerCity) {
        score += 30;
      } else if (providerCity.includes(seekerCity) || seekerCity.includes(providerCity)) {
        score += 20; // Partial match
      }
    }

    // Service match (40 points)
    if (provider.service_categories && seekerData.work_type) {
      const services = Array.isArray(provider.service_categories) 
        ? provider.service_categories.map(s => s.toLowerCase())
        : [];
      const workType = seekerData.work_type.toLowerCase();
      
      if (services.some(s => s.includes('general') || workType.includes('general'))) {
        score += 40; // General renovation matches everything
      } else if (services.some(s => s.includes(workType) || workType.includes(s))) {
        score += 40;
      }
    }

    // Availability match (20 points)
    if (provider.availability_start) {
      const availDate = new Date(provider.availability_start);
      const now = new Date();
      if (availDate <= now) {
        score += 20; // Provider is available now
      }
    }

    // Rating/quality match (10 points)
    if (provider.rating && provider.rating >= 4.5) {
      score += 10;
    }

    if (score > 0) {
      matches.push({
        user_id: providerId,
        score,
        name: provider.name || 'Renovator',
        rating: provider.rating || 0,
        completed_jobs: provider.completed_jobs || 0,
        services: provider.service_categories || [],
        availability_start: provider.availability_start,
        hourly_rate_min: provider.hourly_rate_min || 0,
        hourly_rate_max: provider.hourly_rate_max || 0,
      });
    }
  }

  // Sort by score descending and return top matches
  matches.sort((a, b) => b.score - a.score);
  const topMatches = matches.slice(0, limit);
  
  console.log(`✅ Found ${topMatches.length} cached matches (score: ${topMatches.map(m => m.score).join(', ')})`);
  return topMatches;
}

/**
 * Get all cached providers (for debugging)
 */
export function getCachedProviders() {
  return Array.from(providers.values());
}

/**
 * Get all cached seekers (for debugging)
 */
export function getCachedSeekers() {
  return Array.from(seekers.values());
}

/**
 * Clear all caches (for testing)
 */
export function clearAllCaches() {
  console.log(`🗑️ Clearing all in-memory caches`);
  providers.clear();
  seekers.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    providersCount: providers.size,
    seekersCount: seekers.size,
    providers: Array.from(providers.keys()),
    seekers: Array.from(seekers.keys()),
  };
}
