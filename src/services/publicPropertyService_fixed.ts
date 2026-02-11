import { supabase } from "@/integrations/supabase/client-simple";
import type { Database } from "@/integrations/supabase/types";
import type { PublicProperty, PublicPropertyFilters } from "./publicPropertyService";

export interface PublicPropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  state?: string;
  listing_type?: 'rental' | 'sales';
}

const sb: any = supabase;

/**
 * Fetch public property listings (no authentication required)
 */
export async function fetchPublicProperties(
  filters: PublicPropertyFilters = {},
  page: number = 1,
  limit: number = 21
): Promise<{ properties: PublicProperty[]; total: number }> {
  try {
    console.log('🚀 Starting fetchPublicProperties with filters:', filters);
    
    // Fetch rental properties
    console.log('📊 Executing rental query...');
    
    const { data: rentalData, error: rentalError } = await sb
      .from('properties')
      .select('*')
      .range(filters.minPrice ? [filters.minPrice, 10000] : undefined, filters.maxPrice ? [filters.maxPrice, 1000000] : undefined)
      .ilike('city', `%${filters.location || ''}%`)
      .ilike('state', `%${filters.state || ''}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit);

    if (rentalError) {
      console.error('❌ Error fetching rental properties:', rentalError);
      throw new Error(`Failed to fetch rental properties: ${rentalError.message}`);
    }

    const rentalProperties = rentalData || [];

    // Fetch sales properties
    console.log('🏠 Executing sales query...');
    
    const { data: salesData, error: salesError } = await sb
      .from('sales_listings')
      .select('*')
      .range(filters.minPrice ? [filters.minPrice, 10000] : undefined, filters.maxPrice ? [filters.maxPrice, 1000000] : undefined)
      .ilike('city', `%${filters.location || ''}%`)
      .ilike('state', `%${filters.state || ''}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit);

    if (salesError) {
      console.error('❌ Error fetching sales properties:', salesError);
      throw new Error(`Failed to fetch sales properties: ${salesError.message}`);
    }

    const salesProperties = salesData || [];

    // Combine and format results
    const allProperties = [...rentalProperties, ...salesProperties];
    
    console.log(`✅ Successfully fetched ${allProperties.length} properties`);
    
    return {
      properties: allProperties,
      total: allProperties.length
    };
  } catch (error) {
    console.error('❌ Error in fetchPublicProperties:', error);
    throw new Error(`Failed to fetch public properties: ${error.message}`);
  }
}
