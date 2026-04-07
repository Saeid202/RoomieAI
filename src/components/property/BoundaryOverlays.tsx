import mapboxgl from 'mapbox-gl';
import { GeoJSON } from '@/types/geojson';

export interface BoundaryFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: GeoJSON.Position[][];
  };
  properties: {
    name: string;
    type: 'neighborhood' | 'property_lot';
    area?: number; // sq ft
  };
}

export const BoundaryOverlays = {
  // Add neighborhood boundary to map
  addNeighborhoodBoundary: (
    map: mapboxgl.Map,
    boundary: BoundaryFeature,
    sourceId: string = 'neighborhood-boundary'
  ): void => {
    // Remove existing source if it exists
    if (map.getSource(sourceId)) {
      map.removeLayer(`${sourceId}-fill`);
      map.removeLayer(`${sourceId}-line`);
      map.removeSource(sourceId);
    }

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: boundary,
    });

    // Add fill layer
    map.addLayer({
      id: `${sourceId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#7C3AED',
        'fill-opacity': 0.1,
      },
    });

    // Add line layer
    map.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#7C3AED',
        'line-width': 2,
      },
    });

    // Add label
    const coordinates = boundary.geometry.coordinates[0];
    const center = BoundaryOverlays.calculatePolygonCenter(coordinates);

    map.addSource(`${sourceId}-label`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center,
        },
        properties: {
          name: boundary.properties.name,
        },
      },
    });

    map.addLayer({
      id: `${sourceId}-label`,
      type: 'symbol',
      source: `${sourceId}-label`,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      },
      paint: {
        'text-color': '#7C3AED',
        'text-halo-color': '#fff',
        'text-halo-width': 1,
      },
    });
  },

  // Add property boundary to map
  addPropertyBoundary: (
    map: mapboxgl.Map,
    boundary: BoundaryFeature,
    sourceId: string = 'property-boundary'
  ): void => {
    // Remove existing source if it exists
    if (map.getSource(sourceId)) {
      map.removeLayer(`${sourceId}-line`);
      map.removeSource(sourceId);
    }

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: boundary,
    });

    // Add line layer (dashed)
    map.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#7C3AED',
        'line-width': 3,
        'line-dasharray': [2, 2],
      },
    });

    // Add label
    const coordinates = boundary.geometry.coordinates[0];
    const center = BoundaryOverlays.calculatePolygonCenter(coordinates);

    map.addSource(`${sourceId}-label`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center,
        },
        properties: {
          name: 'Property Lot',
          area: boundary.properties.area,
        },
      },
    });

    map.addLayer({
      id: `${sourceId}-label`,
      type: 'symbol',
      source: `${sourceId}-label`,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      },
      paint: {
        'text-color': '#7C3AED',
        'text-halo-color': '#fff',
        'text-halo-width': 1,
      },
    });
  },

  // Remove boundary from map
  removeBoundary: (map: mapboxgl.Map, sourceId: string): void => {
    if (map.getLayer(`${sourceId}-fill`)) {
      map.removeLayer(`${sourceId}-fill`);
    }
    if (map.getLayer(`${sourceId}-line`)) {
      map.removeLayer(`${sourceId}-line`);
    }
    if (map.getLayer(`${sourceId}-label`)) {
      map.removeLayer(`${sourceId}-label`);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    if (map.getSource(`${sourceId}-label`)) {
      map.removeSource(`${sourceId}-label`);
    }
  },

  // Toggle boundary visibility
  toggleBoundary: (map: mapboxgl.Map, sourceId: string, visible: boolean): void => {
    const fillLayerId = `${sourceId}-fill`;
    const lineLayerId = `${sourceId}-line`;
    const labelLayerId = `${sourceId}-label`;

    if (map.getLayer(fillLayerId)) {
      map.setLayoutProperty(fillLayerId, 'visibility', visible ? 'visible' : 'none');
    }
    if (map.getLayer(lineLayerId)) {
      map.setLayoutProperty(lineLayerId, 'visibility', visible ? 'visible' : 'none');
    }
    if (map.getLayer(labelLayerId)) {
      map.setLayoutProperty(labelLayerId, 'visibility', visible ? 'visible' : 'none');
    }
  },

  // Calculate polygon center (centroid)
  calculatePolygonCenter: (coordinates: GeoJSON.Position[]): GeoJSON.Position => {
    let x = 0;
    let y = 0;
    let count = 0;

    coordinates.forEach(([lng, lat]) => {
      x += lng;
      y += lat;
      count++;
    });

    return [x / count, y / count];
  },

  // Create mock neighborhood boundary (for testing)
  createMockNeighborhoodBoundary: (centerLng: number, centerLat: number): BoundaryFeature => {
    const offset = 0.01; // ~1km
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [centerLng - offset, centerLat - offset],
            [centerLng + offset, centerLat - offset],
            [centerLng + offset, centerLat + offset],
            [centerLng - offset, centerLat + offset],
            [centerLng - offset, centerLat - offset],
          ],
        ],
      },
      properties: {
        name: 'Neighborhood',
        type: 'neighborhood',
      },
    };
  },

  // Create mock property boundary (for testing)
  createMockPropertyBoundary: (centerLng: number, centerLat: number): BoundaryFeature => {
    const offset = 0.002; // ~200m
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [centerLng - offset, centerLat - offset],
            [centerLng + offset, centerLat - offset],
            [centerLng + offset, centerLat + offset],
            [centerLng - offset, centerLat + offset],
            [centerLng - offset, centerLat - offset],
          ],
        ],
      },
      properties: {
        name: 'Property Lot',
        type: 'property_lot',
        area: 5000, // sq ft
      },
    };
  },
};
