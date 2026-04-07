import { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { GeoJSON } from '@/types/geojson';

interface RadiusToolProps {
  map: mapboxgl.Map | null;
  isActive: boolean;
  onRadiusChange: (radiusMeters: number, amenitiesInside: number) => void;
}

export const RadiusTool = ({ map, isActive, onRadiusChange }: RadiusToolProps) => {
  const [radius, setRadius] = useState<number | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const circleMarker = useRef<mapboxgl.Marker | null>(null);
  const circleSource = useRef<string>('radius-circle');
  const isDrawing = useRef(false);
  const startPoint = useRef<[number, number] | null>(null);

  // Create circle GeoJSON
  const createCircle = (centerLng: number, centerLat: number, radiusMeters: number): GeoJSON.Feature => {
    const points: GeoJSON.Position[] = [];
    const steps = 64;

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      // Convert meters to degrees (approximate)
      const radiusDegrees = radiusMeters / 111000;
      const x = centerLng + radiusDegrees * Math.cos(angle);
      const y = centerLat + radiusDegrees * Math.sin(angle);
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
        radius: radiusMeters,
      },
    };
  };

  // Initialize radius tool
  useEffect(() => {
    if (!map || !isActive) return;

    const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
      isDrawing.current = true;
      startPoint.current = [e.lngLat.lng, e.lngLat.lat];
      setCenter([e.lngLat.lng, e.lngLat.lat]);
    };

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing.current || !startPoint.current) return;

      const [startLng, startLat] = startPoint.current;
      const endLng = e.lngLat.lng;
      const endLat = e.lngLat.lat;

      // Calculate distance in meters
      const R = 6371000; // Earth's radius in meters
      const dLat = ((endLat - startLat) * Math.PI) / 180;
      const dLng = ((endLng - startLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startLat * Math.PI) / 180) *
          Math.cos((endLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const radiusMeters = R * c;

      // Constrain radius (0.1 km to 5 km)
      const constrainedRadius = Math.max(100, Math.min(5000, radiusMeters));
      setRadius(constrainedRadius);

      // Update circle on map
      if (map.getSource(circleSource.current)) {
        const circle = createCircle(startLng, startLat, constrainedRadius);
        (map.getSource(circleSource.current) as mapboxgl.GeoJSONSource).setData(circle);
      }

      // Update marker position
      if (circleMarker.current) {
        circleMarker.current.setLngLat([startLng, startLat]);
      }

      onRadiusChange(constrainedRadius, 0); // TODO: Calculate amenities inside
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
    };

    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);

    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
    };
  }, [map, isActive, onRadiusChange]);

  // Add circle layer to map
  useEffect(() => {
    if (!map || !isActive) return;

    // Add source if it doesn't exist
    if (!map.getSource(circleSource.current)) {
      map.addSource(circleSource.current, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]],
          },
          properties: {},
        },
      });

      // Add fill layer
      map.addLayer({
        id: `${circleSource.current}-fill`,
        type: 'fill',
        source: circleSource.current,
        paint: {
          'fill-color': '#7C3AED',
          'fill-opacity': 0.1,
        },
      });

      // Add line layer
      map.addLayer({
        id: `${circleSource.current}-line`,
        type: 'line',
        source: circleSource.current,
        paint: {
          'line-color': '#7C3AED',
          'line-width': 2,
        },
      });
    }

    return () => {
      if (map.getLayer(`${circleSource.current}-fill`)) {
        map.removeLayer(`${circleSource.current}-fill`);
      }
      if (map.getLayer(`${circleSource.current}-line`)) {
        map.removeLayer(`${circleSource.current}-line`);
      }
      if (map.getSource(circleSource.current)) {
        map.removeSource(circleSource.current);
      }
    };
  }, [map, isActive]);

  return null; // This component doesn't render anything visible
};
