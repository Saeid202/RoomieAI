import { AddressSuggestion, AddressDetails } from "@/types/address";

// Location service for address autocomplete
export interface LocationServiceType {
  searchAddress(query: string): Promise<AddressSuggestion[]>;
  getAddressDetails(suggestion: AddressSuggestion): Promise<AddressDetails>;
}

const BASE_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export class LocationService implements LocationServiceType {
  // Enhanced preprocessing for Canadian postal code handling
  private preprocessCanadianQuery(query: string): string {
    let processed = query.trim();
    
    // Check for Canadian postal code in query
    const postalCodeMatch = processed.match(/([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)/g);
    
    if (postalCodeMatch && postalCodeMatch.length > 0) {
      const postalCode = postalCodeMatch[0].replace(/\s/g, '').toUpperCase();
      const formattedPostalCode = postalCode.slice(0, 3) + ' ' + postalCode.slice(3);
      
      // If query contains a postal code, prioritize postal code search
      const searchWithoutPostal = processed.replace(/([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)/g, '').trim();
      
      if (searchWithoutPostal.length > 0) {
        // Combine address with postal code for precise search
        return `${searchWithoutPostal}, ${formattedPostalCode}, Canada`;
      } else {
        // Postal code only
        return `${formattedPostalCode}, Canada`;
      }
    }
    
    // Handle partial postal codes at end
    const hasPostalPart = /[A-Za-z]\d[A-Za-z]/.test(processed);
    if (hasPostalPart && !/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(processed)) {
      // May be partial postal, still search widely
    }

    // Common street type abbreviations
    const streetAbbrevs = {
      'st': 'street', 'ave': 'avenue', 'av': 'avenue', 'rd': 'road', 
      'blvd': 'boulevard', 'cres': 'crescent', 'ct': 'court',
      'dr': 'drive', 'ln': 'lane', 'pl': 'place', 'way': 'way',
      'crescent': 'crescent', 'drive': 'drive', 'street': 'street',
      'avenue': 'avenue', 'boulevard': 'boulevard', 'road': 'road'
    };
    
    // Expand common abbreviations for better matching
    Object.entries(streetAbbrevs).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'gi');
      processed = processed.replace(regex, full);
    });
    
    // Add Canada context if no province mentioned and no Canadian indicators
    if (!this.hasProvinceCode(query) && !processed.includes('Canada')) {
      processed += ', Canada';
    }
    
    return processed;
  }
  
  // Check if query contains Canadian province abbreviations
  private hasProvinceCode(query: string): boolean {
    const provinces = ['BC', 'AB', 'MB', 'SK', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
    const upperQuery = query.toUpperCase();
    return provinces.some(prov => upperQuery.includes(prov));
  }
  
  // Normalize Canadian province names to standard format
  private normalizeCanadianProvince(province: string): string {
    if (!province) return "";
    
    const provinceMap: { [key: string]: string } = {
      'British Columbia': 'BC', 'B.C.': 'BC', 'BC': 'BC',
      'Alberta': 'AB', 'AB': 'AB', 'Alta.': 'AB',
      'Saskatchewan': 'SK', 'SK': 'SK', 'Sask.': 'SK',
      'Manitoba': 'MB', 'MB': 'MB', 'Man.': 'MB',
      'Ontario': 'ON', 'ON': 'ON', 'Ont.': 'ON',
      'Quebec': 'QC', 'QC': 'QC', 'Que.': 'QC', 'Québec': 'QC',
      'New Brunswick': 'NB', 'NB': 'NB', 'N.B.': 'NB',
      'Nova Scotia': 'NS', 'NS': 'NS', 'N.S.': 'NS',
      'Prince Edward Island': 'PE', 'PE': 'PE', 'P.E.I.': 'PE',
      'Newfoundland': 'NL', 'NL': 'NL', 'N.L.': 'NL', 'Newfoundland and Labrador': 'NL',
      'Yukon': 'YT', 'YT': 'YT', 'Yukon Territory': 'YT',
      'Northwest Territories': 'NT', 'NT': 'NT', 'N.W.T.': 'NT',
      'Nunavut': 'NU', 'NU': 'NU'
    };
    
    return provinceMap[province] || province;
  }
  
  // Validate Canadian postal code format and check validity
  private isValidCanadianPostalCode(postalCode: string): boolean {
    if (!postalCode) return false;
    // Test format: Alpha-Numeric-Alpha Space Numeric-Alpha-Numeric
    const cleanPostal = postalCode.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleanPostal);
  }
  
  // Enhanced address search with postal code optimization
  async searchAddress(query: string): Promise<AddressSuggestion[]> {
    try {
      const processedQuery = this.preprocessCanadianQuery(query);
      
      // Check if query has a postal code pattern
      const hasCompletePostalCode = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/.test(query);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Searching for Canadian address: "${query}" -> "${processedQuery}"`);
      }
      
      const url = new URL(BASE_NOMINATIM_URL);
      url.searchParams.set("q", processedQuery);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", hasCompletePostalCode ? "8" : "15"); // For postal code, get fewer but more targeted
      url.searchParams.set("countrycodes", "ca"); // Focus on Canada only
      url.searchParams.set("dedupe", "1"); // Remove duplicates
      
      // More flexible feature matching for better postal code lookup
      if (hasCompletePostalCode) {
        url.searchParams.set("featuretype", "house,residential"); // Prioritize residential addresses
      } else {
        url.searchParams.set("featuretype", "house,house_number"); // Better for specific addresses
      }
      
      url.searchParams.set("extratags", "1"); // Get additional address details
      url.searchParams.set("namedetails", "1"); // Get name details for better formatting
      url.searchParams.set("bounded", "1"); // For better regional results

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "RoomieAI/1.0", // Required by Nominatim
        },
        mode: "cors", // For cross-origin policy
      });

      if (!response.ok) {
        throw new Error(`Failed to search address: ${response.statusText}`);
      }

      const results = await response.json();
      
      return results
        .filter((item: any) => {
          // Must have complete geographic data
          if (!item.address || !item.lat || !item.lon) return false;
          
          const addr = item.address;
          
          // More flexible prioritization
          const hasDetailedAddress = addr.house_number && addr.road;
          const hasPostalCode = this.isValidCanadianPostalCode(addr.postcode);
          const hasBasicLocation = addr.road;
          
          // If has complete postal code, accept addresses even without house numbers if postal matches
          if (hasCompletePostalCode) {
            const queryPostalPattern = query.match(/([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)/);
            if (queryPostalPattern) {
              const expectedPostal = queryPostalPattern[0].replace(/\s/g, '').toUpperCase();
              const resultPostal = addr.postcode ? addr.postcode.replace(/\s/g, '').toUpperCase() : '';
              
              // Accept if postal code matches (exact or significant overlap)
              if (resultPostal && expectedPostal && resultPostal.includes(expectedPostal.slice(0, 3))) {
                return true;
              }
            }
          }
          
          // Prefer addresses with house numbers
          return hasDetailedAddress || (hasBasicLocation && hasPostalCode);
        })
        .map((item: any) => {
          const addr = item.address;
          
          // Build professional Canadian address format
          const parts = [];
          
          // Street address with house number and road name
          if (addr.house_number && addr.road) {
            parts.push(`${addr.house_number} ${addr.road}`);
          } else if (addr.road) {
            parts.push(addr.road);
          }
          
          // City or town name
          const city = addr.city || addr.town || addr.municipality || addr.village || addr.hamlet;
          if (city && city.trim()) {
            parts.push(city.trim());
          }
          
          // Provincial abbreviation
          const province = this.normalizeCanadianProvince(addr.state || addr.state_district || addr.province);
          if (province && province.trim()) {
            parts.push(province.trim());
          }
          
          // Canadian postal code - handle with better formatting
          let postalCode = addr.postcode;
          if (postalCode && this.isValidCanadianPostalCode(postalCode)) {
            // Clean up postal code formatting
            const cleanPostalCode = postalCode.replace(/\s/g, '').toUpperCase();
            const formattedPostalCode = cleanPostalCode.slice(0, 3) + ' ' + cleanPostalCode.slice(3);
            parts.push(formattedPostalCode);
          }

          // Create clean, professional display
          const displayText = parts.join(", ");
          
          return {
            place_name: item.display_name,
            id: item.place_id.toString(),
            center: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number],
            context: [],
            text: displayText
          };
        })
        .sort((a, b) => {
          // Enhanced sorting with postal code priority
          const aHasPostalCode = /[A-Z]\d[A-Z]\s\d[A-Z]\d/.test(a.text);
          const bHasPostalCode = /[A-Z]\d[A-Z]\s\d[A-Z]\d/.test(b.text);
          
          // Check if user input contains postal code
          const userPostalPattern = query.match(/([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)/);
          if (userPostalPattern) {
            const userPostal = userPostalPattern[0].replace(/\s/g, '').toUpperCase();
            const aPostalMatch = a.text.toUpperCase().includes(userPostal);
            const bPostalMatch = b.text.toUpperCase().includes(userPostal);
            
            if (aPostalMatch && !bPostalMatch) return -1;
            if (!aPostalMatch && bPostalMatch) return 1;
          }
          
          // Then prioritize complete addresses with postal codes
          if (aHasPostalCode && !bHasPostalCode) return -1;
          if (!aHasPostalCode && bHasPostalCode) return 1;
          
          // Then by completeness of address info
          const aIsComplete = a.text.includes(',') && a.text.split(',').length >= 3;
          const bIsComplete = b.text.includes(',') && b.text.split(',').length >= 3;
          
          if (aIsComplete && !bIsComplete) return -1;
          if (!aIsComplete && bIsComplete) return 1;
          
          return a.text.localeCompare(b.text);
        });
    } catch (error) {
      console.error("Address search error:", error);
      return [];
    }
  }

  // Get detailed address information for a selected address
  async getAddressDetails(suggestion: AddressSuggestion): Promise<AddressDetails> {
    try {
      // Using reverse geocoding for more accurate details
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      const [lng, lat] = suggestion.center;
      url.searchParams.set("lat", lat.toString());
      url.searchParams.set("lon", lng.toString());
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "RoomieAI/1.0",
        },
        mode: "cors", // Ensure CORS handling
      });

      if (!response.ok) {
        throw new Error(`Failed to get address details: ${response.statusText}`);
      }

      const data = await response.json();
      const address = data.address;

      // Improved Canadian address parsing
      const streetNumber = address?.house_number;
      const streetName = address?.road;
      const fullAddress = streetNumber && streetName 
        ? `${streetNumber} ${streetName}` 
        : (streetName || suggestion.text.split(",")[0].trim());

      const city = address?.city || address?.town || address?.municipality || address?.village || "";
      const province = this.normalizeCanadianProvince(
        address?.state || address?.province || address?.state_district || ""
      );
      const postalCode = address?.postcode || "";
      const neighborhood = address?.suburb || address?.neighbourhood || address?.district || "";

      // Enhanced postal code formatting
      let formattedPostalCode = postalCode;
      if (this.isValidCanadianPostalCode(postalCode)) {
        const cleanPostal = postalCode.replace(/\s/g, '').toUpperCase();
        formattedPostalCode = cleanPostal.slice(0, 3) + ' ' + cleanPostal.slice(3);
      }

      return {
        address: fullAddress,
        city: city.trim(),
        state: province.trim(),
        zipCode: formattedPostalCode.trim(),
        neighborhood: neighborhood.trim(),
        coordinates: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon)
        },
        place_name: suggestion.place_name
      };
    } catch (error) {
      console.error("Address details error:", error);
      // Enhanced fallback with postal code extraction
      const suggestionParts = suggestion.text.split(',');
      let fallbackPostalCode = '';
      
      // Try to extract postal code from suggestion text
      for (const part of suggestionParts) {
        const trimmed = part.trim();
        if (this.isValidCanadianPostalCode(trimmed)) {
          const cleanPostal = trimmed.replace(/\s/g, '').toUpperCase();
          fallbackPostalCode = cleanPostal.slice(0, 3) + ' ' + cleanPostal.slice(3);
          break;
        }
      }
      
      return {
        address: suggestion.text.split(",")[0].trim(),
        city: suggestionParts[1]?.trim() || "",
        state: suggestionParts[2]?.trim() || "",
        zipCode: fallbackPostalCode,
        neighborhood: "",
        coordinates: {
          lat: suggestion.center[1],
          lng: suggestion.center[0]
        },
        place_name: suggestion.place_name
      };
    }
  }
}

// Create singleton instance  
export const locationService = new LocationService();