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
  listing_agent?: string;
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

    const { data: properties, error } = await sb
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('🔍 Total properties found:', properties?.length || 0);

    const allProperties: PublicProperty[] = [];

    // Process all properties
    for (const property of properties || []) {
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';

      if (property.user_id) {
        try {
          // Direct query to user_profiles table (bypass view)
          const { data: profile, error } = await sb
            .from('user_profiles')
            .select('full_name, email, role')
            .eq('id', property.user_id)
            .single();

          console.log('🔄 Profile query result:', { profile, error });

          if (!error && profile?.full_name) {
            landlord_name = profile.full_name;
            property_owner = profile.full_name;
            const role = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : undefined;
            (property as any).listing_agent = role;
            console.log('✅ Using profile name:', landlord_name, 'role:', role);
          }
        } catch (err) {
          console.error('Exception fetching profile:', err);
        }
      }

      // Map listing_category to listing_type for backward compatibility
      const listing_type = property.listing_category === 'sale' ? 'sales' : 'rental';

      allProperties.push({
        ...property,
        listing_type,
        landlord_name,
        property_owner,
        listing_agent: (property as any).listing_agent
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
    // Query unified properties table
    const { data: property, error } = await sb
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !property) {
      console.error('Property not found:', error);
      return null;
    }

    let landlord_name = 'Property Owner';
    let property_owner = 'Property Owner';

    if (property.user_id) {
      const { data: profile, error: profileError } = await sb
        .from('user_profiles')
        .select('full_name, email, role')
        .eq('id', property.user_id)
        .single();

      if (!profileError && profile?.full_name) {
        landlord_name = profile.full_name;
        property_owner = profile.full_name;
        const role = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : undefined;
        (property as any).listing_agent = role;
      }
    }

    // Map listing_category to listing_type for backward compatibility
    const listing_type = property.listing_category === 'sale' ? 'sales' : 'rental';

    return {
      ...property,
      listing_type,
      landlord_name,
      property_owner,
      listing_agent: (property as any).listing_agent
    };

  } catch (error) {
    console.error('Error fetching public property:', error);
    throw error;
  }
}
