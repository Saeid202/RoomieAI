import { NearbyAmenity, AmenitySearchResult, AmenityCategory } from "@/types/amenities";
import { DetailedAmenitiesInfo, PropertyIntelligence, CondoAmenityInfo, TransportInfo, BankingInfo, ShoppingInfo, GymInfo } from "@/types/detailedAmenities";

// Enhanced detailed amenities detection service
export class DetailedAmenitiesService {
  private BASE_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
  private cache = new Map<string, { ts: number; data: any }>();
  private CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours for better performance
  private STORAGE_KEY = 'roomie_amenities_cache_v2';

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
   * Get detailed amenities information with parallel query execution
   * Splits queries into 3 parallel requests for better performance
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
      // Cache key per rounded coords
      const key = `${Math.round(coordinates.lat * 1000) / 1000},${Math.round(coordinates.lng * 1000) / 1000}`;
      const now = Date.now();

      // Check cache first
      const hit = this.cache.get(key);
      if (hit && (now - hit.ts) < this.CACHE_TTL_MS) {
        try {
          const cached = hit.data as DetailedAmenitiesInfo;
          console.log('✅ Cache hit for amenities');
          return { ...cached, condoAmenities: cached.condoAmenities || [] };
        } catch { }
      }

      console.log('🌐 Starting parallel amenities queries...');
      
      // Execute 3 queries in parallel for better performance
      const [transportResults, financialResults, healthRecResults] = await Promise.all([
        this.queryTransportAmenities(coordinates),
        this.queryFinancialAndShopping(coordinates),
        this.queryHealthRecreationEducation(coordinates)
      ]);

      // Merge results
      result.metro = transportResults.metro;
      result.buses = transportResults.buses;
      result.banks = financialResults.banks;
      result.plazas = financialResults.plazas;
      result.shoppingMalls = financialResults.shoppingMalls;
      result.hospitals = healthRecResults.hospitals;
      result.schools = healthRecResults.schools;
      result.restaurants = healthRecResults.restaurants;
      result.gyms = healthRecResults.gyms;
      result.parks = healthRecResults.parks;

      console.log('📋 Final merged result:', result);

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
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getDetailedAmenitiesInfo(coordinates, 1);
      }

      return result;
    }

    return result;
  }

  /**
   * Query transportation amenities (metro, buses)
   */
  private async queryTransportAmenities(coordinates: { lat: number; lng: number }): Promise<Partial<DetailedAmenitiesInfo>> {
    const result: Partial<DetailedAmenitiesInfo> = { metro: [], buses: [] };
    
    try {
      const query = this.buildTransportQuery(coordinates);
      const elements = await this.executeOverpassQuery(query, 'transport');
      
      for (const element of elements) {
        const amenity = this.processDetailedAmenityElement(element, coordinates);
        if (amenity) {
          this.categorizeDetailedAmenity(amenity, result as DetailedAmenitiesInfo);
        }
      }
    } catch (error) {
      console.warn('Transport query failed:', error);
    }
    
    return result;
  }

  /**
   * Query financial and shopping amenities
   */
  private async queryFinancialAndShopping(coordinates: { lat: number; lng: number }): Promise<Partial<DetailedAmenitiesInfo>> {
    const result: Partial<DetailedAmenitiesInfo> = { banks: [], plazas: [], shoppingMalls: [] };
    
    try {
      const query = this.buildFinancialShoppingQuery(coordinates);
      const elements = await this.executeOverpassQuery(query, 'financial');
      
      for (const element of elements) {
        const amenity = this.processDetailedAmenityElement(element, coordinates);
        if (amenity) {
          this.categorizeDetailedAmenity(amenity, result as DetailedAmenitiesInfo);
        }
      }
    } catch (error) {
      console.warn('Financial/Shopping query failed:', error);
    }
    
    return result;
  }

  /**
   * Query health, recreation, and education amenities
   */
  private async queryHealthRecreationEducation(coordinates: { lat: number; lng: number }): Promise<Partial<DetailedAmenitiesInfo>> {
    const result: Partial<DetailedAmenitiesInfo> = { 
      hospitals: [], 
      schools: [], 
      restaurants: [], 
      gyms: [], 
      parks: [] 
    };
    
    try {
      const query = this.buildHealthRecEducationQuery(coordinates);
      const elements = await this.executeOverpassQuery(query, 'health');
      
      for (const element of elements) {
        const amenity = this.processDetailedAmenityElement(element, coordinates);
        if (amenity) {
          this.categorizeDetailedAmenity(amenity, result as DetailedAmenitiesInfo);
        }
      }
    } catch (error) {
      console.warn('Health/Recreation query failed:', error);
    }
    
    return result;
  }

  /**
   * Execute Overpass query with timeout and error handling
   */
  private async executeOverpassQuery(query: string, queryType: string): Promise<any[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000); // 10 second timeout per query

    try {
      console.log(`🔍 Executing ${queryType} query...`);
      const response = await fetch(this.BASE_OVERPASS_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Overpass API failed with status: ${response.status}`);
      }

      const data = await response.json();
      const elements: any[] = Array.isArray(data?.elements) ? data.elements : [];
      
      console.log(`✅ ${queryType} query returned ${elements.length} elements`);
      return elements;
    } catch (error) {
      clearTimeout(timer);
      if ((error as any).name === 'AbortError') {
        throw new Error(`${queryType} query timed out after 10 seconds`);
      }
      throw error;
    }
  }

  /**
   * Build transport query (metro, buses)
   */
  private buildTransportQuery(center: { lat: number; lng: number }): string {
    const radiusMeters = 2000;
    const { lat, lng } = center;

    return `
[out:json][timeout:10];
(
  node["railway"="station"]["station"~"subway|metro"](around:${radiusMeters},${lat},${lng});
  node["public_transport"="station"]["station"~"subway|metro"](around:${radiusMeters},${lat},${lng});
  node["highway"="bus_stop"](around:${radiusMeters},${lat},${lng});
  node["amenity"="bus_station"](around:${radiusMeters},${lat},${lng});
);
out center qt;`;
  }

  /**
   * Build financial and shopping query
   */
  private buildFinancialShoppingQuery(center: { lat: number; lng: number }): string {
    const radiusMeters = 2000;
    const { lat, lng } = center;

    return `
[out:json][timeout:10];
(
  node["amenity"="bank"](around:${radiusMeters},${lat},${lng});
  node["shop"="mall"](around:${radiusMeters},${lat},${lng});
  node["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
  node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
  way["shop"="mall"](around:${radiusMeters},${lat},${lng});
);
out center qt;`;
  }

  /**
   * Build health, recreation, and education query
   */
  private buildHealthRecEducationQuery(center: { lat: number; lng: number }): string {
    const radiusMeters = 2000;
    const { lat, lng } = center;

    return `
[out:json][timeout:10];
(
  node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
  node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
  node["amenity"="school"](around:${radiusMeters},${lat},${lng});
  node["amenity"="university"](around:${radiusMeters},${lat},${lng});
  node["leisure"="fitness_centre"](around:${radiusMeters},${lat},${lng});
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  node["leisure"="park"](around:${radiusMeters},${lat},${lng});
);
out center qt;`;
  }


  private processDetailedAmenityElement(element: any, searchCenter: { lat: number; lng: number }) {
    const coords = element.lat && element.lon ?
      { lat: parseFloat(element.lat), lng: parseFloat(element.lon) } :
      element.center || { lat: parseFloat(element.center?.lat), lng: parseFloat(element.center?.lon) };

    if (!coords || isNaN(coords.lat) || isNaN(coords.lng)) return null;

    const distance = this.calculateDistanceHaversine(searchCenter, coords); // meters
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
   * Now with intelligent result limiting per category
   */
  private categorizeDetailedAmenity(amenity: any, result: DetailedAmenitiesInfo) {
    const { name, type, distance, coordinates } = amenity;

    // Intelligent result limiting per category
    const LIMITS = {
      metro: 3,
      buses: 5,
      banks: 3,
      plazas: 4,
      shoppingMalls: 3,
      gyms: 3,
      hospitals: 3,
      schools: 3,
      restaurants: 5,
      parks: 3
    };

    // Transportation detection
    if ((type === 'railway_station' || name.toLowerCase().includes('metro') || name.toLowerCase().includes('subway')) &&
      type !== 'fast_food' && type !== 'restaurant') {
      if (result.metro.length < LIMITS.metro) {
        result.metro.push({
          name,
          distance,
          line: this.extractMetroLine(name),
          coordinates
        });
      }
    } else if (type === 'bus_stop' || type === 'bus_station' || name.toLowerCase().includes('bus')) {
      if (result.buses.length < LIMITS.buses) {
        result.buses.push({
          name,
          distance,
          routeNumber: this.extractBusRoute(name) || 'Transit',
          coordinates
        });
      }
    }

    // Banking services  
    else if (type === 'bank' || type === 'atm') {
      if (result.banks.length < LIMITS.banks) {
        result.banks.push({
          name,
          distance,
          branchType: type === 'atm' ? 'atm' : 'branch',
          coordinates
        });
      }
    }

    // Shopping facilities
    else if (type === 'shop' || type === 'marketplace') {
      if (name.toLowerCase().includes('mall') || name.toLowerCase().includes('shopping') || type === 'mall') {
        if (result.shoppingMalls.length < LIMITS.shoppingMalls) {
          result.shoppingMalls.push({ name, distance, coordinates });
        }
      } else if (name.toLowerCase().includes('plaza') || name.toLowerCase().includes('market')) {
        if (result.plazas.length < LIMITS.plazas) {
          result.plazas.push({ name, distance, coordinates });
        }
      }
    }

    // Fitness and recreation
    else if (type === 'fitness_centre' || type === 'fitness' || name.toLowerCase().includes('gym')) {
      if (result.gyms.length < LIMITS.gyms) {
        result.gyms.push({
          name,
          distance,
          facilityType: this.classifyGymType(name),
          coordinates
        });
      }
    }

    // Healthcare facilities
    else if (type === 'hospital') {
      if (result.hospitals.length < LIMITS.hospitals) {
        result.hospitals.push({
          name,
          distance,
          type: 'hospital',
          coordinates
        });
      }
    } else if (type === 'clinic') {
      if (result.hospitals.length < LIMITS.hospitals) {
        result.hospitals.push({
          name,
          distance,
          type: 'clinic',
          coordinates
        });
      }
    } else if (type === 'pharmacy') {
      if (result.hospitals.length < LIMITS.hospitals) {
        result.hospitals.push({
          name,
          distance,
          type: 'pharmacy',
          coordinates
        });
      }
    }

    // Education facilities
    else if (type === 'school') {
      if (result.schools.length < LIMITS.schools) {
        result.schools.push({
          name,
          distance,
          level: 'school',
          coordinates
        });
      }
    } else if (type === 'university') {
      if (result.schools.length < LIMITS.schools) {
        result.schools.push({
          name,
          distance,
          level: 'university',
          coordinates
        });
      }
    } else if (type === 'college') {
      if (result.schools.length < LIMITS.schools) {
        result.schools.push({
          name,
          distance,
          level: 'college',
          coordinates
        });
      }
    }

    // Dining facilities
    else if (type === 'restaurant') {
      if (result.restaurants.length < LIMITS.restaurants) {
        result.restaurants.push({
          name,
          distance,
          cuisine: 'restaurant',
          coordinates
        });
      }
    } else if (type === 'fast_food') {
      if (result.restaurants.length < LIMITS.restaurants) {
        result.restaurants.push({
          name,
          distance,
          cuisine: 'fast_food',
          coordinates
        });
      }
    } else if (type === 'cafe') {
      if (result.restaurants.length < LIMITS.restaurants) {
        result.restaurants.push({
          name,
          distance,
          cuisine: 'cafe',
          coordinates
        });
      }
    }

    // Recreation facilities
    else if (type === 'park') {
      if (result.parks.length < LIMITS.parks) {
        result.parks.push({
          name,
          distance,
          type: 'park',
          coordinates
        });
      }
    } else if (type === 'playground') {
      if (result.parks.length < LIMITS.parks) {
        result.parks.push({
          name,
          distance,
          type: 'playground',
          coordinates
        });
      }
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
    return '';
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

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Create singleton instance  
export const detailedAmenitiesService = new DetailedAmenitiesService();
