import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface PublicProperty {
  id: string;
  listing_title: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  monthly_rent?: number;
  sales_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  description: string;
  images: string[];
  available_date?: string;
  amenities: string[];
  furnished?: boolean;
  parking?: string;
  pet_policy?: string;
  utilities_included: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  landlord_name?: string;
  property_owner?: string;
  listing_type: 'rental' | 'sales';
}

export interface PublicPropertyFilters {
  property_type?: string;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  pet_friendly?: boolean;
  search?: string;
  listing_type?: 'rental' | 'sales';
}

/**
 * Fetch public property listings (no authentication required)
 */
export async function fetchPublicProperties(
  filters: PublicPropertyFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ properties: PublicProperty[]; total: number }> {
  try {
    console.log('🚀 Starting fetchPublicProperties with filters:', filters);
    
    // Fetch rental properties
    const { data: rentalProperties, error: rentalError } = await sb
      .from('properties')
      .select(`
        id, listing_title, property_type, address, city, state, zip_code,
        neighborhood, monthly_rent, bedrooms, bathrooms, square_footage,
        description, images, available_date, amenities, furnished,
        parking, pet_policy, utilities_included, created_at, updated_at, user_id
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Fetch sales properties
    const { data: salesProperties, error: salesError } = await sb
      .from('sales_listings')
      .select(`
        id, listing_title, property_type, address, city, state, zip_code,
        neighborhood, sales_price, bedrooms, bathrooms, square_footage,
        description, images, available_date, amenities, furnished,
        parking, pet_policy, utilities_included, created_at, updated_at, user_id
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (rentalError) throw rentalError;
    if (salesError) throw salesError;

    console.log('🔍 Total properties found:', {
      rental: rentalProperties?.length || 0,
      sales: salesProperties?.length || 0
    });

    const allProperties: PublicProperty[] = [];

    // Process rental properties
    for (const property of rentalProperties || []) {
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      
      if (property.user_id) {
        try {
          // Direct query to user_profiles table (bypass view)
          const { data: profile, error } = await sb
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', property.user_id)
            .single();
          
          console.log('🔄 Profile query result:', { profile, error });
          
          if (!error && profile?.full_name) {
            landlord_name = profile.full_name;
            property_owner = profile.full_name;
            console.log('✅ Using profile name:', landlord_name);
          }
        } catch (err) {
          console.error('Exception fetching profile:', err);
        }
      }

      allProperties.push({
        ...property,
        listing_type: 'rental',
        landlord_name,
        property_owner
      });
    }

    // Process sales properties
    for (const property of salesProperties || []) {
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      
      if (property.user_id) {
        try {
          // Direct query to user_profiles table (bypass view)
          const { data: profile, error } = await sb
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', property.user_id)
            .single();
          
          if (!error && profile?.full_name) {
            landlord_name = profile.full_name;
            property_owner = profile.full_name;
          }
        } catch (err) {
          console.error('Exception fetching profile:', err);
        }
      }

      allProperties.push({
        ...property,
        listing_type: 'sales',
        landlord_name,
        property_owner
      });
    }

    // Apply filters
    let filteredProperties = allProperties;
    if (filters.listing_type) {
      filteredProperties = filteredProperties.filter(p => p.listing_type === filters.listing_type);
    }
    if (filters.property_type) {
      filteredProperties = filteredProperties.filter(p => 
        p.property_type.toLowerCase().includes(filters.property_type!.toLowerCase())
      );
    }
    if (filters.city) {
      filteredProperties = filteredProperties.filter(p => 
        p.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters.min_price) {
      filteredProperties = filteredProperties.filter(p => {
        const price = p.listing_type === 'rental' ? p.monthly_rent : p.sales_price;
        return price && price >= filters.min_price!;
      });
    }
    if (filters.max_price) {
      filteredProperties = filteredProperties.filter(p => {
        const price = p.listing_type === 'rental' ? p.monthly_rent : p.sales_price;
        return price && price <= filters.max_price!;
      });
    }
    if (filters.bedrooms) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms === filters.bedrooms);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedProperties = filteredProperties.slice(startIndex, startIndex + limit);

    return {
      properties: paginatedProperties,
      total: filteredProperties.length
    };

  } catch (error) {
    console.error('Error fetching public properties:', error);
    throw error;
  }
}

/**
 * Fetch single public property by ID
 */
export async function fetchPublicPropertyById(id: string): Promise<PublicProperty | null> {
  try {
    // Try rental first
    const { data: rentalProperty, error: rentalError } = await sb
      .from('properties')
      .select(`
        id, listing_title, property_type, address, city, state, zip_code,
        neighborhood, monthly_rent, bedrooms, bathrooms, square_footage,
        description, images, available_date, amenities, furnished,
        parking, pet_policy, utilities_included, created_at, updated_at, user_id
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (rentalProperty && !rentalError) {
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      
      if (rentalProperty.user_id) {
        const { data: profile, error } = await sb
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', rentalProperty.user_id)
          .single();
        
        if (!error && profile?.full_name) {
          landlord_name = profile.full_name;
          property_owner = profile.full_name;
        }
      }

      return {
        ...rentalProperty,
        listing_type: 'rental',
        landlord_name,
        property_owner
      };
    }

    // Try sales
    const { data: salesProperty, error: salesError } = await sb
      .from('sales_listings')
      .select(`
        id, listing_title, property_type, address, city, state, zip_code,
        neighborhood, sales_price, bedrooms, bathrooms, square_footage,
        description, images, available_date, amenities, furnished,
        parking, pet_policy, utilities_included, created_at, updated_at, user_id
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (salesProperty && !salesError) {
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      
      if (salesProperty.user_id) {
        const { data: profile, error } = await sb
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', salesProperty.user_id)
          .single();
        
        if (!error && profile?.full_name) {
          landlord_name = profile.full_name;
          property_owner = profile.full_name;
        }
      }

      return {
        ...salesProperty,
        listing_type: 'sales',
        landlord_name,
        property_owner
      };
    }

    return null;

  } catch (error) {
    console.error('Error fetching public property:', error);
    throw error;
  }
}
