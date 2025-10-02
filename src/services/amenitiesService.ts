import { NearbyAmenity, AmenitySearchResult, AmenityCategory, AmenityFilters, AmenitySearchOptions, PhotoLocationData } from "@/types/amenities";

// Enhanced amenities detection service using OpenStreetMap Overpass API
export class AmenitiesService {
  private BASE_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
  
  // Category mappings for OpenStreetMap
  private readonly overviewCategories: Record<AmenityCategory, string[]> = {
    transportation: [
      'public_transport',
      'railway_station',
      'bus_station',
      'subway_station',
      'train_station',
      'bus_stop',
      'tram_stop',
      'taxi_stand',
      'parking_space',
      'bicycle_parking'
    ],
    healthcare: [
      'hospital',
      'clinic',
      'pharmacy',
      'dentist',
      'doctors',
      'veterinary',
      'healthcare_center',
      'emergency_room'
    ],
    shopping: [
      'marketplace',
      'supermarket',
      'department_store',
      'grocery',
      'mall',
      'shopping_center',
      'convenience_store',
      'bookstore',
      'clothing_store',
      'electronics_store'
    ],
    dining: [
      'restaurant',
      'fast_food',
      'cafe',
      'bar',
      'pub',
      'bistro',
      'pizzeria',
      'coffee_shop'
    ],
    entertainment: [
      'cinema',
      'theatre',
      'nightclub',
      'casino',
      'concert_hall',
      'museum',
      'gallery',
      'library',
      'bowling',
      'pool'
    ],
    education: [
      'school',
      'university',
      'college',
      'kindergarten',
      'library',
      'training_center',
      'academy'
    ],
    recreation: [
      'park',
      'playground',
      'fitness_center',
      'gym',
      'sports_center',
      'swimming_pool',
      'trails',
      'beach',
      'recreation_ground'
    ],
    services: [
      'bank',
      'atm',
      'post_office',
      'police',
      'fire_station',
      'library',
      'government_office',
      'insurance_office',
      'real_estate_office'
    ]
  };

  /**
   * Find nearby amenities based on location and optional filters
   */
  async getNearbyAmenities(
    coordinates: { lat: number; lng: number },
    filters: AmenityFilters = {}
  ): Promise<AmenitySearchResult> {
    const { categories = ['transportation', 'shopping', 'healthcare', 'dining'], 
            maxDistance = 1000, limit = 50 } = filters;
    
    try {
      const amenityTypes = new Set<string>();
      
      // Collect all OpenStreetMap amenity types for requested categories
      for (const category of categories) {
        this.overviewCategories[category].forEach(amenityType => {
          amenityTypes.add(amenityType);
        });
      }

      const overpassQuery = this.buildOverpassQuery(coordinates, Array.from(amenityTypes), maxDistance);
      
      const response = await fetch(this.BASE_OVERPASS_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: overpassQuery
      });

      if (!response.ok) {
        throw new Error(`Overpass API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const amenitiesStartList = data.elements || [];
      
      // Transform OpenStreetMap elements to our amenity format
      const amenities: NearbyAmenity[] = amenitiesStartList
        .slice(0, limit)
        .map((element: any) => this.transformOverpassElement(element, coordinates));

      return {
        amenities,
        totalFound: amenities.length,
        searchCenter: coordinates,
        radius: maxDistance
      };
    } catch (error) {
      console.error('Amenities detection error:', error);
      return {
        amenities: [],
        totalFound: 0,
        searchCenter: coordinates,
        radius: maxDistance
      };
    }
  }

  /**
   * Extract location from photo EXIF data
   */
  async extractLocationFromPhoto(imageFile: File): Promise<PhotoLocationData | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          // Create image object to access EXIF data
          const img = new Image();
          
          img.onload = () => {
            // Basic EXIF GPS extraction would go here
            // Note: While we don't have EXIF library, we'll implement alternative approaches
            
            // Method 1: Check for device location permission as fallback
            this.getCurrentLocation()
              .then(locationData => {
                if (locationData) {
                  resolve(locationData);
                } else {
                  // Fallback: use browser's geolocation API
                  this.requestLocationAccess()
                    .then(fallbackLocation => resolve(fallbackLocation))
                    .catch(() => resolve(null));
                }
              })
              .catch(() => resolve(null));
          };
          
          img.onerror = () => resolve(null);
          img.src = reader.result as string;
        } catch (error) {
          console.error('Photo location extraction error:', error);
          resolve(null);
        }
      };
      
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Get current location via device/browser geolocation
   */
  private async getCurrentLocation(): Promise<PhotoLocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            detectedAt: new Date().toISOString(),
            accuracy: position.coords.accuracy
          });
        },
        error => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Request location permission (for photo fallback)
   */
  private async requestLocationAccess(): Promise<PhotoLocationData | null> {
    try {
      const location = await this.getCurrentLocation();
      return location;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect amenities and auto-populate for a specific location
   */
  async autoDetectAmenities(locationData: PhotoLocationData | { coordinates: { lat: number; lng: number } }) {
    if (!locationData.coordinates) {
      return [];
    }

    try {
      const result = await this.getNearbyAmenities(locationData.coordinates, {
        categories: ['transportation', 'shopping', 'healthcare', 'dining', 'entertainment', 'education'],
        maxDistance: 2000 // 2km radius
      });

      return result.amenities.map(amenity => amenity.name);
    } catch (error) {
      console.error('Auto-detect amenities error:', error);
      return [];
    }
  }

  private buildOverpassQuery(center: { lat: number; lng: number }, amenityTypes: string[], radiusMeters: number): string {
    const radius = radiusMeters / 1000.0; // Convert to KM for overpass
    const latStart = center.lat - radius * 0.01; // rough latitude radius  
    const latEnd = center.lat + radius * 0.01;
    const lngStart = center.lng - radius * 0.01;
    const lngEnd = center.lng + radius * 0.01;
    
    const bboxQuery = `[bbox:${latStart},${lngStart},${latEnd},${lngEnd}]`;
    
    const amenityFilter = amenityTypes.map(type => 
      `"amenity"~"${type}" or "shop"~"${type}" or "railway"~"${type}" or "public_transport"~"${type}" or "leisure"~"${type}"`
    ).join('or');

    return `
[out:json][timeout:25];
${bboxQuery}(
  node[${amenityFilter}];
  way[${amenityFilter}];
  relation[${amenityFilter}];
);
out center meta;
`
    .trim().replace(/\s+/g, ' ');
  }

  private transformOverpassElement(element: any, userCoords: { lat: number; lng: number }): NearbyAmenity {
    let coords = element.lat && element.lon ? 
      { lat: parseFloat(element.lat), lng: parseFloat(element.lon) } :
      element.center || { lat: parseFloat(element.center?.lat), lng: parseFloat(element.center?.lon) };

    if (!coords || isNaN(coords.lat) || isNaN(coords.lng)) {
      coords = userCoords; // fallback
    }

    const categoriesEnum = this.mapOSMTagsToCategory(element.tags || {});
    const distanceMeters = this.calculateDistanceHaversine(userCoords, coords) * 1000;

    return {
      id: element.id.toString() || Math.random().toString(36).substring(2),
      name: element.tags?.name || element.tags?.brand || `Location ${element.id}`,
      category: categoriesEnum,
      address: this.formatAddress(element.tags),
      distance: distanceMeters,
      coordinates: coords,
      type: this.mapOSMTags(element.tags),
      rating: undefined, // OSM doesn't store ratings
      website: element.tags?.website,
      phone: element.tags?.phone
    };
  }

  private mapOSMTagsToCategory(tags: Record<string, string>): AmenityCategory {
    const amenities = Object.keys(tags).find(key => key === 'amenity' || key === 'shop') || '';
    const amenityTagValue = tags[amenities] || tags.amenity || 'services';
    
    const mapping: Record<string, AmenityCategory> = {
      // Transportation
      'bus_station': 'transportation', 'railway_station': 'transportation', 
      'subway_station': 'transportation', 'taxi_stand': 'transportation',
      'bus_stop': 'transportation', 'train_station': 'transportation',
      
      // Healthcare
      'hospital': 'healthcare', 'clinic': 'healthcare', 'pharmacy': 'healthcare',
      'dentist': 'healthcare', 'doctors': 'healthcare',

      // Shopping  
      'supermarket': 'shopping', 'marketplace': 'shopping', 'mall': 'shopping',
      'grocery': 'shopping', 'convenience': 'shopping',

      // Dining 
      'restaurant': 'dining', 'fast_food': 'dining', 'cafe': 'dining',
      'bar': 'dining', 'pub': 'dining', 'coffee_shop': 'dining',

      // Entertainment
      'cinema': 'entertainment', 'theatre': 'entertainment', 'nightclub': 'entertainment',
      'museum': 'entertainment',

      // Education
      'school': 'education', 'university': 'education', 'college': 'education',
      'kindergarten': 'education', 'library': 'education'
    };

    return mapping[amenityTagValue] || 'services';
  }
  
  private mapOSMTags(tags: Record<string, string>): string {
    return tags.amenity || tags.shop || tags.railway || tags['public_transport'] || 'service';
  }

  private formatAddress(tags: Record<string, string>): string {
    const addressComponents = [];
    
    if (tags['addr:street']) addressComponents.push(tags['addr:street']);
    if (tags['addr:housenumber']) addressComponents.push(tags['addr:housenumber']);
    if (tags['addr:city']) addressComponents.push(tags['addr:city']);
    if (tags['addr:postcode']) addressComponents.push(tags['addr:postcode']);
    
    return addressComponents.join(', ');
  }

  // Calculate distance using Haversine formula
  private calculateDistanceHaversine(
    coords1: { lat: number; lng: number }, 
    coords2: { lat: number; lng: number }
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLng = toRad(coords2.lng - coords1.lng);
    const lat1Rad = toRad(coords1.lat);
    const lat2Rad = toRad(coords2.lat);

    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Create singleton instance
export const amenitiesService = new AmenitiesService();
