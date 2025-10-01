// Enhanced types for detailed amenities detection with names and distances
export interface DetailedAmenitiesInfo {
  metro: Array<{
    name: string;
    distance: number; // in meters
    line: string;
  }>;
  buses: Array<{
    name: string;
    distance: number;
    routeNumber: string;
  }>;
  banks: Array<{
    name: string;
    distance: number;
    branchType?: string;
  }>;
  plazas: Array<{
    name: string;
    distance: number;
  }>;
  shoppingMalls: Array<{
    name: string;
    distance: number;
  }>;
  gyms: Array<{
    name: string;
    distance: number;
    facilityType: string;
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
