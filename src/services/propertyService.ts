// Property service temporarily disabled - the 'properties' table doesn't exist in current schema
// This service can be re-enabled when the properties table is created in the database

export interface Property {
  id: string;
  property_type: string;
  listing_title: string;
  description: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  monthly_rent: number;
  security_deposit: number;
  available_date: string;
  lease_duration: string;
  user_id: string;
  images?: string[];
  public_transport_access?: string;
}

// Alias for backward compatibility
export const fetchProperties = getProperties;

export async function getProperties(): Promise<Property[]> {
  console.log('Property service is currently disabled - properties table not available');
  return [];
}

export async function getPropertiesByOwnerId(userId: string): Promise<Property[]> {
  console.log('Property service is currently disabled - properties table not available');
  return [];
}

export async function getPropertyById(propertyId: string): Promise<Property | null> {
  console.log('Property service is currently disabled - properties table not available');
  return null;
}

export async function createProperty(propertyData: Omit<Property, 'id'>): Promise<Property> {
  console.log('Property service is currently disabled - properties table not available');
  throw new Error('Property service is currently disabled');
}

export async function updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
  console.log('Property service is currently disabled - properties table not available');
  throw new Error('Property service is currently disabled');
}

export async function deleteProperty(propertyId: string): Promise<void> {
  console.log('Property service is currently disabled - properties table not available');
  throw new Error('Property service is currently disabled');
}

export async function searchProperties(filters: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
}): Promise<Property[]> {
  console.log('Property service is currently disabled - properties table not available');
  return [];
}