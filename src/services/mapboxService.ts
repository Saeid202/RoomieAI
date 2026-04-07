import mapboxgl from 'mapbox-gl';

// Initialize Mapbox token
export const initializeMapbox = () => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN;
  if (!token) {
    console.error('Mapbox token not configured. Add VITE_MAPBOX_TOKEN to .env.local');
    return false;
  }
  mapboxgl.accessToken = token;
  return true;
};

// Create a new Mapbox instance
export const createMapInstance = (
  container: HTMLElement,
  options: Partial<mapboxgl.MapboxOptions> = {}
): mapboxgl.Map => {
  const defaultOptions: mapboxgl.MapboxOptions = {
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-79.3871, 43.6629], // Default to Toronto
    zoom: 15,
    pitch: 0,
    bearing: 0,
    antialias: true,
  };

  return new mapboxgl.Map({ ...defaultOptions, ...options });
};

// Geocode an address using Mapbox Geocoding API
export const geocodeAddress = async (
  address: string,
  proximity?: [number, number]
): Promise<{ lat: number; lng: number } | null> => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const query = encodeURIComponent(address);
    const proximityParam = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : '';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=ca${proximityParam}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Fetch isochrone data (commute times)
export const fetchIsochrone = async (
  lng: number,
  lat: number,
  profile: 'walking' | 'cycling' | 'driving' = 'walking',
  contours: number[] = [5, 10, 15, 20]
): Promise<GeoJSON.FeatureCollection | null> => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const contoursParam = contours.join(',');
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}?contours_minutes=${contoursParam}&polygons=true&access_token=${token}`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Isochrone fetch error:', error);
    return null;
  }
};

// Generate Google Maps directions URL
export const generateDirectionsUrl = (lat: number, lng: number): string => {
  return `https://maps.google.com/?daddr=${lat},${lng}`;
};

// Generate Google Street View URL
export const generateStreetViewUrl = (lat: number, lng: number): string => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s0x0:0x0!2e0!7i13312!8i6656`;
  }
  return `https://maps.googleapis.com/maps/api/streetview?location=${lat},${lng}&key=${apiKey}&size=640x480`;
};

// Calculate distance between two coordinates (in miles)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
