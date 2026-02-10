
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface Property {
  id: string;
  user_id: string;

  // Basic Information (matching database schema)
  listing_title: string;
  property_type: string;
  description: string;
  description_audio_url?: string;
  three_d_model_url?: string;
  listing_category?: string; // 'rental' or 'sale'

  // Video / Audio Settings
  video_script?: string;
  background_music_url?: string;
  video_enabled?: boolean;
  audio_enabled?: boolean;

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
  lease_terms?: string; // Changed from lease_duration to lease_terms
  available_date?: string; // This matches the frontend expectation
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
  status?: string;
  views_count?: number;
}

export interface SalesListing extends Omit<Property, 'monthly_rent' | 'security_deposit' | 'lease_terms'> {
  sales_price: number;
  downpayment_target?: number;
  is_co_ownership?: boolean;
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
    throw error;
  }
}

export async function getSalesListingsByOwnerId(userId: string): Promise<SalesListing[]> {
  console.log("Fetching sales listings for owner:", userId);

  try {
    const { data, error } = await sb
      .from('sales_listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching sales listings by owner:", error);
      if (error.code === '42P01') {
        console.log("Sales listings table doesn't exist yet, returning empty array");
        return [];
      }
      throw new Error(`Failed to fetch sales listings: ${error.message}`);
    }

    console.log("Sales listings fetched successfully:", data);
    return (data as any as SalesListing[]) || [];
  } catch (error) {
    console.error("Error in getSalesListingsByOwnerId:", error);
    throw error;
  }
}

/**
 * Claims properties that belong to a different user ID (e.g. after account re-creation)
 */
export async function claimProperties(newUserId: string, oldUserId: string): Promise<boolean> {
  console.log(`🚀 Claiming properties: ${oldUserId} -> ${newUserId}`);

  try {
    // Try using the RPC function first (Security Definer)
    const { data, error: rpcError } = await sb.rpc('claim_orphaned_properties', {
      old_owner_id: oldUserId
    });

    if (!rpcError) {
      console.log('✅ Successfully claimed properties via RPC:', data);
      return true;
    }

    console.warn("RPC claim failed (function might not exist), falling back to direct update:", rpcError);

    // Fallback: Direct Update (works if RLS allows it)
    // 1. Update Rental Properties
    const { error: propError } = await sb
      .from('properties')
      .update({ user_id: newUserId })
      .eq('user_id', oldUserId);

    if (propError) {
      console.error("Error claiming rental properties:", propError);
      throw propError;
    }

    // 2. Update Sales Listings
    const { error: salesError } = await sb
      .from('sales_listings')
      .update({ user_id: newUserId })
      .eq('user_id', oldUserId);

    if (salesError && salesError.code !== '42P01') {
      console.error("Error claiming sales listings:", salesError);
      throw salesError;
    }

    return true;
  } catch (error) {
    console.error("Failed to claim properties:", error);
    return false;
  }
}

export async function uploadPropertyImage(file: File, userId: string): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/property-${Date.now()}/${fileName}`;

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

  // First, get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("❌ Authentication error:", authError);
    throw new Error(`Authentication failed: ${authError.message}`);
  }

  if (!user) {
    console.error("❌ No authenticated user found");
    throw new Error("You must be logged in to create a property");
  }

  console.log("✅ Authenticated user found:", user.id);

  // Map frontend field names to database field names
  const payload: any = {
    user_id: user.id, // Ensure user_id is always set
    listing_title: propertyData.listingTitle || propertyData.listing_title,
    property_type: propertyData.propertyType || propertyData.property_type,
    listing_category: propertyData.listingCategory || propertyData.listing_category || 'rental',

    description: propertyData.description,
    description_audio_url: propertyData.descriptionAudioUrl || propertyData.description_audio_url,
    video_script: propertyData.videoScript || propertyData.video_script,
    background_music_url: propertyData.backgroundMusicUrl || propertyData.background_music_url,
    video_enabled: propertyData.videoEnabled !== undefined ? propertyData.videoEnabled : true,
    audio_enabled: propertyData.audioEnabled !== undefined ? propertyData.audioEnabled : true,
    address: propertyData.address || propertyData.propertyAddress,
    city: propertyData.city,
    state: propertyData.state,
    zip_code: propertyData.zipCode || propertyData.zip_code,
    neighborhood: propertyData.neighborhood,
    latitude: propertyData.latitude,
    longitude: propertyData.longitude,
    public_transport_access: propertyData.publicTransportAccess || propertyData.public_transport_access,
    nearby_amenities: propertyData.nearbyAmenities || propertyData.nearby_amenities,
    monthly_rent: parseFloat(propertyData.monthlyRent || propertyData.monthly_rent || '0'),
    security_deposit: parseFloat(propertyData.securityDeposit || propertyData.security_deposit || '0'),
    lease_terms: propertyData.leaseTerms || propertyData.lease_terms,
    available_date: propertyData.availableDate || propertyData.available_date,
    furnished: propertyData.furnished,
    bedrooms: parseInt(propertyData.bedrooms || '0'),
    bathrooms: parseFloat(propertyData.bathrooms || '0'),
    square_footage: parseInt(propertyData.squareFootage || propertyData.square_footage || '0'),
    amenities: propertyData.amenities || [],
    parking: propertyData.parking,
    pet_policy: propertyData.petPolicy || propertyData.pet_policy,
    utilities_included: propertyData.utilitiesIncluded || propertyData.utilities_included || [],
    special_instructions: propertyData.specialInstructions || propertyData.special_instructions,
    roommate_preference: propertyData.roommatePreference || propertyData.roommate_preference,
    images: propertyData.images || []
  };

  // Convert furnished string to boolean for database
  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

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

export async function createSalesListing(salesData: any): Promise<SalesListing | null> {
  console.log("🏠 Creating sales listing:", salesData);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to create a sales listing");
  }

  const payload: any = {
    user_id: user.id,
    listing_title: salesData.listingTitle || salesData.listing_title,
    property_type: salesData.propertyType || salesData.property_type,
    description: salesData.description,
    description_audio_url: salesData.descriptionAudioUrl || salesData.description_audio_url,
    video_script: salesData.videoScript || salesData.video_script,
    background_music_url: salesData.backgroundMusicUrl || salesData.background_music_url,
    video_enabled: salesData.videoEnabled !== undefined ? salesData.videoEnabled : true,
    audio_enabled: salesData.audioEnabled !== undefined ? salesData.audioEnabled : true,
    address: salesData.address || salesData.propertyAddress,
    city: salesData.city,
    state: salesData.state,
    zip_code: salesData.zipCode || salesData.zip_code,
    neighborhood: salesData.neighborhood,
    latitude: salesData.latitude,
    longitude: salesData.longitude,
    public_transport_access: salesData.publicTransportAccess || salesData.public_transport_access,
    nearby_amenities: salesData.nearbyAmenities || salesData.nearby_amenities,
    sales_price: parseFloat(salesData.salesPrice || salesData.sales_price || '0'),
    downpayment_target: parseFloat(salesData.downpaymentTarget || salesData.downpayment_target || '0'),
    is_co_ownership: salesData.isCoOwnership || salesData.is_co_ownership || false,
    available_date: salesData.availableDate || salesData.available_date,
    furnished: salesData.furnished,
    bedrooms: parseInt(salesData.bedrooms || '0'),
    bathrooms: parseFloat(salesData.bathrooms || '0'),
    square_footage: parseInt(salesData.squareFootage || salesData.square_footage || '0'),
    amenities: salesData.amenities || [],
    parking: salesData.parking,
    pet_policy: salesData.petPolicy || salesData.pet_policy,
    utilities_included: salesData.utilitiesIncluded || salesData.utilities_included || [],
    special_instructions: salesData.specialInstructions || salesData.special_instructions,
    roommate_preference: salesData.roommatePreference || salesData.roommate_preference,
    images: salesData.images || []
  };

  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

  try {
    const { data, error } = await sb
      .from('sales_listings')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sales listing: ${error.message}`);
    }

    return data as any as SalesListing;
  } catch (error) {
    console.error("❌ Error in createSalesListing:", error);
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

export async function fetchSalesListingById(id: string) {
  try {
    const { data, error } = await sb
      .from('sales_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch sales listing: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchSalesListingById:", error);
    throw error;
  }
}

export async function updateProperty(id: string, updates: any) {
  console.log("Updating property:", id, updates);

  // Map frontend field names to database field names
  const payload: any = {};

  // Map all possible field names from frontend to database
  if (updates.listingTitle || updates.listing_title) payload.listing_title = updates.listingTitle || updates.listing_title;
  if (updates.propertyType || updates.property_type) payload.property_type = updates.propertyType || updates.property_type;
  if (updates.listingCategory || updates.listing_category) payload.listing_category = updates.listingCategory || updates.listing_category;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.descriptionAudioUrl || updates.description_audio_url) payload.description_audio_url = updates.descriptionAudioUrl || updates.description_audio_url;

  // Video/Audio updates
  if (updates.videoScript || updates.video_script) payload.video_script = updates.videoScript || updates.video_script;
  if (updates.backgroundMusicUrl || updates.background_music_url) payload.background_music_url = updates.backgroundMusicUrl || updates.background_music_url;
  if (updates.videoEnabled !== undefined) payload.video_enabled = updates.videoEnabled;
  if (updates.audioEnabled !== undefined) payload.audio_enabled = updates.audioEnabled;

  if (updates.address || updates.propertyAddress) payload.address = updates.address || updates.propertyAddress;
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.state !== undefined) payload.state = updates.state;
  if (updates.zipCode || updates.zip_code) payload.zip_code = updates.zipCode || updates.zip_code;
  if (updates.neighborhood !== undefined) payload.neighborhood = updates.neighborhood;
  if (updates.latitude !== undefined) payload.latitude = updates.latitude;
  if (updates.longitude !== undefined) payload.longitude = updates.longitude;
  if (updates.publicTransportAccess || updates.public_transport_access) {
    payload.public_transport_access = updates.publicTransportAccess || updates.public_transport_access;
  }
  if (updates.nearbyAmenities || updates.nearby_amenities) {
    payload.nearby_amenities = updates.nearbyAmenities || updates.nearby_amenities;
  }
  if (updates.monthlyRent || updates.monthly_rent) {
    payload.monthly_rent = parseFloat(updates.monthlyRent || updates.monthly_rent || '0');
  }
  if (updates.securityDeposit || updates.security_deposit) {
    payload.security_deposit = parseFloat(updates.securityDeposit || updates.security_deposit || '0');
  }
  if (updates.leaseTerms || updates.lease_terms) {
    payload.lease_terms = updates.leaseTerms || updates.lease_terms;
  }
  if (updates.availableDate || updates.available_date) {
    payload.available_date = updates.availableDate || updates.available_date;
  }
  if (updates.furnished !== undefined) payload.furnished = updates.furnished;
  if (updates.bedrooms !== undefined) payload.bedrooms = parseInt(updates.bedrooms?.toString() || '0');
  if (updates.bathrooms !== undefined) payload.bathrooms = parseFloat(updates.bathrooms?.toString() || '0');
  if (updates.squareFootage || updates.square_footage) {
    payload.square_footage = parseInt(updates.squareFootage?.toString() || updates.square_footage?.toString() || '0');
  }
  if (updates.amenities !== undefined) payload.amenities = updates.amenities;
  if (updates.parking !== undefined) payload.parking = updates.parking;
  if (updates.petPolicy || updates.pet_policy) payload.pet_policy = updates.petPolicy || updates.pet_policy;
  if (updates.utilitiesIncluded || updates.utilities_included) {
    payload.utilities_included = updates.utilitiesIncluded || updates.utilities_included;
  }
  if (updates.specialInstructions || updates.special_instructions) {
    payload.special_instructions = updates.specialInstructions || updates.special_instructions;
  }
  if (updates.roommatePreference || updates.roommate_preference) {
    payload.roommate_preference = updates.roommatePreference || updates.roommate_preference;
  }
  if (updates.images !== undefined) payload.images = updates.images;

  // Fix furnished field - convert string to boolean
  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

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

export async function updateSalesListing(id: string, updates: any) {
  const payload: any = {};

  if (updates.listingTitle || updates.listing_title) payload.listing_title = updates.listingTitle || updates.listing_title;
  if (updates.propertyType || updates.property_type) payload.property_type = updates.propertyType || updates.property_type;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.descriptionAudioUrl || updates.description_audio_url) payload.description_audio_url = updates.descriptionAudioUrl || updates.description_audio_url;
  if (updates.videoScript || updates.video_script) payload.video_script = updates.videoScript || updates.video_script;
  if (updates.backgroundMusicUrl || updates.background_music_url) payload.background_music_url = updates.backgroundMusicUrl || updates.background_music_url;
  if (updates.videoEnabled !== undefined) payload.video_enabled = updates.videoEnabled;
  if (updates.audioEnabled !== undefined) payload.audio_enabled = updates.audioEnabled;
  if (updates.address || updates.propertyAddress) payload.address = updates.address || updates.propertyAddress;
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.state !== undefined) payload.state = updates.state;
  if (updates.zipCode || updates.zip_code) payload.zip_code = updates.zipCode || updates.zip_code;
  if (updates.neighborhood !== undefined) payload.neighborhood = updates.neighborhood;
  if (updates.latitude !== undefined) payload.latitude = updates.latitude;
  if (updates.longitude !== undefined) payload.longitude = updates.longitude;
  if (updates.publicTransportAccess || updates.public_transport_access) payload.public_transport_access = updates.publicTransportAccess || updates.public_transport_access;
  if (updates.nearbyAmenities || updates.nearby_amenities) payload.nearby_amenities = updates.nearbyAmenities || updates.nearby_amenities;

  if (updates.salesPrice || updates.sales_price) {
    payload.sales_price = parseFloat(updates.salesPrice || updates.sales_price || '0');
  }
  if (updates.downpaymentTarget || updates.downpayment_target) {
    payload.downpayment_target = parseFloat(updates.downpaymentTarget || updates.downpayment_target || '0');
  }
  if (updates.isCoOwnership !== undefined || updates.is_co_ownership !== undefined) {
    payload.is_co_ownership = updates.isCoOwnership !== undefined ? updates.isCoOwnership : updates.is_co_ownership;
  }

  if (updates.availableDate || updates.available_date) payload.available_date = updates.availableDate || updates.available_date;
  if (updates.furnished !== undefined) payload.furnished = updates.furnished;
  if (updates.bedrooms !== undefined) payload.bedrooms = parseInt(updates.bedrooms?.toString() || '0');
  if (updates.bathrooms !== undefined) payload.bathrooms = parseFloat(updates.bathrooms?.toString() || '0');
  if (updates.squareFootage || updates.square_footage) payload.square_footage = parseInt(updates.squareFootage?.toString() || updates.square_footage?.toString() || '0');
  if (updates.amenities !== undefined) payload.amenities = updates.amenities;
  if (updates.parking !== undefined) payload.parking = updates.parking;
  if (updates.petPolicy || updates.pet_policy) payload.pet_policy = updates.petPolicy || updates.pet_policy;
  if (updates.utilitiesIncluded || updates.utilities_included) payload.utilities_included = updates.utilitiesIncluded || updates.utilities_included;
  if (updates.specialInstructions || updates.special_instructions) payload.special_instructions = updates.specialInstructions || updates.special_instructions;
  if (updates.roommatePreference || updates.roommate_preference) payload.roommate_preference = updates.roommatePreference || updates.roommate_preference;
  if (updates.images !== undefined) payload.images = updates.images;

  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

  try {
    const { data, error } = await sb
      .from('sales_listings')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update sales listing: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateSalesListing:", error);
    throw error;
  }
}

export async function deleteProperty(id: string) {
  console.log("Deleting property:", id);

  try {
    // First, check if there are any rental applications for this property
    const { data: applications, error: checkError } = await supabase
      .from('rental_applications' as any)
      .select('id, full_name, status')
      .eq('property_id', id);

    if (checkError) {
      console.error("Error checking rental applications:", checkError);
      throw new Error(`Failed to check rental applications: ${checkError.message}`);
    }

    if (applications && applications.length > 0) {
      console.log(`Found ${applications.length} rental applications for this property:`, applications);

      // Delete all rental applications first
      const { error: deleteAppsError } = await supabase
        .from('rental_applications' as any)
        .delete()
        .eq('property_id', id);

      if (deleteAppsError) {
        console.error("Error deleting rental applications:", deleteAppsError);
        throw new Error(`Failed to delete rental applications: ${deleteAppsError.message}`);
      }

      console.log(`Successfully deleted ${applications.length} rental applications`);
    }

    // Now delete the property
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

export async function deleteSalesListing(id: string) {
  try {
    const { error } = await sb
      .from('sales_listings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete sales listing: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteSalesListing:", error);
    throw error;
  }
}

export async function fetchAllSalesListings(): Promise<SalesListing[]> {
  try {
    const { data, error } = await sb
      .from('sales_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all sales listings:", error);
      if (error.code === '42P01') return [];
      throw new Error(`Failed to fetch sales listings: ${error.message}`);
    }

    return (data as any as SalesListing[]) || [];
  } catch (error) {
    console.error("Error in fetchAllSalesListings:", error);
    return [];
  }
}

export interface InvestorOffer {
  id: string;
  listing_id: string;
  user_id: string;
  contribution_amount: number;
  intended_use: string;
  flexibility: string;
  occupancy_plan: string;
  additional_notes?: string;
  created_at: string;
  user_email?: string;
}

export async function fetchInvestorOffers(listingId: string): Promise<InvestorOffer[]> {
  try {
    const { data: offers, error } = await sb
      .from('investor_offers')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return []; // Table doesn't exist
      throw error;
    }

    if (!offers || offers.length === 0) return [];

    // Manually fetch profile emails to avoid missing foreign key relationship error
    const userIds = Array.from(new Set(offers.map(o => o.user_id)));
    const { data: profiles } = await sb
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    return (offers as any[]).map(item => ({
      ...item,
      user_email: profiles?.find(p => p.id === item.user_id)?.email
    }));
  } catch (error) {
    console.error("Error fetching investor offers:", error);
    return [];
  }
}

export async function submitInvestorOffer(
  listingId: string,
  data: {
    contribution_amount: number;
    intended_use: string;
    flexibility: string;
    occupancy_plan: string;
    additional_notes?: string;
  }
): Promise<InvestorOffer | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const payload = {
    listing_id: listingId,
    user_id: user.id,
    ...data
  };

  try {
    const { data: result, error } = await sb
      .from('investor_offers')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return result as InvestorOffer;
  } catch (error) {
    console.error("Error submitting investor offer:", error);
    throw error;
  }
}

export async function deleteInvestorOffer(offerId: string): Promise<void> {
  try {
    const { error } = await sb
      .from('investor_offers')
      .delete()
      .eq('id', offerId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting investor offer:", error);
    throw error;
  }
}

export async function updateInvestorOffer(
  offerId: string,
  data: Partial<{
    contribution_amount: number;
    intended_use: string;
    flexibility: string;
    occupancy_plan: string;
    additional_notes: string;
  }>
): Promise<void> {
  try {
    const { error } = await sb
      .from('investor_offers')
      .update(data)
      .eq('id', offerId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating investor offer:", error);
    throw error;
  }
}

export interface CoOwnershipSignal {
  id: string;
  user_id: string;
  capital_available: string;
  household_type: 'Single' | 'Couple' | 'Family' | 'Investor group';
  intended_use: 'Live-in' | 'Investment' | 'Mixed';
  time_horizon: '1–2 years' | '3–5 years' | 'Flexible';
  notes?: string;
  created_at: string;
  creator_name?: string;
}

export const fetchCoOwnershipSignals = async (): Promise<CoOwnershipSignal[]> => {
  try {
    const { data, error } = await sb
      .from('co_ownership_signals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching signals:', error);
      // Return empty array if table doesn't exist
      if (error.code === '42P01') {
        console.log('co_ownership_signals table does not exist yet');
        return [];
      }
      return [];
    }

    const signals = data as CoOwnershipSignal[];
    if (signals.length === 0) return signals;

    // Add creator names from the signals themselves (no need to fetch profiles)
    const signalsWithNames = signals.map(signal => ({
      ...signal,
      creator_name: signal.user_id ? 'Signal User' : 'Anonymous'
    }));

    return signalsWithNames;
  } catch (error) {
    console.error('Error in fetchCoOwnershipSignals:', error);
    return [];
  }
};

export const createCoOwnershipSignal = async (signal: Omit<CoOwnershipSignal, 'id' | 'created_at' | 'user_id'>) => {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await sb
    .from('co_ownership_signals')
    .insert([{ ...signal, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error creating signal:', error);
    throw error;
  }
  return data;
};

export const updateCoOwnershipSignal = async (id: string, updates: Partial<CoOwnershipSignal>) => {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await sb
    .from('co_ownership_signals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating signal:', error);
    throw error;
  }
  return data;
};
