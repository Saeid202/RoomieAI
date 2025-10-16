// Enhanced types for detailed amenities detection with names and distances
export interface DetailedAmenitiesInfo {
  metro: Array<{
    name: string;
    distance: number; // in meters
    line: string;
    coordinates: { lat: number; lng: number };
  }>;
  buses: Array<{
    name: string;
    distance: number;
    routeNumber: string;
    coordinates: { lat: number; lng: number };
  }>;
  banks: Array<{
    name: string;
    distance: number;
    branchType?: string;
    coordinates: { lat: number; lng: number };
  }>;
  plazas: Array<{
    name: string;
    distance: number;
    coordinates: { lat: number; lng: number };
  }>;
  shoppingMalls: Array<{
    name: string;
    distance: number;
    coordinates: { lat: number; lng: number };
  }>;
  gyms: Array<{
    name: string;
    distance: number;
    facilityType: string;
    coordinates: { lat: number; lng: number };
  }>;
  hospitals: Array<{
    name: string;
    distance: number;
    type: string;
    coordinates: { lat: number; lng: number };
  }>;
  schools: Array<{
    name: string;
    distance: number;
    level: string;
    coordinates: { lat: number; lng: number };
  }>;
  restaurants: Array<{
    name: string;
    distance: number;
    cuisine?: string;
    coordinates: { lat: number; lng: number };
  }>;
  parks: Array<{
    name: string;
    distance: number;
    type: string;
    coordinates: { lat: number; lng: number };
  }>;
  condoAmenities: Array<{
    name: string;
    type: 'gym' | 'pool' | 'parking' | 'concierge' | 'rooftop' | 'storage';
    description: string;
  }>;
}

export interface TransportInfo {
  name: string;
  distance: number;
  type: 'metro' | 'bus' | 'train' | 'tram';
  routes?: string[];
}

export interface BankingInfo {
  name: string;
  distance: number;
  branchType: 'main' | 'branch' | 'atm';
}

export interface ShoppingInfo {
  name: string;
  distance: number;
  type: 'mall' | 'plaza' | 'shopping_center';
  stores?: string[];
}

export interface GymInfo {
  name: string;
  distance: number;
  facilityType: 'full-service' | 'basic' | 'studio';
  features: string[];
}

export interface CondoAmenityInfo {
  name: string;
  type: 'gym' | 'pool' | 'parking' | 'concierge' | 'rooftop' | 'storage' | 'party_room';
  description: string;
  availability: 'available' | 'limited' | 'member_only';
}

// Detailed detection result interface
export interface PropertyIntelligence {
  propertyType: string;
  address: string;
  coordinates: { lat: number; lng: number };
  detectedAmenities: DetailedAmenitiesInfo;
  nearbyTransport: {
    metro: TransportInfo[];
    buses: TransportInfo[];
    otherTransit: TransportInfo[];
  };
  financialServices: BankingInfo[];
  shoppingOptions: ShoppingInfo[];
  fitnessAndRecreation: GymInfo[];
  condoBuildingAmenities: CondoAmenityInfo[];
  confidenceScore: number; // 0-100
  detectionTimestamp: string;
}
