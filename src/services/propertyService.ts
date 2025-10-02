
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
  lease_duration?: string;
  available_date?: string;
  furnished?: boolean;
  
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

export type CreatePropertyInput = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'furnished'> & { furnished?: string | boolean };
export type UpdatePropertyInput = Partial<Omit<Property, 'furnished'>> & { furnished?: string | boolean };

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

export async function uploadPropertyImage(file: File, userId: string): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    console.log('Image uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPropertyImage:', error);
    throw error;
  }
}

export async function deletePropertyImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'property-images');
    
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL');
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error in deletePropertyImage:', error);
    throw error;
  }
}

export async function createProperty(propertyData: any): Promise<Property | null> {
  console.log("🏠 Creating property:", propertyData);

  // Convert furnished string to boolean for database
  const payload: any = {
    ...propertyData,
  };

  // Fix furnished field - convert string to boolean
  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

  // Backward compatibility: current DB uses lease_terms; app uses lease_duration.
  // Until migrations are applied, send lease_terms and drop lease_duration.
  if (payload.lease_duration && !payload.lease_terms) {
    payload.lease_terms = payload.lease_duration;
  }
  delete payload.lease_duration;
  
  console.log("📦 Final payload for database:", payload);
  
  try {
    console.log("🚀 Inserting into properties table...");
    const { data, error } = await sb
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error creating property:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to create property: ${error.message}`);
    }

    console.log("✅ Property created successfully:", data);
    return data as any as Property;
  } catch (error) {
    console.error("❌ Error in createProperty:", error);
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

export async function updateProperty(id: string, updates: (Partial<Property> & { furnished?: boolean | string })) {
  console.log("Updating property:", id, updates);

  // Convert furnished string to boolean for database
  const payload: any = {
    ...updates,
  };

  // Fix furnished field - convert string to boolean
  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

  // Backward compatibility: current DB uses lease_terms; app uses lease_duration.
  if (payload.lease_duration && !payload.lease_terms) {
    payload.lease_terms = payload.lease_duration;
  }
  delete payload.lease_duration;
  
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
