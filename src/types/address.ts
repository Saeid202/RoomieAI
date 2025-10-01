// Address suggestion typing for enhanced property forms
export interface AddressSuggestion {
  place_name: string;
  id: string;
  center: [number, number]; // [lng, lat]
  context: AddressContext[];
  text?: string;
}

export interface AddressContext {
  id: string;
  place_type: string[];
  text: string;
}

export interface AddressDetails {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  place_name: string;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
  zoom?: number;
}
