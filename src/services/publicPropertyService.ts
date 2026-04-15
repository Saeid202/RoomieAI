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

    // Batch-fetch all landlord profiles in ONE query instead of N queries in a loop
    const userIds = [...new Set((properties || []).map((p: any) => p.user_id).filter(Boolean))];
    const profileMap: Record<string, { full_name: string; role: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await sb
        .from('user_profiles')
        .select('id, full_name, role')
        .in('id', userIds);

      // Build a lookup map — if RLS blocks this (400/empty), we just show 'Property Owner'
      for (const p of profiles || []) {
        profileMap[p.id] = { full_name: p.full_name, role: p.role };
      }
    }

    // Process all properties using the pre-fetched map
    for (const property of properties || []) {
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      let listing_agent: string | undefined;

      const profile = property.user_id ? profileMap[property.user_id] : null;
      if (profile?.full_name) {
        landlord_name = profile.full_name;
        property_owner = profile.full_name;
        listing_agent = profile.role
          ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
          : undefined;
      }

      // Map listing_category to listing_type for backward compatibility
      const listing_type = property.listing_category === 'sale' ? 'sales' : 'rental';

      allProperties.push({
        ...property,
        listing_type,
        landlord_name,
        property_owner,
        listing_agent
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
    let listing_agent: string | undefined;

    if (property.user_id) {
      const { data: profile } = await sb
        .from('user_profiles')
        .select('full_name, role')
        .eq('id', property.user_id)
        .maybeSingle();

      if (profile?.full_name) {
        landlord_name = profile.full_name;
        property_owner = profile.full_name;
        listing_agent = profile.role
          ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
          : undefined;
      }
    }

    // Map listing_category to listing_type for backward compatibility
    const listing_type = property.listing_category === 'sale' ? 'sales' : 'rental';

    return {
      ...property,
      listing_type,
      landlord_name,
      property_owner,
      listing_agent
    };

  } catch (error) {
    console.error('Error fetching public property:', error);
    throw error;
  }
}
