
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface Property {
  id: string;
  user_id: string;
  
  // Basic Information
  property_type: string;
  listing_title: string;
  description: string;
  
  // Location Details
  address: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
  public_transport_access?: string;
  nearby_amenities?: string[];
  
  // Rental Information  
  monthly_rent: number;
  security_deposit?: number;
  lease_terms?: string;
  available_date?: string;
  furnished?: boolean | string;
  
  // Property Features
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  year_built?: number;
  property_condition?: string;
  
  // Amenities & Features
  amenities?: string[];
  parking?: string;
  pet_policy?: string;
  utilities_included?: string[];
  
  // Additional Info
  special_instructions?: string;
  roommate_preference?: string;
  images?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export type PropertyType = "Apartment" | "House" | "Condo" | "Townhouse" | "Commercial" | "rent" | "sale";

export const COMMON_AMENITIES = [
  "Air Conditioning", "Heating", "WiFi", "Laundry", "Parking", "Gym", "Pool", "Security"
];

export const COMMON_UTILITIES = [
  "Electricity", "Water", "Gas", "Internet", "Cable TV", "Trash Collection"
];

export const FURNISHED_OPTIONS = [
  "Fully Furnished", "Partially Furnished", "Unfurnished"
];

export const PET_POLICY_OPTIONS = [
  "Pets Allowed", "No Pets", "Cats Only", "Dogs Only", "Small Pets Only"
];

export const PARKING_OPTIONS = [
  "Street Parking", "Garage", "Driveway", "No Parking", "Paid Parking"
];

export async function getPropertiesByOwnerId(userId: string): Promise<Property[]> {
  console.log("Fetching properties for owner:", userId);
  
  try {
    const { data, error } = await sb
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching properties by owner:", error);
      if (error.code === '42P01') {
        console.log("Properties table doesn't exist yet, returning empty array");
        return [];
      }
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    console.log("Properties fetched successfully:", data);
    return (data as any as Property[]) || [];
  } catch (error) {
    console.error("Error in getPropertiesByOwnerId:", error);
    return [];
  }
}

export async function uploadPropertyImage(file: File): Promise<string> {
  // This is a placeholder implementation
  // In a real app, you would upload to Supabase Storage or another service
  console.log("Uploading property image:", file.name);
  
  // Return a placeholder URL for now
  return "/placeholder.svg";
}

export async function createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> {
  console.log("Creating property:", propertyData);
  
  // Normalize fields for DB (e.g., furnished must be boolean in DB)
  const normalizeToBoolean = (val: unknown): boolean | undefined => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const v = val.toLowerCase();
      if (["yes","true","1","fully furnished","partially furnished","furnished"].includes(v)) return true;
      if (["no","false","0","unfurnished"].includes(v)) return false;
    }
    return undefined;
  };

  const payload: any = {
    ...propertyData,
    furnished: normalizeToBoolean((propertyData as any).furnished),
  };
  
  try {
    const { data, error } = await sb
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating property:", error);
      throw new Error(`Failed to create property: ${error.message}`);
    }

    console.log("Property created successfully:", data);
    return data as any as Property;
  } catch (error) {
    console.error("Error in createProperty:", error);
    throw error;
  }
}

export async function fetchProperties(filters?: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  property_type?: string;
}): Promise<Property[]> {
  console.log("Fetching properties with filters:", filters);
  
  try {
    let query = sb.from('properties').select('*');

    if (filters) {
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
      }
      if (filters.minPrice) {
        query = query.gte('monthly_rent', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('monthly_rent', filters.maxPrice);
      }
      if (filters.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching properties:", error);
      // If properties table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.log("Properties table doesn't exist yet, returning empty array");
        return [];
      }
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    console.log("Properties fetched successfully:", data);
    return (data as any as Property[]) || [];
  } catch (error) {
    console.error("Error in fetchProperties:", error);
    // Return empty array if table doesn't exist or other error
    return [];
  }
}

export async function fetchPropertyById(id: string) {
  console.log("Fetching property by ID:", id);
  
  try {
    const { data, error } = await sb
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    console.log("Property fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchPropertyById:", error);
    throw error;
  }
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  console.log("Updating property:", id, updates);
  
  // Normalize fields for DB
  const normalizeToBoolean = (val: unknown): boolean | undefined => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const v = val.toLowerCase();
      if (["yes","true","1","fully furnished","partially furnished","furnished"].includes(v)) return true;
      if (["no","false","0","unfurnished"].includes(v)) return false;
    }
    return undefined;
  };

  const payload: any = {
    ...updates,
    furnished: normalizeToBoolean((updates as any).furnished),
  };
  
  try {
    const { data, error } = await sb
      .from('properties')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating property:", error);
      throw new Error(`Failed to update property: ${error.message}`);
    }

    console.log("Property updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateProperty:", error);
    throw error;
  }
}

export async function deleteProperty(id: string) {
  console.log("Deleting property:", id);
  
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting property:", error);
      throw new Error(`Failed to delete property: ${error.message}`);
    }

    console.log("Property deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProperty:", error);
    throw error;
  }
}
