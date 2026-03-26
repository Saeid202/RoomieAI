import { AddressSuggestion, AddressDetails } from "@/types/address";

export interface LocationServiceType {
  searchAddress(query: string): Promise<AddressSuggestion[]>;
  getAddressDetails(suggestion: AddressSuggestion): Promise<AddressDetails>;
}

// In-memory cache to avoid redundant API calls
const searchCache = new Map<string, { results: AddressSuggestion[]; ts: number }>();
const CACHE_TTL = 60_000; // 1 minute

// Photon is much faster than Nominatim (Komoot's geocoder, no API key needed)
const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const PROVINCE_MAP: Record<string, string> = {
  'British Columbia': 'BC', 'B.C.': 'BC',
  'Alberta': 'AB', 'Alta.': 'AB',
  'Saskatchewan': 'SK', 'Sask.': 'SK',
  'Manitoba': 'MB', 'Man.': 'MB',
  'Ontario': 'ON', 'Ont.': 'ON',
  'Quebec': 'QC', 'Que.': 'QC', 'Québec': 'QC',
  'New Brunswick': 'NB', 'N.B.': 'NB',
  'Nova Scotia': 'NS', 'N.S.': 'NS',
  'Prince Edward Island': 'PE', 'P.E.I.': 'PE',
  'Newfoundland and Labrador': 'NL', 'Newfoundland': 'NL', 'N.L.': 'NL',
  'Yukon': 'YT', 'Yukon Territory': 'YT',
  'Northwest Territories': 'NT', 'N.W.T.': 'NT',
  'Nunavut': 'NU',
  // Already abbreviated
  'BC': 'BC', 'AB': 'AB', 'SK': 'SK', 'MB': 'MB', 'ON': 'ON',
  'QC': 'QC', 'NB': 'NB', 'NS': 'NS', 'PE': 'PE', 'NL': 'NL',
  'YT': 'YT', 'NT': 'NT', 'NU': 'NU',
};

function normalizeProvince(p: string): string {
  return PROVINCE_MAP[p] || p || '';
}

function formatPostalCode(raw: string): string {
  const clean = raw.replace(/\s/g, '').toUpperCase();
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(clean)) {
    return clean.slice(0, 3) + ' ' + clean.slice(3);
  }
  return raw;
}

export class LocationService implements LocationServiceType {
  private deduplicateResults(results: AddressSuggestion[]): AddressSuggestion[] {
    // Group by city + province to identify duplicates
    const seen = new Map<string, AddressSuggestion>();
    
    for (const result of results) {
      // Extract city and province from the text
      const parts = result.text.split(', ');
      const city = parts[1] || '';
      const province = parts[2] || '';
      const street = parts[0] || '';
      
      // Create a key for deduplication: "street|city|province"
      const key = `${street.toLowerCase()}|${city.toLowerCase()}|${province.toLowerCase()}`;
      
      // Keep first occurrence of each unique street in each city/province
      if (!seen.has(key)) {
        seen.set(key, result);
      }
    }
    
    return Array.from(seen.values());
  }

  async searchAddress(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = query.trim().toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.results;
    }

    try {
      // Photon API — fast, free, no key, Canada-biased via bbox
      const url = new URL(PHOTON_URL);
      url.searchParams.set('q', query.trim() + ' Canada');
      url.searchParams.set('limit', '20'); // Increased from 8 to 20 for better coverage
      url.searchParams.set('lang', 'en');
      // Bias toward Canada bounding box
      url.searchParams.set('bbox', '-141,41,-52,84');

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(4000), // 4s hard timeout
      });

      if (!res.ok) throw new Error(`Photon error: ${res.status}`);

      const data = await res.json();
      const features: any[] = data.features || [];

      let results: AddressSuggestion[] = features
        .filter((f: any) => {
          const p = f.properties;
          // Only Canadian results
          return p.country_code === 'ca' || p.country === 'Canada' || p.country === 'CA';
        })
        .map((f: any) => {
          const p = f.properties;
          const [lng, lat] = f.geometry.coordinates;

          const parts: string[] = [];
          if (p.housenumber && p.street) parts.push(`${p.housenumber} ${p.street}`);
          else if (p.street) parts.push(p.street);
          else if (p.name) parts.push(p.name);

          const city = p.city || p.town || p.village || p.municipality || '';
          if (city) parts.push(city);

          const province = normalizeProvince(p.state || p.county || '');
          if (province) parts.push(province);

          if (p.postcode) parts.push(formatPostalCode(p.postcode));

          const text = parts.join(', ');
          const place_name = [text, 'Canada'].filter(Boolean).join(', ');

          return {
            id: `${f.properties.osm_id || Math.random()}`,
            text,
            place_name,
            center: [lng, lat] as [number, number],
            context: [],
          };
        })
        .filter(s => s.text.length > 0);

      // Apply deduplication to remove duplicate streets in same city
      results = this.deduplicateResults(results);

      searchCache.set(cacheKey, { results, ts: Date.now() });
      return results;
    } catch (err) {
      console.error('Address search error:', err);
      return [];
    }
  }

  async getAddressDetails(suggestion: AddressSuggestion): Promise<AddressDetails> {
    try {
      const [lng, lat] = suggestion.center;
      const url = new URL(NOMINATIM_REVERSE_URL);
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lon', lng.toString());
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');

      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'RoomieAI/1.0' },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) throw new Error(`Reverse geocode error: ${res.status}`);

      const data = await res.json();
      const addr = data.address || {};

      const streetNumber = addr.house_number || '';
      const streetName = addr.road || '';
      const fullAddress = streetNumber && streetName
        ? `${streetNumber} ${streetName}`
        : streetName || suggestion.text.split(',')[0].trim();

      return {
        address: fullAddress,
        city: (addr.city || addr.town || addr.municipality || addr.village || '').trim(),
        state: normalizeProvince(addr.state || addr.province || ''),
        zipCode: addr.postcode ? formatPostalCode(addr.postcode) : '',
        neighborhood: (addr.suburb || addr.neighbourhood || '').trim(),
        coordinates: { lat: parseFloat(data.lat), lng: parseFloat(data.lon) },
        place_name: suggestion.place_name,
      };
    } catch {
      const parts = suggestion.text.split(',');
      return {
        address: parts[0]?.trim() || '',
        city: parts[1]?.trim() || '',
        state: parts[2]?.trim() || '',
        zipCode: parts[3]?.trim() || '',
        neighborhood: '',
        coordinates: { lat: suggestion.center[1], lng: suggestion.center[0] },
        place_name: suggestion.place_name,
      };
    }
  }
}

export const locationService = new LocationService();
