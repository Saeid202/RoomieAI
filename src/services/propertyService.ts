
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface Property {
  id: string;
  user_id: string;

  // Basic Information (matching database schema)
  listing_title: string;
  property_type: string; // Legacy field - kept for backward compatibility

  // NEW: Property Categorization (Parent-Child Hierarchy)
  property_category?: 'Condo' | 'House' | 'Townhouse';
  property_configuration?: string; // Dynamic based on category
  listing_strength_score?: number; // 0-100 based on documents

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

  // UI enrichment (not in DB schema directly)
  landlord_name?: string;
  listing_agent?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  status?: string;
  views_count?: number;
  archived_at?: string;
  archive_reason?: string;
  neighborhood?: string;
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
  console.log("🔍 [getPropertiesByOwnerId] Starting fetch for user:", userId);

  try {
    if (!userId) {
      console.error("❌ [getPropertiesByOwnerId] No userId provided");
      return [];
    }

    console.log("🔍 [getPropertiesByOwnerId] Querying properties table...");
    
    // Fetch ALL properties for this user (no status filter)
    const { data, error } = await sb
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ [getPropertiesByOwnerId] Database error:", error);
      console.error("❌ [getPropertiesByOwnerId] Error code:", error.code);
      console.error("❌ [getPropertiesByOwnerId] Error message:", error.message);
      console.error("❌ [getPropertiesByOwnerId] Full error object:", JSON.stringify(error));
      
      if (error.code === '42P01') {
        console.log("⚠️ [getPropertiesByOwnerId] Properties table doesn't exist yet");
        return [];
      }
      
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    console.log("✅ [getPropertiesByOwnerId] Query successful, received:", data?.length || 0, "items");
    
    if (data && data.length > 0) {
      console.log("📋 [getPropertiesByOwnerId] First property details:", {
        id: data[0].id,
        title: data[0].listing_title,
        user_id: data[0].user_id,
        status: data[0].status,
        created_at: data[0].created_at,
        monthly_rent: data[0].monthly_rent
      });
      console.log("📋 [getPropertiesByOwnerId] All properties:", JSON.stringify(data.map((p: any) => ({
        id: p.id,
        title: p.listing_title,
        status: p.status,
        user_id: p.user_id
      })), null, 2));
    } else {
      console.log("⚠️ [getPropertiesByOwnerId] No properties found for user:", userId);
    }
    
    const allProperties = (data as any as Property[]) || [];
    console.log("✅ [getPropertiesByOwnerId] Returning", allProperties.length, "properties");
    
    return allProperties;
  } catch (error) {
    console.error("❌ [getPropertiesByOwnerId] Exception caught:", error);
    throw error;
  }
}

export async function getSalesListingsByOwnerId(userId: string): Promise<SalesListing[]> {
  console.log("Fetching sales listings for owner:", userId);

  try {
    // Query unified properties table with listing_category = 'sale'
    const { data, error } = await sb
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .eq('listing_category', 'sale')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching sales listings by owner:", error);
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
  console.log("📋 User email:", user.email);

  // Verify user_id matches
  if (propertyData.user_id !== user.id) {
    console.warn("⚠️ WARNING: propertyData.user_id doesn't match authenticated user.id");
    console.warn("   propertyData.user_id:", propertyData.user_id);
    console.warn("   user.id:", user.id);
    // Force correct user_id
    propertyData.user_id = user.id;
  }

  // Map frontend field names to database field names
  const payload: any = {
    owner_id: user.id, // Use owner_id to match database schema
    status: 'active', // Set default status to 'active' so property shows in listings
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
    property_category: propertyData.propertyCategory || propertyData.property_category,
    property_configuration: propertyData.propertyConfiguration || propertyData.property_configuration,
    sales_price: propertyData.salesPrice ? parseFloat(String(propertyData.salesPrice).replace(/[^0-9.]/g, '')) : (propertyData.sales_price ? parseFloat(String(propertyData.sales_price).replace(/[^0-9.]/g, '')) : null),
    downpayment_target: propertyData.downpaymentTarget ? parseFloat(String(propertyData.downpaymentTarget).replace(/[^0-9.]/g, '')) : (propertyData.downpayment_target ? parseFloat(String(propertyData.downpayment_target).replace(/[^0-9.]/g, '')) : null),
    is_co_ownership: propertyData.isCoOwnership || propertyData.is_co_ownership || false,
    images: propertyData.images || []
  };

  // Convert furnished string to boolean for database
  if (payload.furnished !== null && payload.furnished !== undefined) {
    if (typeof payload.furnished === 'string') {
      payload.furnished = payload.furnished === 'furnished' || payload.furnished === 'true';
    }
  }

  console.log("Final payload for database:", payload);
  console.log("Payload owner_id:", payload.owner_id);
  console.log("Authenticated user_id:", user.id);

  try {
    console.log("Inserting into properties table...");
    console.log("Payload owner_id before insert:", payload.owner_id);
    console.log("Authenticated user_id before insert:", user.id);
    
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
      console.error("❌ Full error object:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to create property: ${error.message}`);
    }

    if (!data) {
      console.error("❌ No data returned from insert");
      throw new Error("Failed to create property: No data returned");
    }

    console.log(" Property created successfully:", data);
    console.log(" Created property ID:", data.id);
    console.log("Created property owner_id:", data.owner_id);
    console.log("Authenticated user_id:", user.id);
    console.log("owner_id match:", data.owner_id === user.id);
    
    // After successful property creation, check for Plan Ahead matches
    // Run in background — do not await so it doesn't slow down listing creation
    checkPlanAheadMatches(data).catch(
      err => console.error('Plan ahead check failed:', err)
    );
    
    // Verify the property was actually created by fetching it back
    console.log("🔍 Verifying property was created...");
    const { data: verifyData, error: verifyError } = await sb
      .from('properties')
      .select('id, user_id, listing_title')
      .eq('id', data.id)
      .single();
    
    if (verifyError) {
      console.error("❌ Failed to verify property creation:", verifyError);
    } else if (verifyData) {
      console.log("✅ Property verified in database:", verifyData);
    } else {
      console.error("❌ Property not found after creation!");
    }
    
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
    status: 'active', // Set default status to 'active' so listing shows
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
  console.log("🔍 [fetchProperties] Starting with filters:", filters);

  try {
    // SIMPLIFIED: Just fetch ALL properties first to debug
    console.log("🔍 [fetchProperties] Fetching ALL properties from database...");
    const { data: allData, error: allError } = await sb
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error("❌ [fetchProperties] Error fetching all properties:", allError);
      return [];
    }

    console.log("✅ [fetchProperties] Total properties in database:", allData?.length || 0);
    if (allData && allData.length > 0) {
      console.log("📋 [fetchProperties] Sample properties:", allData.slice(0, 3).map((p: any) => ({
        id: p.id,
        title: p.listing_title,
        status: p.status,
        listing_category: p.listing_category,
        monthly_rent: p.monthly_rent
      })));
    }

    // Now apply filters
    let query = sb.from('properties').select('*');

    // Filter for rental properties only
    console.log("🔍 [fetchProperties] Filtering for rental properties...");
    query = query.neq('listing_category', 'sale');

    if (filters) {
      if (filters.location) {
        console.log("🔍 [fetchProperties] Adding location filter:", filters.location);
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
      }
      if (filters.minPrice) {
        console.log("🔍 [fetchProperties] Adding minPrice filter:", filters.minPrice);
        query = query.gte('monthly_rent', filters.minPrice);
      }
      if (filters.maxPrice) {
        console.log("🔍 [fetchProperties] Adding maxPrice filter:", filters.maxPrice);
        query = query.lte('monthly_rent', filters.maxPrice);
      }
      if (filters.bedrooms) {
        console.log("🔍 [fetchProperties] Adding bedrooms filter:", filters.bedrooms);
        query = query.eq('bedrooms', filters.bedrooms);
      }
      if (filters.property_type) {
        console.log("🔍 [fetchProperties] Adding property_type filter:", filters.property_type);
        query = query.eq('property_type', filters.property_type);
      }
    }

    console.log("🔍 [fetchProperties] Executing filtered query...");
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("❌ [fetchProperties] Database error:", error);
      return [];
    }

    console.log("✅ [fetchProperties] Query successful, received:", data?.length || 0, "properties");
    
    const properties = (data as any as Property[]) || [];

    const propertyIds = properties.map((p: any) => p.id).filter(Boolean) as string[];
    const userIds = Array.from(
      new Set(properties.map((p: any) => p.user_id).filter(Boolean))
    ) as string[];

    const nameByUserId = new Map<string, string>();
    const roleByUserId = new Map<string, string>();

    // Fetch owner names
    if (propertyIds.length > 0) {
      const { data: owners } = await sb
        .from('public_property_owners')
        .select('property_id, owner_name, owner_email')
        .in('property_id', propertyIds);

      if (owners) {
        for (const o of owners as any[]) {
          if (o?.property_id && o?.owner_name) {
            const property = properties.find((p: any) => p.id === o.property_id);
            if (property?.user_id) {
              nameByUserId.set(property.user_id, o.owner_name);
            }
          }
        }
      }
    }

    // Fallback: fetch user_profiles
    const missingUserIds = userIds.filter(uid => !nameByUserId.has(uid));
    if (missingUserIds.length > 0) {
      const { data: profiles } = await sb
        .from('user_profiles')
        .select('id, full_name, role')
        .in('id', missingUserIds);

      if (profiles) {
        for (const p of profiles as any[]) {
          if (p?.id) {
            nameByUserId.set(p.id, p.full_name || 'Property Owner');
            roleByUserId.set(p.id, p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : '');
          }
        }
      }
    }

    const enriched = properties.map((p: any) => {
      const landlord_name = nameByUserId.get(p.user_id) || 'Property Owner';
      const listing_agent = roleByUserId.get(p.user_id) || undefined;
      return { ...p, landlord_name, listing_agent };
    });

    console.log("✅ [fetchProperties] Returning", enriched.length, "enriched properties");
    return enriched;
  } catch (error) {
    console.error("❌ [fetchProperties] Exception caught:", error);
    return [];
  }
}

export async function fetchPropertyById(id: string) {
  console.log("Fetching property by ID:", id);

  try {
    // First fetch the property
    const { data: property, error: propertyError } = await sb
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (propertyError) {
      console.error("Error fetching property:", propertyError);
      throw new Error(`Failed to fetch property: ${propertyError.message}`);
    }

    let landlord_name = 'Property Owner';
    let listing_agent: string | undefined;

    // Prefer the non-recursive view to resolve owner name by property_id
    try {
      const { data: owner, error: ownerError } = await sb
        .from('public_property_owners')
        .select('owner_name')
        .eq('property_id', property.id)
        .single();

      if (!ownerError && owner?.owner_name) {
        landlord_name = owner.owner_name;
      } else if (ownerError) {
        console.error('Error fetching owner from public_property_owners:', ownerError);
      }
    } catch (e) {
      console.error('Exception fetching owner from public_property_owners:', e);
    }

    // Fallback to user_profiles if view didn't resolve it, and also fetch role
    if (landlord_name === 'Property Owner' || !listing_agent) {
      try {
        console.log("Fetching profile for user_id:", property.user_id);
        const { data: profile, error: profileError } = await sb
          .from('user_profiles')
          .select('full_name, role')
          .eq('id', property.user_id)
          .single();

        console.log("Profile data:", profile, "Error:", profileError);

        if (!profileError && profile) {
          if (!landlord_name || landlord_name === 'Property Owner') {
            landlord_name = profile.full_name || 'Property Owner';
          }
          // Capitalize role for display (landlord -> Landlord, realtor -> Realtor)
          listing_agent = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : undefined;
          console.log("Found landlord name:", landlord_name, "role:", listing_agent);
        } else {
          console.log("Using fallback landlord name");
        }
      } catch (err) {
        console.error('Exception fetching profile for rental property:', err);
      }
    }

    // Add landlord_name and listing_agent to property data
    const propertyWithOwner = {
      ...property,
      landlord_name,
      listing_agent
    };

    console.log("Property fetched successfully:", propertyWithOwner);
    return propertyWithOwner;
  } catch (error) {
    console.error("Error in fetchPropertyById:", error);
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
  if (updates.propertyCategory || updates.property_category) payload.property_category = updates.propertyCategory || updates.property_category;
  if (updates.propertyConfiguration || updates.property_configuration) payload.property_configuration = updates.propertyConfiguration || updates.property_configuration;
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

  // Sales-specific fields
  if (updates.salesPrice !== undefined || updates.sales_price !== undefined) {
    payload.sales_price = updates.salesPrice || updates.sales_price;
  }
  if (updates.downpaymentTarget !== undefined || updates.downpayment_target !== undefined) {
    payload.downpayment_target = updates.downpaymentTarget || updates.downpayment_target;
  }
  if (updates.isCoOwnership !== undefined || updates.is_co_ownership !== undefined) {
    payload.is_co_ownership = updates.isCoOwnership ?? updates.is_co_ownership;
  }

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
  console.log("🗑️ Deleting property:", id);

  try {
    // Use database function to delete property with all relations
    // This bypasses RLS policies and ensures proper deletion order
    const { data, error } = await supabase.rpc('delete_property_with_relations', {
      property_id_param: id
    });

    if (error) {
      console.error("❌ Error deleting property:", error);
      throw new Error(`Failed to delete property: ${error.message}`);
    }

    console.log("✅ Property deleted successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error in deleteProperty:", error);
    throw error;
  }
}

export async function deleteSalesListing(id: string) {
  console.log("🗑️ Deleting sales listing:", id);

  try {
    // First, check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ Auth error:", authError);
      throw new Error("Authentication error: Please try logging out and back in");
    }

    if (!user) {
      console.error("❌ User not authenticated:", { user, authError });
      throw new Error("User not authenticated: Please log in to delete properties");
    }

    // Check if property exists and belongs to current user
    const { data: listing, error: checkError } = await supabase
      .from('properties')
      .select('id, user_id, listing_title, listing_category')
      .eq('id', id)
      .eq('listing_category', 'sale')
      .single();

    if (checkError) {
      console.error("❌ Error checking sales listing:", checkError);
      throw new Error(`Sales listing not found: ${checkError.message}`);
    }

    if (!listing) {
      throw new Error("Sales listing not found");
    }

    if (listing.user_id !== user?.id) {
      console.error("❌ Permission denied: User", user?.id, "trying to delete sales listing owned by", listing.user_id);
      throw new Error(`You don't have permission to delete this sales listing. Sales listing owner: ${listing.user_id}, Current user: ${user?.id}`);
    }

    console.log("✅ Sales listing verified, belongs to user:", listing.listing_title);

    // Delete the property
    const { error } = await sb
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("❌ Error deleting sales listing:", error);
      throw new Error(`Failed to delete sales listing: ${error.message}`);
    }

    console.log("✅ Sales listing deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error in deleteSalesListing:", error);
    throw error;
  }
}

export async function fetchAllSalesListings(): Promise<SalesListing[]> {
  try {
    const { data, error } = await sb
      .from('properties')
      .select('*')
      .eq('listing_category', 'sale')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all sales listings:", error);
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

/**
 * Archive a property when lease is signed
 * This removes the property from active rental listings
 */
export async function archiveProperty(
  propertyId: string,
  leaseId: string,
  tenantId: string,
  reason: string = 'lease_signed'
): Promise<void> {
  console.log("🗄️ Archiving property:", propertyId);

  try {
    const { error } = await sb
      .from('properties')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archive_reason: reason,
        current_lease_id: leaseId,
        current_tenant_id: tenantId
      })
      .eq('id', propertyId);

    if (error) {
      console.error("❌ Error archiving property:", error);
      throw new Error(`Failed to archive property: ${error.message}`);
    }

    console.log("✅ Property archived successfully");

    // Reject all pending applications for this property
    await rejectPendingApplications(propertyId);
  } catch (error) {
    console.error("❌ Error in archiveProperty:", error);
    throw error;
  }
}

/**
 * Re-list an archived property
 * This makes the property available for rent again
 */
export async function relistProperty(propertyId: string): Promise<void> {
  console.log("📋 Re-listing property:", propertyId);

  try {
    const { error } = await sb
      .from('properties')
      .update({
        status: 'active',
        archived_at: null,
        archive_reason: null,
        current_lease_id: null,
        current_tenant_id: null
      })
      .eq('id', propertyId);

    if (error) {
      console.error("❌ Error re-listing property:", error);
      throw new Error(`Failed to re-list property: ${error.message}`);
    }

    console.log("✅ Property re-listed successfully");
  } catch (error) {
    console.error("❌ Error in relistProperty:", error);
    throw error;
  }
}

/**
 * Get archived properties for a landlord
 */
export async function getArchivedProperties(userId: string): Promise<Property[]> {
  console.log("Fetching archived properties for owner:", userId);

  try {
    const { data, error } = await sb
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'archived')
      .order('archived_at', { ascending: false });

    if (error) {
      console.error("Error fetching archived properties:", error);
      throw new Error(`Failed to fetch archived properties: ${error.message}`);
    }

    console.log("Archived properties fetched successfully:", data);
    return (data as any as Property[]) || [];
  } catch (error) {
    console.error("Error in getArchivedProperties:", error);
    throw error;
  }
}

/**
 * Reject all pending applications for a property
 * Called when property is archived
 */
async function rejectPendingApplications(propertyId: string): Promise<void> {
  console.log("Rejecting pending applications for property:", propertyId);

  try {
    const { error } = await sb
      .from('rental_applications')
      .update({
        status: 'rejected',
        rejection_reason: 'Property is no longer available for rent'
      })
      .eq('property_id', propertyId)
      .in('status', ['pending', 'under_review']);

    if (error) {
      console.error("Error rejecting pending applications:", error);
      // Don't throw - this is a secondary operation
    } else {
      console.log("✅ Pending applications rejected");
    }
  } catch (error) {
    console.error("Error in rejectPendingApplications:", error);
    // Don't throw - this is a secondary operation
  }
}

/**
 * Update property status
 */
export async function updatePropertyStatus(
  propertyId: string,
  status: 'active' | 'archived' | 'draft' | 'inactive'
): Promise<void> {
  console.log("Updating property status:", propertyId, status);

  try {
    const { error } = await sb
      .from('properties')
      .update({ status })
      .eq('id', propertyId);

    if (error) {
      console.error("Error updating property status:", error);
      throw new Error(`Failed to update property status: ${error.message}`);
    }

    console.log("✅ Property status updated successfully");
  } catch (error) {
    console.error("Error in updatePropertyStatus:", error);
    throw error;
  }
}
import { supabase } from "@/integrations/supabase/client";
import { getPlanAheadMatches } from "@/services/planAheadService";
/**
 * Check Plan Ahead profiles for matches with newly listed property
 */
export async function checkPlanAheadMatches(newProperty: any) {
  console.log("🔍 Checking Plan Ahead matches for property:", newProperty.id);

  try {
    // Fetch all plan_ahead_profiles from database
    const { data: plans, error } = await supabase
      .from('plan_ahead_profiles')
      .select('*');

    if (error) {
      console.error("Error fetching plan ahead profiles:", error);
      return;
    }

    if (!plans || plans.length === 0) {
      console.log("No plan ahead profiles found");
      return;
    }

    console.log(`Found ${plans.length} plan ahead profiles to check`);

    // For each plan check if new property matches
    for (const plan of plans) {
      const matches = [];

      // Check location match
      // property city must be in user's target_locations array
      const locationMatch = plan.target_locations?.some(
        (loc: string) =>
          newProperty.city?.toLowerCase().includes(loc.toLowerCase()) ||
          newProperty.address?.toLowerCase().includes(loc.toLowerCase())
      );

      // Check property type match
      const typeMatch = !plan.property_type ||
        newProperty.property_type?.toLowerCase().includes(
          plan.property_type.toLowerCase()
        );

      // Check move date match
      // Property available date must be on or before user's move date
      const dateMatch = !plan.move_date ||
        !newProperty.available_date ||
        new Date(newProperty.available_date) <= new Date(plan.move_date);

      // If all conditions match send notification
      if (locationMatch && typeMatch && dateMatch) {
        console.log(`✅ Match found for user ${plan.user_id}`);
        await sendPlanAheadNotification(
          plan.user_id,
          newProperty
        );
      }
    }
  } catch (error) {
    console.error("Error in checkPlanAheadMatches:", error);
  }
}

/**
 * Send notification to user when a Plan Ahead match is found
 */
async function sendPlanAheadNotification(
  userId: string,
  property: any
) {
  console.log(`📧 Sending Plan Ahead notification to user ${userId}`);

  try {
    // Save to notifications table
    const { error } = await supabase
      .from('payment_notifications')
      .insert({
        user_id: userId,
        notification_type: 'plan_ahead_match',
        title: '🏠 New Property Match Found!',
        message: `A property matching your Plan Ahead preferences was just listed at ${property.address}, ${property.city}. Available: ${property.available_date}. Price: $${property.monthly_rent || property.price}/month.`,
        property_id: property.id,
        property_link: `/dashboard/rent/${property.id}`
      });

    if (error) {
      console.error("Error saving notification:", error);
      throw error;
    }

    console.log("✅ Plan Ahead notification saved successfully");

    // Send email notification
    await sendPlanAheadEmail(userId, property);
  } catch (error) {
    console.error("Error in sendPlanAheadNotification:", error);
  }
}

/**
 * Send email notification for Plan Ahead match
 */
async function sendPlanAheadEmail(
  userId: string,
  property: any
) {
  console.log(`📧 Sending email to user ${userId}`);

  try {
    // Fetch user profile to get email and name
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return;
    }

    const userName = profile.full_name || 'User';
    const userEmail = profile.email;

    // Prepare email content
    const subject = "🏠 New property match found — HomieAI";
    const body = `
Hi ${userName},

Good news! A property matching your Plan Ahead preferences was just listed on HomieAI.

Property: ${property.address}
Price: $${property.monthly_rent || property.price}/month
Available: ${property.available_date}
Type: ${property.property_type}

[View Property Now](https://homieai.ca/dashboard/rent/${property.id})

If you want to update your preferences, visit your Plan Ahead settings.

HomieAI Team
    `.trim();

    // Send email using Supabase email function
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: userEmail,
        subject: subject,
        html: body.replace(/\n/g, '<br>')
      }
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      // Don't throw - email is optional
    } else {
      console.log("✅ Email sent successfully");
    }
  } catch (error) {
    console.error("Error in sendPlanAheadEmail:", error);
  }
}
