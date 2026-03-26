import { AddressSuggestion, AddressDetails } from "@/types/address";

export interface PostalCodeServiceType {
  validatePostalCode(code: string): boolean;
  searchByPostalCode(postalCode: string): Promise<AddressSuggestion[]>;
  getAddressFromPostalCode(postalCode: string): Promise<AddressDetails | null>;
}

// In-memory cache for postal code lookups
const postalCodeCache = new Map<string, { result: AddressSuggestion | null; ts: number }>();
const CACHE_TTL = 60_000; // 1 minute

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Validates Canadian postal code format: A1A 1A1
 * Examples: M5V 3A8, V6B 4X8, T2P 1N8
 */
function validatePostalCodeFormat(code: string): boolean {
  const cleaned = code.trim().toUpperCase();
  // Pattern: Letter-Digit-Letter space Digit-Letter-Digit
  const pattern = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
  return pattern.test(cleaned);
}

/**
 * Normalizes postal code to standard format: A1A 1A1
 */
function normalizePostalCode(code: string): string {
  const cleaned = code.trim().toUpperCase().replace(/\s/g, '');
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return code;
}

/**
 * Postal code to coordinates mapping for major Canadian cities
 * Fallback when Nominatim doesn't find the postal code
 */
const POSTAL_CODE_COORDINATES: Record<string, { lat: number; lng: number; city: string; province: string }> = {
  // Ontario
  'M5V': { lat: 43.6426, lng: -79.3957, city: 'Toronto', province: 'ON' },
  'M4Y': { lat: 43.6629, lng: -79.3957, city: 'Toronto', province: 'ON' },
  'M5H': { lat: 43.6532, lng: -79.3802, city: 'Toronto', province: 'ON' },
  'L1W': { lat: 43.8509, lng: -79.1204, city: 'Whitby', province: 'ON' },
  'L4J': { lat: 43.8509, lng: -79.1204, city: 'Whitby', province: 'ON' },
  'K1A': { lat: 45.4215, lng: -75.6972, city: 'Ottawa', province: 'ON' },
  'N5Y': { lat: 43.4516, lng: -81.4878, city: 'London', province: 'ON' },
  'L5A': { lat: 43.2557, lng: -79.8711, city: 'Hamilton', province: 'ON' },
  
  // British Columbia
  'V6B': { lat: 49.2827, lng: -123.1207, city: 'Vancouver', province: 'BC' },
  'V5K': { lat: 49.2200, lng: -123.0724, city: 'Vancouver', province: 'BC' },
  'V6A': { lat: 49.3200, lng: -123.0724, city: 'Vancouver', province: 'BC' },
  'V8V': { lat: 48.4761, lng: -123.3656, city: 'Victoria', province: 'BC' },
  
  // Alberta
  'T2P': { lat: 51.0447, lng: -114.0719, city: 'Calgary', province: 'AB' },
  'T1Y': { lat: 51.0447, lng: -114.0719, city: 'Calgary', province: 'AB' },
  'T5J': { lat: 53.5461, lng: -113.4938, city: 'Edmonton', province: 'AB' },
  'T6E': { lat: 53.5461, lng: -113.4938, city: 'Edmonton', province: 'AB' },
  
  // Quebec
  'H2X': { lat: 45.5017, lng: -73.5673, city: 'Montreal', province: 'QC' },
  'H1A': { lat: 45.5017, lng: -73.5673, city: 'Montreal', province: 'QC' },
  'G1R': { lat: 46.8139, lng: -71.2080, city: 'Quebec City', province: 'QC' },
  
  // Manitoba
  'R3C': { lat: 49.8951, lng: -97.1384, city: 'Winnipeg', province: 'MB' },
  'R2H': { lat: 49.8951, lng: -97.1384, city: 'Winnipeg', province: 'MB' },
  
  // Saskatchewan
  'S4P': { lat: 50.4452, lng: -104.6189, city: 'Regina', province: 'SK' },
  'S7K': { lat: 52.1294, lng: -106.6700, city: 'Saskatoon', province: 'SK' },
  
  // Nova Scotia
  'B3J': { lat: 44.6426, lng: -63.2181, city: 'Halifax', province: 'NS' },
  'B3H': { lat: 44.6426, lng: -63.2181, city: 'Halifax', province: 'NS' },
  
  // New Brunswick
  'E1A': { lat: 46.1091, lng: -64.8537, city: 'Saint John', province: 'NB' },
  'E2A': { lat: 46.0883, lng: -64.7734, city: 'Saint John', province: 'NB' },
  
  // Prince Edward Island
  'C1A': { lat: 46.2382, lng: -63.1311, city: 'Charlottetown', province: 'PE' },
  
  // Newfoundland and Labrador
  'A1A': { lat: 47.5615, lng: -52.7126, city: 'St. John\'s', province: 'NL' },
  'A1B': { lat: 47.5615, lng: -52.7126, city: 'St. John\'s', province: 'NL' },
};

/**
 * Converts postal code to approximate coordinates
 * Uses Nominatim first, then falls back to postal code database
 */
async function getCoordinatesFromPostalCode(postalCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const normalized = normalizePostalCode(postalCode);
    
    // Try Nominatim first
    try {
      const url = new URL(NOMINATIM_REVERSE_URL);
      url.searchParams.set('q', `${normalized}, Canada`);
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '1');

      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'HomieAI/1.0' },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.lat && data.lon) {
          return {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lon),
          };
        }
      }
    } catch (nominatimErr) {
      console.warn('Nominatim lookup failed, trying fallback database:', nominatimErr);
    }

    // Fallback: Use postal code prefix database
    const prefix = normalized.substring(0, 3).toUpperCase();
    const fallbackCoords = POSTAL_CODE_COORDINATES[prefix];
    
    if (fallbackCoords) {
      console.log(`Using fallback coordinates for postal code prefix ${prefix}`);
      return {
        lat: fallbackCoords.lat,
        lng: fallbackCoords.lng,
      };
    }

    return null;
  } catch (err) {
    console.error('Error getting coordinates from postal code:', err);
    return null;
  }
}

/**
 * Gets detailed address information from coordinates
 */
async function getAddressFromCoordinates(lat: number, lng: number): Promise<AddressDetails | null> {
  try {
    const url = new URL(NOMINATIM_REVERSE_URL);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'HomieAI/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`Reverse geocode error: ${res.status}`);

    const data = await res.json();
    const addr = data.address || {};

    const streetNumber = addr.house_number || '';
    const streetName = addr.road || '';
    const fullAddress = streetNumber && streetName
      ? `${streetNumber} ${streetName}`
      : streetName || '';

    const city = (addr.city || addr.town || addr.municipality || addr.village || '').trim();
    const state = (addr.state || addr.province || '').trim();
    const postcode = addr.postcode ? normalizePostalCode(addr.postcode) : '';

    return {
      address: fullAddress,
      city,
      state,
      zipCode: postcode,
      neighborhood: (addr.suburb || addr.neighbourhood || '').trim(),
      coordinates: { lat, lng },
      place_name: [fullAddress, city, state, postcode].filter(Boolean).join(', ') + ', Canada',
    };
  } catch (err) {
    console.error('Error getting address from coordinates:', err);
    
    // Return minimal address with coordinates
    // This allows postal code search to work even if reverse geocoding fails
    return {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      neighborhood: '',
      coordinates: { lat, lng },
      place_name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}, Canada`,
    };
  }
}

export class PostalCodeService implements PostalCodeServiceType {
  validatePostalCode(code: string): boolean {
    return validatePostalCodeFormat(code);
  }

  async searchByPostalCode(postalCode: string): Promise<AddressSuggestion[]> {
    if (!postalCode || !this.validatePostalCode(postalCode)) {
      return [];
    }

    const normalized = normalizePostalCode(postalCode);
    const cacheKey = normalized.toLowerCase();
    
    // Check cache
    const cached = postalCodeCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.result ? [cached.result] : [];
    }

    try {
      const coords = await getCoordinatesFromPostalCode(normalized);
      
      if (!coords) {
        postalCodeCache.set(cacheKey, { result: null, ts: Date.now() });
        return [];
      }

      const addressDetails = await getAddressFromCoordinates(coords.lat, coords.lng);
      
      if (!addressDetails) {
        postalCodeCache.set(cacheKey, { result: null, ts: Date.now() });
        return [];
      }

      // Build a meaningful address from available data
      let addressText = '';
      if (addressDetails.address && addressDetails.city) {
        addressText = `${addressDetails.address}, ${addressDetails.city}, ${addressDetails.state}`;
      } else if (addressDetails.city && addressDetails.state) {
        addressText = `${addressDetails.city}, ${addressDetails.state}`;
      } else if (addressDetails.city) {
        addressText = addressDetails.city;
      } else {
        // Fallback: use postal code prefix to get city from database
        const prefix = normalized.substring(0, 3).toUpperCase();
        const fallbackData = POSTAL_CODE_COORDINATES[prefix];
        if (fallbackData) {
          addressText = `${fallbackData.city}, ${fallbackData.province}`;
        } else {
          addressText = normalized;
        }
      }

      const suggestion: AddressSuggestion = {
        id: `postal-${normalized}`,
        text: addressText,
        place_name: `${addressText} ${normalized}, Canada`,
        center: [addressDetails.coordinates.lng, addressDetails.coordinates.lat],
        context: [],
      };

      postalCodeCache.set(cacheKey, { result: suggestion, ts: Date.now() });
      return [suggestion];
    } catch (err) {
      console.error('Postal code search error:', err);
      postalCodeCache.set(cacheKey, { result: null, ts: Date.now() });
      return [];
    }
  }

  async getAddressFromPostalCode(postalCode: string): Promise<AddressDetails | null> {
    if (!postalCode || !this.validatePostalCode(postalCode)) {
      return null;
    }

    try {
      const coords = await getCoordinatesFromPostalCode(postalCode);
      
      if (!coords) {
        return null;
      }

      return await getAddressFromCoordinates(coords.lat, coords.lng);
    } catch (err) {
      console.error('Error getting address from postal code:', err);
      return null;
    }
  }
}

export const postalCodeService = new PostalCodeService();
