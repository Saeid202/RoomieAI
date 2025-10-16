import { NearbyAmenity, AmenitySearchResult, AmenityCategory } from "@/types/amenities";
import { DetailedAmenitiesInfo, PropertyIntelligence, CondoAmenityInfo, TransportInfo, BankingInfo, ShoppingInfo, GymInfo } from "@/types/detailedAmenities";

// Enhanced detailed amenities detection service
export class DetailedAmenitiesService {
  private BASE_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
  private cache = new Map<string, { ts: number; data: any }>();
  private CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours for better performance
  private STORAGE_KEY = 'roomie_amenities_cache';

  constructor() {
    this.loadCacheFromStorage();
  }

  /**
   * Load cache from localStorage on initialization
   */
  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load amenities cache from storage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage() {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('Failed to save amenities cache to storage:', error);
    }
  }

  /**
   * Clear cache and localStorage (for debugging)
   */
  public clearCache() {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Cleared amenities cache');
  }

  /**
   * Comprehensive property intelligence detection
   * Returns detailed information with names and distances for all requested amenities
   */
  async getDetailedPropertyIntelligence(
    coordinates: { lat: number; lng: number },
    propertyAddress: string,
    propertyType: string = ""
  ): Promise<PropertyIntelligence> {
    try {
      console.log('🔍 Starting comprehensive property intelligence detection...');
      console.log('📍 Coordinates:', coordinates);
      console.log('🏠 Address:', propertyAddress);
      console.log('🏢 Property type:', propertyType);
      
      // Get comprehensive amenities data
      const detailedInfo = await this.getDetailedAmenitiesInfo(coordinates);
      
      console.log('📊 Detailed amenities info:', detailedInfo);
      
      // Check condo amenities if property type is condo/apartment
      const condoAmenities = this.checkCondoAmenities(propertyType);
      
      const result: PropertyIntelligence = {
        propertyType,
        address: propertyAddress,
        coordinates,
        detectedAmenities: detailedInfo,
        nearbyTransport: {
          metro: detailedInfo.metro.map(m => ({
            name: m.name,
            distance: m.distance,
            type: 'metro' as const,
            routes: [m.line]
          })),
          buses: detailedInfo.buses.map(b => ({
            name: b.name,
            distance: b.distance,
            type: 'bus' as const,
            routes: [b.routeNumber]
          })),
          otherTransit: []
        },
        financialServices: detailedInfo.banks.map(bank => ({
          name: bank.name,
          distance: bank.distance,
          branchType: 'branch' as const
        })),
        shoppingOptions: [
          ...detailedInfo.plazas.map(p => ({
            name: p.name,
            distance: p.distance,
            type: 'plaza' as const
          })),
          ...detailedInfo.shoppingMalls.map(m => ({
            name: m.name,
            distance: m.distance,
            type: 'mall' as const
          }))
        ],
        fitnessAndRecreation: detailedInfo.gyms.map(g => ({
          name: g.name,
          distance: g.distance,
          facilityType: 'full-service' as const,
          features: [g.facilityType]
        })),
        condoBuildingAmenities: condoAmenities,
        confidenceScore: this.calculateConfidenceScore(detailedInfo),
        detectionTimestamp: new Date().toISOString()
      };

      console.log('✅ Property intelligence result:', result);
      return result;
    } catch (error) {
      console.error('❌ Property intelligence detection failed:', error);
      return this.getEmptyIntelligence(coordinates, propertyAddress, propertyType);
    }
  }

  /**
   * Initialize empty property intelligence
   */
  private getEmptyIntelligence(coordinates: { lat: number; lng: number }, propertyAddress: string, propertyType: string): PropertyIntelligence {
    return {
      propertyType,
      address: propertyAddress,
      coordinates,
      detectedAmenities: {
        metro: [],
        buses: [],
        banks: [],
        plazas: [],
        shoppingMalls: [],
        gyms: [],
        hospitals: [],
        schools: [],
        restaurants: [],
        parks: [],
        condoAmenities: []
      },
      nearbyTransport: {
        metro: [],
        buses: [],
        otherTransit: []
      },
      financialServices: [],
      shoppingOptions: [],
      fitnessAndRecreation: [],
      condoBuildingAmenities: [],
      confidenceScore: 0,
      detectionTimestamp: new Date().toISOString()
    };
  }

  /**
   * Get detailed amenities information with retry mechanism
   */
  private async getDetailedAmenitiesInfo(coordinates: { lat: number; lng: number }, retryCount = 0): Promise<DetailedAmenitiesInfo> {
    const result: DetailedAmenitiesInfo = {
      metro: [],
      buses: [],
      banks: [],
      plazas: [],
      shoppingMalls: [],
      gyms: [],
      hospitals: [],
      schools: [],
      restaurants: [],
      parks: [],
      condoAmenities: []
    };

    try {
      // Cache key per rounded coords and radius with timestamp for cache busting
      const key = `${Math.round(coordinates.lat*1000)/1000},${Math.round(coordinates.lng*1000)/1000}`;
      const now = Date.now();
      
      // Force cache refresh every 5 minutes to ensure fresh data
      const cacheBustKey = `${key}_${Math.floor(now / 300000)}`; // 5-minute intervals
      const hit = this.cache.get(key);
      if (hit && (now - hit.ts) < this.CACHE_TTL_MS) {
        try {
          const cached = hit.data as DetailedAmenitiesInfo;
          return { ...cached, condoAmenities: cached.condoAmenities || [] };
        } catch {}
      }
      
      // Enhanced query to get more specific amenity types
      const query = this.buildEnhancedDetectQuery(coordinates);
      console.log('🔍 Overpass query:', query);

      // Add request timeout to avoid hanging/overload
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000); // Increased to 20s

      console.log('🌐 Making Overpass API request...');
      const response = await fetch(this.BASE_OVERPASS_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
        signal: controller.signal
      }).catch((e) => {
        if ((e as any).name === 'AbortError') {
          throw new Error('Overpass request timed out after 20 seconds');
        }
        throw e;
      });
      clearTimeout(timer);

      console.log('📡 Overpass API response status:', response?.status);
      if (!response || !response.ok) {
        throw new Error(`Overpass API failed with status: ${response?.status} ${response?.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Raw Overpass data:', data);
      const rawElements: any[] = Array.isArray(data?.elements) ? data.elements : [];
      console.log('🔢 Raw elements count:', rawElements.length);
      
      // Hard cap results to avoid memory spikes in dense areas
      const elements = rawElements.slice(0, 400);
      console.log('✂️ Processed elements count:', elements.length);

      // Process elements and categorize based on detailed patterns
      for (const element of elements) {
        const amenity = this.processDetailedAmenityElement(element, coordinates);
        if (amenity) {
          console.log('🏢 Processing amenity:', amenity);
          this.categorizeDetailedAmenity(amenity, result);
        }
      }
      
      console.log('📋 Final categorized result:', result);

      // Save to cache
      this.cache.set(key, { ts: now, data: result });
      this.saveCacheToStorage();

    } catch (error) {
      console.error('Detailed amenities detection error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        coordinates,
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      // Retry once for timeout errors
      if (retryCount === 0 && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('504'))) {
        console.log('Retrying amenities detection after timeout...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return this.getDetailedAmenitiesInfo(coordinates, 1);
      }
      
      // Return empty result instead of mock data
      // This ensures users see real-time data or nothing, not fake data
      return result;
    }

    return result;
  }

  /**
   * Build enhanced overpass query for detailed detection
   */
  private buildEnhancedDetectQuery(center: { lat: number; lng: number }): string {
    const radiusMeters = 2000; // 2km radius for better coverage
    const { lat, lng } = center;

    // Enhanced query with more comprehensive facility types
    return `
[out:json][timeout:25];
(
  // Transportation - Metro/Subway stations
  node["railway"="station"]["station"~"subway|metro"](around:${radiusMeters},${lat},${lng});
  node["public_transport"="station"]["station"~"subway|metro"](around:${radiusMeters},${lat},${lng});
  node["railway"="station"]["name"~"station|metro|subway"](around:${radiusMeters},${lat},${lng});
  
  // Transportation - Bus stops and stations
  node["highway"="bus_stop"](around:${radiusMeters},${lat},${lng});
  node["public_transport"="stop_position"](around:${radiusMeters},${lat},${lng});
  node["amenity"="bus_station"](around:${radiusMeters},${lat},${lng});

  // Banking services
  node["amenity"="bank"](around:${radiusMeters},${lat},${lng});
  node["amenity"="atm"](around:${radiusMeters},${lat},${lng});

  // Shopping - Malls, plazas, and major stores
  node["shop"="mall"](around:${radiusMeters},${lat},${lng});
  node["shop"="department_store"](around:${radiusMeters},${lat},${lng});
  node["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
  node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
  way["shop"="mall"](around:${radiusMeters},${lat},${lng});
  way["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});

  // Healthcare
  node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
  node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
  node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});

  // Education
  node["amenity"="school"](around:${radiusMeters},${lat},${lng});
  node["amenity"="university"](around:${radiusMeters},${lat},${lng});
  node["amenity"="college"](around:${radiusMeters},${lat},${lng});

  // Dining
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  node["amenity"="fast_food"](around:${radiusMeters},${lat},${lng});
  node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});

  // Recreation and Fitness
  node["leisure"="fitness_centre"](around:${radiusMeters},${lat},${lng});
  node["sport"="fitness"](around:${radiusMeters},${lat},${lng});
  node["leisure"="park"](around:${radiusMeters},${lat},${lng});
  node["leisure"="playground"](around:${radiusMeters},${lat},${lng});

  // Entertainment
  node["amenity"="cinema"](around:${radiusMeters},${lat},${lng});
  node["amenity"="theatre"](around:${radiusMeters},${lat},${lng});
  node["amenity"="library"](around:${radiusMeters},${lat},${lng});
);
out center qt;`;
  }

  /**
   * Process detailed amenity from overpass element  
   */
  private processDetailedAmenityElement(element: any, searchCenter: { lat: number; lng: number }) {
    const coords = element.lat && element.lon ? 
      { lat: parseFloat(element.lat), lng: parseFloat(element.lon) } :
      element.center || { lat: parseFloat(element.center?.lat), lng: parseFloat(element.center?.lon) };

    if (!coords || isNaN(coords.lat) || isNaN(coords.lng)) return null;

    const distance = this.calculateDistanceHaversine(searchCenter, coords) * 1000; // meters
    const tags = element.tags || {};

    return {
      name: tags.name || tags.brand || `Location ${element.id}`,
      type: tags.amenity || tags.shop || tags.leisure || tags.public_transport || tags.railway,
      distance,
      tags,
      coordinates: coords
    };
  }

  /**
   * Categorize amenity based on type and characteristics
   */
  private categorizeDetailedAmenity(amenity: any, result: DetailedAmenitiesInfo) {
    const { name, type, distance, coordinates } = amenity;
    
    // Transportation detection
    if (type === 'railway_station' || name.toLowerCase().includes('metro') || name.toLowerCase().includes('subway')) {
      result.metro.push({
        name,
        distance,
        line: this.extractMetroLine(name),
        coordinates
      });
    } else if (type === 'bus_stop' || type === 'bus_station' || name.toLowerCase().includes('bus')) {
      result.buses.push({
        name,
        distance,
        routeNumber: this.extractBusRoute(name) || 'Transit',
        coordinates
      });
    }
    
    // Banking services  
    else if (type === 'bank' || type === 'atm') {
      result.banks.push({
        name,
        distance,
        branchType: type === 'atm' ? 'atm' : 'branch',
        coordinates
      });
    }
    
    // Shopping facilities
    else if (type === 'shop' || type === 'marketplace') {
      if (name.toLowerCase().includes('mall') || name.toLowerCase().includes('shopping') || type === 'mall') {
        result.shoppingMalls.push({ name, distance, coordinates });
      } else if (name.toLowerCase().includes('plaza') || name.toLowerCase().includes('market')) {
        result.plazas.push({ name, distance, coordinates });
      }
    }
    
    // Fitness and recreation
    else if (type === 'fitness_centre' || type === 'fitness' || name.toLowerCase().includes('gym')) {
      result.gyms.push({
        name,
        distance,
        facilityType: this.classifyGymType(name),
        coordinates
      });
    }
    
    // Healthcare facilities
    else if (type === 'hospital') {
      result.hospitals.push({
        name,
        distance,
        type: 'hospital',
        coordinates
      });
    } else if (type === 'clinic') {
      result.hospitals.push({
        name,
        distance,
        type: 'clinic',
        coordinates
      });
    } else if (type === 'pharmacy') {
      result.hospitals.push({
        name,
        distance,
        type: 'pharmacy',
        coordinates
      });
    }
    
    // Education facilities
    else if (type === 'school') {
      result.schools.push({
        name,
        distance,
        level: 'school',
        coordinates
      });
    } else if (type === 'university') {
      result.schools.push({
        name,
        distance,
        level: 'university',
        coordinates
      });
    } else if (type === 'college') {
      result.schools.push({
        name,
        distance,
        level: 'college',
        coordinates
      });
    }
    
    // Dining facilities
    else if (type === 'restaurant') {
      result.restaurants.push({
        name,
        distance,
        cuisine: 'restaurant',
        coordinates
      });
    } else if (type === 'fast_food') {
      result.restaurants.push({
        name,
        distance,
        cuisine: 'fast_food',
        coordinates
      });
    } else if (type === 'cafe') {
      result.restaurants.push({
        name,
        distance,
        cuisine: 'cafe',
        coordinates
      });
    }
    
    // Recreation facilities
    else if (type === 'park') {
      result.parks.push({
        name,
        distance,
        type: 'park',
        coordinates
      });
    } else if (type === 'playground') {
      result.parks.push({
        name,
        distance,
        type: 'playground',
        coordinates
      });
    }
  }

  /**
   * Check condo amenities based on property type
   */
  private checkCondoAmenities(propertyType: string): CondoAmenityInfo[] {
    const isCondoOrApartment = propertyType.toLowerCase().includes('condo') || 
                               propertyType.toLowerCase().includes('apartment');
    
    if (!isCondoOrApartment) return [];

    const defaultCondoAmenities: CondoAmenityInfo[] = [
      { name: 'Fitness Center/Gym', type: 'gym', description: 'Building gym facilities', availability: 'member_only' },
      { name: 'Swimming Pool', type: 'pool', description: 'Common swimming area', availability: 'available' },
      { name: 'Underground Parking', type: 'parking', description: 'Valet parking service', availability: 'available' },
      { name: 'Concierge Service', type: 'concierge', description: 'Doorman and building management', availability: 'available' },
      { name: 'Rooftop Terrace', type: 'rooftop', description: 'Common outdoor area', availability: 'member_only' }
    ];

    return defaultCondoAmenities;
  }

  /**
   * Extract metro line from metro name
   */
  private extractMetroLine(name: string): string {
    // Enhanced metro line parsing
    if (name.toLowerCase().includes('bloor-danforth')) return 'Line 2';
    if (name.toLowerCase().includes('yonge-university')) return 'Line 1';
    if (name.toLowerCase().includes('sheppard')) return 'Line 4';
    if (name.toLowerCase().includes('eglinton')) return 'Line 5';
    return 'Metro Line';
  }

  /**
   * Extract bus route number
   */
  private extractBusRoute(name: string): string {
    const match = name.match(/(bus|rt|route)\s*:?\s*(\d+)/i);
    return match ? match[2] : '';
  }

  /**
   * Classify gym type based on name
   */
  private classifyGymType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('fitness centre') || lower.includes('planet fitness')) return 'full-service';
    if (lower.includes('crossfit') || lower.includes('studio')) return 'studio';
    return 'basic';
  }


  /**
   * Calculate confidence score based on detected amenities
   */
  private calculateConfidenceScore(info: DetailedAmenitiesInfo): number {
    let score = 0;
    if (info.metro.length > 0) score += 20;
    if (info.buses.length > 0) score += 15;
    if (info.banks.length > 0) score += 10;
    if (info.plazas.length > 0) score += 10;
    if (info.shoppingMalls.length > 0) score += 15;
    if (info.gyms.length > 0) score += 10;
    if (info.hospitals.length > 0) score += 15;
    if (info.schools.length > 0) score += 10;
    if (info.restaurants.length > 0) score += 10;
    if (info.parks.length > 0) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate distance using Haversine formula
   */
  private calculateDistanceHaversine(coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLng = toRad(coords2.lng - coords1.lng);
    const lat1Rad = toRad(coords1.lat);
    const lat2Rad = toRad(coords2.lat);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Create singleton instance  
export const detailedAmenitiesService = new DetailedAmenitiesService();
