import mapboxgl from 'mapbox-gl';
import { Property } from '@/services/propertyService';

export interface Amenity {
  id: string;
  name: string;
  type: 'school' | 'transit' | 'restaurant' | 'park' | 'hospital' | 'shopping' | 'coffee' | 'gym';
  coordinates: [number, number];
  distance: number; // meters
  address?: string;
}

// Amenity type to emoji mapping
const amenityEmojis: Record<Amenity['type'], string> = {
  school: '🎓',
  transit: '🚇',
  restaurant: '🍽️',
  park: '🌳',
  hospital: '🏥',
  shopping: '🛍️',
  coffee: '☕',
  gym: '💪',
};

// Amenity type to color mapping
const amenityColors: Record<Amenity['type'], string> = {
  school: '#3B82F6',
  transit: '#EF4444',
  restaurant: '#F97316',
  park: '#22C55E',
  hospital: '#EF4444',
  shopping: '#A855F7',
  coffee: '#92400E',
  gym: '#F97316',
};

export const AmenityMarkers = {
  // Convert nearby_amenities string array to Amenity objects
  parseAmenities: (amenityStrings: string[], propertyLat: number, propertyLng: number): Amenity[] => {
    // Parse amenity strings (format: "Name (Type) - Distance")
    return amenityStrings.slice(0, 15).map((str, idx) => {
      const match = str.match(/^(.+?)\s*\((\w+)\)\s*-\s*(.+)$/);
      const name = match ? match[1] : str;
      const type = (match ? match[2].toLowerCase() : 'shopping') as Amenity['type'];
      const distance = match ? parseInt(match[3]) : 0;

      // Generate approximate coordinates (offset from property)
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;

      return {
        id: `amenity-${idx}`,
        name,
        type,
        coordinates: [propertyLng + offsetLng, propertyLat + offsetLat],
        distance,
        address: str,
      };
    });
  },

  // Add amenity markers to map
  addToMap: (map: mapboxgl.Map, amenities: Amenity[]): mapboxgl.Marker[] => {
    const markers: mapboxgl.Marker[] = [];

    amenities.forEach((amenity) => {
      const el = document.createElement('div');
      el.className = 'amenity-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${amenityColors[amenity.type]};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          border: 2px solid white;
        ">
          ${amenityEmojis[amenity.type]}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2 max-w-xs">
          <h4 class="font-semibold text-sm text-gray-900">${amenity.name}</h4>
          <p class="text-xs text-gray-600 capitalize">${amenity.type}</p>
          ${amenity.distance ? `<p class="text-xs text-gray-500 mt-1">${(amenity.distance / 1000).toFixed(1)} km away</p>` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(amenity.coordinates)
        .setPopup(popup)
        .addTo(map);

      markers.push(marker);
    });

    return markers;
  },

  // Remove amenity markers from map
  removeFromMap: (markers: mapboxgl.Marker[]) => {
    markers.forEach((marker) => marker.remove());
  },

  // Get amenity type color
  getColor: (type: Amenity['type']): string => {
    return amenityColors[type];
  },

  // Get amenity type emoji
  getEmoji: (type: Amenity['type']): string => {
    return amenityEmojis[type];
  },
};
