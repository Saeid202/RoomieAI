// Revert to working version without syntax errors
// This will fix the blank page issue

export async function fetchPublicProperties(
  filters: PublicPropertyFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ properties: PublicProperty[]; total: number }> {
  try {
    console.log('🚀 Starting fetchPublicProperties with filters:', filters);
    
    // Fetch rental properties
    console.log('📊 Executing rental query...');
    const { data: rentalProperties, error: rentalError } = await sb
      .from('properties')
      .select(`
        id,
        listing_title,
        property_type,
        address,
        city,
        state,
        zip_code,
        neighborhood,
        monthly_rent,
        bedrooms,
        bathrooms,
        square_footage,
        description,
        images,
        available_date,
        amenities,
        furnished,
        parking,
        pet_policy,
        utilities_included,
        created_at,
        updated_at,
        user_id
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    console.log('📊 Rental query result:', { rentalProperties, rentalError });

    // Fetch sales properties
    console.log('📊 Executing sales query...');
    const { data: salesProperties, error: salesError } = await sb
      .from('sales_listings')
      .select(`
        id,
        listing_title,
        property_type,
        address,
        city,
        state,
        zip_code,
        neighborhood,
        sales_price,
        bedrooms,
        bathrooms,
        square_footage,
        description,
        images,
        available_date,
        amenities,
        furnished,
        parking,
        pet_policy,
        utilities_included,
        created_at,
        updated_at,
        user_id
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    console.log('📊 Sales query result:', { salesProperties, salesError });

    if (rentalError) throw rentalError;
    if (salesError) throw salesError;

    console.log('🔍 Total properties found:', {
      rental: rentalProperties?.length || 0,
      sales: salesProperties?.length || 0
    });

    // Combine and format properties
    const allProperties: PublicProperty[] = [];

    // Process rental properties
    for (const property of rentalProperties || []) {
      // Fetch landlord name (person who listed)
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      
      if (property.user_id) {
        try {
          // First try the view with correct property_id
          const { data: profile, error } = await sb
            .from('public_property_owners')
            .select('owner_name, owner_email')
            .eq('property_id', property.id)
            .single();
          
          console.log('📊 View query result:', { profile, error });
          
          if (error) {
            console.error('Error fetching owner from view:', error);
            // Fallback to direct user_profiles lookup
            const { data: fallbackProfile, error: fallbackError } = await sb
              .from('user_profiles')
              .select('full_name, email')
              .eq('id', property.user_id)
              .single();
            
            console.log('🔄 Fallback user_profiles result:', { fallbackProfile, fallbackError });
            
            if (!fallbackError && fallbackProfile) {
              landlord_name = fallbackProfile.full_name || 'Property Owner';
              property_owner = fallbackProfile.full_name || 'Property Owner';
              console.log('✅ Using user_profiles fallback name:', landlord_name);
            }
          } else if (profile?.owner_name) {
            landlord_name = profile.owner_name;
            property_owner = profile.owner_name;
            console.log('✅ Using view name:', landlord_name);
          } else if (profile?.owner_email) {
            landlord_name = profile.owner_email.split('@')[0];
            property_owner = profile.owner_email.split('@')[0];
            console.log('✅ Using email fallback:', landlord_name);
          }
        } catch (err) {
          console.error('Exception fetching profile for rental property:', err);
        }
        
        console.log('🎯 Final landlord data:', { landlord_name, property_owner });
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
      // Fetch owner name (person who listed)
      let landlord_name = 'Property Owner';
      let property_owner = 'Property Owner';
      
      if (property.user_id) {
        try {
          // First try the view with correct property_id
          const { data: profile, error } = await sb
            .from('public_property_owners')
            .select('owner_name, owner_email')
            .eq('property_id', property.id)
            .single();
          
          if (error) {
            console.error('Error fetching owner from view:', error);
            // Fallback to direct user_profiles lookup
            const { data: fallbackProfile, error: fallbackError } = await sb
              .from('user_profiles')
              .select('full_name, email')
              .eq('id', property.user_id)
              .single();
            
            if (!fallbackError && fallbackProfile) {
              landlord_name = fallbackProfile.full_name || 'Property Owner';
              property_owner = fallbackProfile.full_name || 'Property Owner';
            }
          } else if (profile?.owner_name) {
            landlord_name = profile.owner_name;
            property_owner = profile.owner_name;
          } else if (profile?.owner_email) {
            landlord_name = profile.owner_email.split('@')[0];
            property_owner = profile.owner_email.split('@')[0];
          }
        } catch (err) {
          console.error('Exception fetching profile for sales property:', err);
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
      filteredProperties = filteredProperties.filter(p => 
        p.listing_type === filters.listing_type
      );
    }

    if (filters.propertyType) {
      filteredProperties = filteredProperties.filter(p => 
        p.property_type === filters.propertyType
      );
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(p => {
        const price = p.listing_type === 'rental' ? p.monthly_rent : p.sales_price;
        return price >= filters.minPrice!;
      });
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(p => {
        const price = p.listing_type === 'rental' ? p.monthly_rent : p.sales_price;
        return price <= filters.maxPrice!;
      });
    }

    if (filters.bedrooms) {
      filteredProperties = filteredProperties.filter(p => 
        p.bedrooms === filters.bedrooms
      );
    }

    if (filters.city) {
      filteredProperties = filteredProperties.filter(p => 
        p.city === filters.city
      );
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
