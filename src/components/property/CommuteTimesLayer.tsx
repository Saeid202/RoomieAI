import mapboxgl from 'mapbox-gl';
import { fetchIsochrone } from '@/services/mapboxService';
import { GeoJSON } from '@/types/geojson';

export interface IsochroneData {
  walking?: {
    [key: number]: GeoJSON.Polygon;
  };
  transit?: {
    [key: number]: GeoJSON.Polygon;
  };
}

export const CommuteTimesLayer = {
  // Fetch isochrone data from Mapbox API
  fetchCommuteData: async (
    lng: number,
    lat: number,
    profile: 'walking' | 'cycling' | 'driving' = 'walking'
  ): Promise<GeoJSON.FeatureCollection | null> => {
    return fetchIsochrone(lng, lat, profile);
  },

  // Add walking time isochrones to map
  addWalkingTimes: (
    map: mapboxgl.Map,
    data: GeoJSON.FeatureCollection,
    sourceId: string = 'walking-isochrone'
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
      data,
    });

    // Add fill layer with gradient
    map.addLayer({
      id: `${sourceId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'contour'],
          5,
          '#86EFAC',
          10,
          '#4ADE80',
          15,
          '#22C55E',
          20,
          '#16A34A',
        ],
        'fill-opacity': 0.15,
      },
    });

    // Add line layer
    map.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'contour'],
          5,
          '#86EFAC',
          10,
          '#4ADE80',
          15,
          '#22C55E',
          20,
          '#16A34A',
        ],
        'line-width': 1,
        'line-opacity': 0.5,
      },
    });
  },

  // Add transit time isochrones to map
  addTransitTimes: (
    map: mapboxgl.Map,
    data: GeoJSON.FeatureCollection,
    sourceId: string = 'transit-isochrone'
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
      data,
    });

    // Add fill layer with gradient
    map.addLayer({
      id: `${sourceId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'contour'],
          10,
          '#93C5FD',
          20,
          '#3B82F6',
          30,
          '#1D4ED8',
        ],
        'fill-opacity': 0.15,
      },
    });

    // Add line layer
    map.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'contour'],
          10,
          '#93C5FD',
          20,
          '#3B82F6',
          30,
          '#1D4ED8',
        ],
        'line-width': 1,
        'line-opacity': 0.5,
      },
    });
  },

  // Remove commute layer from map
  removeLayer: (map: mapboxgl.Map, sourceId: string): void => {
    if (map.getLayer(`${sourceId}-fill`)) {
      map.removeLayer(`${sourceId}-fill`);
    }
    if (map.getLayer(`${sourceId}-line`)) {
      map.removeLayer(`${sourceId}-line`);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  },

  // Toggle commute layer visibility
  toggleLayer: (map: mapboxgl.Map, sourceId: string, visible: boolean): void => {
    const fillLayerId = `${sourceId}-fill`;
    const lineLayerId = `${sourceId}-line`;

    if (map.getLayer(fillLayerId)) {
      map.setLayoutProperty(fillLayerId, 'visibility', visible ? 'visible' : 'none');
    }
    if (map.getLayer(lineLayerId)) {
      map.setLayoutProperty(lineLayerId, 'visibility', visible ? 'visible' : 'none');
    }
  },

  // Create mock isochrone data (for testing)
  createMockIsochrone: (centerLng: number, centerLat: number): GeoJSON.FeatureCollection => {
    const createCircle = (radius: number, contour: number): GeoJSON.Feature => {
      const points: GeoJSON.Position[] = [];
      for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = centerLng + radius * Math.cos(angle);
        const y = centerLat + radius * Math.sin(angle);
        points.push([x, y]);
      }
      points.push(points[0]); // Close the circle

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [points],
        },
        properties: {
          contour,
        },
      };
    };

    return {
      type: 'FeatureCollection',
      features: [
        createCircle(0.002, 5),
        createCircle(0.004, 10),
        createCircle(0.006, 15),
        createCircle(0.008, 20),
      ],
    };
  },
};
