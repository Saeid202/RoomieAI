import { supabase } from "@/integrations/supabase/client";

// Repliers API types
interface RepliersListing {
  id: string;
  address: string;
  city: string;
  province: string;
  price: number;
  listing_type: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking: string;
  images: string[];
  description: string;
  amenities: string[];
  available_date: string;
  mls_number: string;
  agent_name: string;
  agent_email: string;
  agent_phone: string;
  brokerage_name: string;
  listed_at: string;
}

// HomieAI format
export interface MLSListing {
  id: string;
  source: 'mls';
  address: string;
  city: string;
  province: string;
  price: number;
  listingType: 'lease' | 'sale';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  parking: string;
  images: string[];
  description: string;
  amenities: string[];
  availableDate: string;
  mlsNumber: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  brokerageName: string;
  listedAt: string;
}

/**
 * Mock data for sandbox mode - 10 realistic Toronto rental listings
 */
const MOCK_LISTINGS: MLSListing[] = [
  {
    id: 'mls-001',
    source: 'mls',
    address: '120 Harbour Street Unit 4502',
    city: 'Toronto',
    province: 'ON',
    price: 2800,
    listingType: 'lease',
    propertyType: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    parking: 'Underground',
    images: ['https://placehold.co/800x500'],
    description: 'Beautiful waterfront condo in downtown Toronto with stunning lake views.',
    amenities: ['Gym', 'Concierge', 'Pool', 'Rooftop Terrace'],
    availableDate: '2026-04-01',
    mlsNumber: 'C1234567',
    agentName: 'Sarah Johnson',
    agentEmail: 'sarah@remax.ca',
    agentPhone: '416-555-0101',
    brokerageName: 'RE/MAX Hallmark',
    listedAt: '2026-03-01'
  },
  {
    id: 'mls-002',
    source: 'mls',
    address: '4500 Yonge Street Unit 220',
    city: 'Toronto',
    province: 'ON',
    price: 3200,
    listingType: 'lease',
    propertyType: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    parking: 'Street',
    images: ['https://placehold.co/800x500'],
    description: 'Modern condo in the heart of Yorkville with high-end finishes.',
    amenities: ['Gym', 'Concierge', 'Party Room', 'BBQ Area'],
    availableDate: '2026-04-15',
    mlsNumber: 'C1234568',
    agentName: 'Michael Chen',
    agentEmail: 'michael@century21.ca',
    agentPhone: '416-555-0102',
    brokerageName: 'Century 21',
    listedAt: '2026-03-02'
  },
  {
    id: 'mls-003',
    source: 'mls',
    address: '1500 Finch Avenue West',
    city: 'North York',
    province: 'ON',
    price: 2500,
    listingType: 'lease',
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    parking: 'Driveway',
    images: ['https://placehold.co/800x500'],
    description: 'Cozy family home in a quiet residential neighborhood.',
    amenities: ['Backyard', 'Garage', 'Fireplace', 'Renovated Kitchen'],
    availableDate: '2026-05-01',
    mlsNumber: 'C1234569',
    agentName: 'Emily Davis',
    agentEmail: 'emily@realtor.ca',
    agentPhone: '416-555-0103',
    brokerageName: 'Royal LePage',
    listedAt: '2026-03-03'
  },
  {
    id: 'mls-004',
    source: 'mls',
    address: '888 Sheppard Avenue East',
    city: 'North York',
    province: 'ON',
    price: 2100,
    listingType: 'lease',
    propertyType: 'Townhouse',
    bedrooms: 2,
    bathrooms: 2,
    parking: 'Private',
    images: ['https://placehold.co/800x500'],
    description: 'Spacious townhouse near Sheppard subway with modern amenities.',
    amenities: ['Balcony', 'Laundry', 'Security System', 'Parking'],
    availableDate: '2026-04-10',
    mlsNumber: 'C1234570',
    agentName: 'David Kim',
    agentEmail: 'david@bhs.ca',
    agentPhone: '416-555-0104',
    brokerageName: 'Berkley Haas',
    listedAt: '2026-03-04'
  },
  {
    id: 'mls-005',
    source: 'mls',
    address: '3333 Steeles Avenue East',
    city: 'Scarborough',
    province: 'ON',
    price: 1800,
    listingType: 'lease',
    propertyType: 'Condo',
    bedrooms: 1,
    bathrooms: 1,
    parking: 'Surface',
    images: ['https://placehold.co/800x500'],
    description: 'Affordable condo near Steeles subway, perfect for first-time renters.',
    amenities: ['Gym', 'Pool', 'Security', 'Elevator'],
    availableDate: '2026-04-05',
    mlsNumber: 'C1234571',
    agentName: 'Jessica Wang',
    agentEmail: 'jessica@remax.ca',
    agentPhone: '416-555-0105',
    brokerageName: 'RE/MAX All-Stars',
    listedAt: '2026-03-05'
  },
  {
    id: 'mls-006',
    source: 'mls',
    address: '1000 Queen Street East',
    city: 'Toronto',
    province: 'ON',
    price: 3500,
    listingType: 'lease',
    propertyType: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    parking: 'Underground',
    images: ['https://placehold.co/800x500'],
    description: 'Luxury condo in the Distillery District with historic charm.',
    amenities: ['Gym', 'Concierge', 'Rooftop Deck', 'Smart Home System'],
    availableDate: '2026-05-15',
    mlsNumber: 'C1234572',
    agentName: 'Robert Taylor',
    agentEmail: 'robert@century21.ca',
    agentPhone: '416-555-0106',
    brokerageName: 'Century 21',
    listedAt: '2026-03-06'
  },
  {
    id: 'mls-007',
    source: 'mls',
    address: '5555 Derry Road',
    city: 'Mississauga',
    province: 'ON',
    price: 2200,
    listingType: 'lease',
    propertyType: 'House',
    bedrooms: 4,
    bathrooms: 3,
    parking: 'Driveway',
    images: ['https://placehold.co/800x500'],
    description: 'Large family home in a family-friendly neighborhood with great schools.',
    amenities: ['Backyard', 'Garage', 'Basement Finish', 'Playground Nearby'],
    availableDate: '2026-06-01',
    mlsNumber: 'C1234573',
    agentName: 'Amanda Brown',
    agentEmail: 'amanda@realtor.ca',
    agentPhone: '416-555-0107',
    brokerageName: 'Realtor.ca',
    listedAt: '2026-03-07'
  },
  {
    id: 'mls-008',
    source: 'mls',
    address: '2222 Finch Avenue East',
    city: 'Scarborough',
    province: 'ON',
    price: 1950,
    listingType: 'lease',
    propertyType: 'Townhouse',
    bedrooms: 2,
    bathrooms: 1,
    parking: 'Private',
    images: ['https://placehold.co/800x500'],
    description: 'Cozy townhouse near Scarborough Town Centre with easy access to transit.',
    amenities: ['Laundry', 'Parking', 'Storage', 'Pet Friendly'],
    availableDate: '2026-04-20',
    mlsNumber: 'C1234574',
    agentName: 'Chris Martinez',
    agentEmail: 'chris@bhs.ca',
    agentPhone: '416-555-0108',
    brokerageName: 'Berkley Haas',
    listedAt: '2026-03-08'
  },
  {
    id: 'mls-009',
    source: 'mls',
    address: '1800 Yonge Street',
    city: 'Toronto',
    province: 'ON',
    price: 4500,
    listingType: 'lease',
    propertyType: 'Condo',
    bedrooms: 3,
    bathrooms: 3,
    parking: 'Underground',
    images: ['https://placehold.co/800x500'],
    description: 'Premium luxury condo in the heart of the city with concierge service.',
    amenities: ['Gym', 'Concierge', 'Pool', 'Rooftop Terrace', 'Spa', 'Theatre Room'],
    availableDate: '2026-05-01',
    mlsNumber: 'C1234575',
    agentName: 'Jennifer Lee',
    agentEmail: 'jennifer@remax.ca',
    agentPhone: '416-555-0109',
    brokerageName: 'RE/MAX Hallmark',
    listedAt: '2026-03-09'
  },
  {
    id: 'mls-010',
    source: 'mls',
    address: '1555 Markham Road',
    city: 'Markham',
    province: 'ON',
    price: 2400,
    listingType: 'lease',
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    parking: 'Driveway',
    images: ['https://placehold.co/800x500'],
    description: 'Charming bungalow in a quiet suburban neighborhood.',
    amenities: ['Backyard', 'Garage', 'Renovated', 'Close to Parks'],
    availableDate: '2026-05-10',
    mlsNumber: 'C1234576',
    agentName: 'Kevin Wilson',
    agentEmail: 'kevin@realtor.ca',
    agentPhone: '416-555-0110',
    brokerageName: 'Royal LePage',
    listedAt: '2026-03-10'
  }
];

/**
 * Format raw Repliers API response to HomieAI format
 */
function formatRepliersListing(raw: any): MLSListing {
  return {
    id: raw.id || `mls-${Date.now()}`,
    source: 'mls' as const,
    address: raw.address || '',
    city: raw.city || '',
    province: raw.province || 'ON',
    price: raw.price || 0,
    listingType: raw.listing_type === 'sale' ? 'sale' : 'lease',
    propertyType: raw.property_type || '',
    bedrooms: raw.bedrooms || 0,
    bathrooms: raw.bathrooms || 0,
    parking: raw.parking || '',
    images: raw.images || ['https://placehold.co/800x500'],
    description: raw.description || '',
    amenities: raw.amenities || [],
    availableDate: raw.available_date || '',
    mlsNumber: raw.mls_number || '',
    agentName: raw.agent_name || '',
    agentEmail: raw.agent_email || '',
    agentPhone: raw.agent_phone || '',
    brokerageName: raw.brokerage_name || '',
    listedAt: raw.listed_at || ''
  };
}

/**
 * Get Repliers API configuration
 */
function getRepliersConfig() {
  const apiKey = import.meta.env.VITE_REPLIERS_API_KEY || process.env.REPLIERS_API_KEY;
  const baseUrl = import.meta.env.VITE_REPLIERS_BASE_URL || process.env.REPLIERS_BASE_URL || 'https://api.repliers.io';
  const isSandbox = true;

  console.log('Sandbox mode value:', import.meta.env.VITE_REPLIERS_SANDBOX);
  console.log('Is sandbox:', isSandbox);
  return { apiKey, baseUrl, isSandbox };
}

/**
 * Fetch MLS listings with optional filters
 */
export async function fetchMLSListings(filters?: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  propertyType?: string;
  listingType?: 'lease' | 'sale';
}): Promise<MLSListing[]> {
  const { apiKey, baseUrl, isSandbox } = getRepliersConfig();
  console.log('fetchMLSListings called with filters:', filters);

  // Return mock data in sandbox mode
  if (isSandbox) {
    console.log('Sandbox mode: Returning mock MLS listings');
    console.log('Returning mock listings:', MOCK_LISTINGS.length);
    
    // Filter mock data based on request filters
    let filtered = [...MOCK_LISTINGS];

    if (filters?.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(
        listing => 
          listing.city.toLowerCase().includes(locationLower) ||
          listing.address.toLowerCase().includes(locationLower)
      );
    }

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price <= filters.maxPrice!);
    }

    if (filters?.bedrooms) {
      filtered = filtered.filter(listing => listing.bedrooms >= parseInt(filters.bedrooms!));
    }

    if (filters?.propertyType) {
      filtered = filtered.filter(listing => 
        listing.propertyType.toLowerCase() === filters.propertyType!.toLowerCase()
      );
    }

    if (filters?.listingType) {
      filtered = filtered.filter(listing => listing.listingType === filters.listingType);
    }

    return filtered;
  }

  // Production mode - call Repliers API
  try {
    const params = new URLSearchParams();
    if (filters?.location) params.append('city', filters.location);
    if (filters?.minPrice !== undefined) params.append('min_price', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('max_price', filters.maxPrice.toString());
    if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters?.propertyType) params.append('property_type', filters.propertyType);
    if (filters?.listingType) params.append('listing_type', filters.listingType);

    const url = `${baseUrl}/listings?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Repliers API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format the response
    if (Array.isArray(data)) {
      return data.map(formatRepliersListing);
    } else if (data.listings && Array.isArray(data.listings)) {
      return data.listings.map(formatRepliersListing);
    }

    return [];
  } catch (error) {
    console.error('Error fetching MLS listings:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Fetch a single MLS listing by ID
 */
export async function fetchMLSListingById(mlsId: string): Promise<MLSListing | null> {
  const { apiKey, baseUrl, isSandbox } = getRepliersConfig();

  // Return mock data in sandbox mode
  if (isSandbox) {
    console.log('Sandbox mode: Returning mock MLS listing by ID');
    const listing = MOCK_LISTINGS.find(l => l.id === mlsId);
    return listing || null;
  }

  // Production mode - call Repliers API
  try {
    const url = `${baseUrl}/listings/${mlsId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Repliers API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return formatRepliersListing(data);
  } catch (error) {
    console.error('Error fetching MLS listing by ID:', error);
    return null;
  }
}
/**
 * Poll for new MLS listings from Repliers API
 * TODO: When Repliers account is live, poll their API every 30 minutes
 * For each new listing found, call checkPlanAheadMatches(listing)
 * This will notify matching Plan Ahead users
 */
export async function pollNewMLSListings() {
  console.log('MLS polling — coming soon when Repliers API key is active');
  // TODO: Implement when Repliers account is live
  // - Fetch new listings from Repliers API
  // - Compare with last polled timestamp
  // - For each new listing, call checkPlanAheadMatches(listing)
}
