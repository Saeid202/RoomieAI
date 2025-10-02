// Enhanced types for automatic amenities detection
export interface NearbyAmenity {
  id: string;
  name: string;
  category: AmenityCategory;
  address: string;
  distance: number; // in meters
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  rating?: number;
  website?: string;
  phone?: string;
}

export interface AmenitySearchResult {
  amenities: NearbyAmenity[];
  totalFound: number;
  searchCenter: {
    lat: number;
    lng: number;
  };
  radius: number; // search radius in meters
}

export type AmenityCategory = 
  | 'transportation' 
  | 'shopping' 
  | 'healthcare' 
  | 'dining' 
  | 'entertainment' 
  | 'education' 
  | 'recreation'
  | 'services';

export interface AmenityFilters {
  categories?: AmenityCategory[];
  maxDistance?: number; // in meters
  minRating?: number;
  limit?: number;
}

export interface PhotoLocationData {
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  amenities?: NearbyAmenity[];
  detectedAt: string;
  accuracy?: number; // GPS accuracy in meters
}

export type AmenitySearchOptions = {
  radiusMeters?: number;
  categories?: AmenityCategory[];
  maxResults?: number;
  deviceLocation?: boolean; // detect browser location for photos
};
