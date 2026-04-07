import mapboxgl from 'mapbox-gl';

interface PropertyMarkerProps {
  map: mapboxgl.Map;
  lng: number;
  lat: number;
  title: string;
  address: string;
  city: string;
  state: string;
  price?: number | string;
  bedrooms?: number;
  bathrooms?: number;
}

export const PropertyMarker = ({
  map,
  lng,
  lat,
  title,
  address,
  city,
  state,
  price,
  bedrooms,
  bathrooms,
}: PropertyMarkerProps) => {
  // Create custom marker element
  const el = document.createElement('div');
  el.className = 'property-marker';
  el.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2C11.7 2 5 8.7 5 17c0 8 15 21 15 21s15-13 15-21c0-8.3-6.7-15-15-15z" fill="#7C3AED"/>
      <path d="M20 22c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="white"/>
    </svg>
  `;
  el.style.cursor = 'pointer';
  el.style.width = '40px';
  el.style.height = '40px';

  // Create popup
  const popupContent = `
    <div class="p-3 max-w-xs">
      <h3 class="font-semibold text-sm text-gray-900 mb-1">${title}</h3>
      <p class="text-xs text-gray-600 mb-2">${address}, ${city}, ${state}</p>
      ${price ? `<p class="text-sm font-bold text-purple-600 mb-2">$${price}</p>` : ''}
      <div class="flex gap-2 text-xs">
        ${bedrooms !== undefined ? `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded">${bedrooms} bd</span>` : ''}
        ${bathrooms !== undefined ? `<span class="bg-green-50 text-green-700 px-2 py-1 rounded">${bathrooms} ba</span>` : ''}
      </div>
    </div>
  `;

  const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

  // Create and add marker
  const marker = new mapboxgl.Marker({ element: el })
    .setLngLat([lng, lat])
    .setPopup(popup)
    .addTo(map);

  return marker;
};
