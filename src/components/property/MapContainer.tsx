import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/services/propertyService';
import { createMapInstance, geocodeAddress } from '@/services/mapboxService';
import {
  validateCoordinates,
  classifyError,
  retryWithBackoff,
  validatePropertyData,
  logMapError,
  formatErrorForDisplay,
  MapError,
} from '@/services/mapErrorHandlingService';
import { PropertyMarker } from './PropertyMarker';
import { AmenityMarkers, Amenity } from './AmenityMarkers';
import { BoundaryOverlays } from './BoundaryOverlays';
import { CommuteTimesLayer } from './CommuteTimesLayer';
import { MapControls } from './MapControls';
import { SearchBox } from './SearchBox';
import { RadiusTool } from './RadiusTool';
import { StreetViewModal } from './StreetViewModal';
import { DirectionsButton } from './DirectionsButton';
import { MapErrorDisplay } from './MapErrorDisplay';

interface MapContainerProps {
  property: Property;
  isMobile: boolean;
}

export const MapContainer = ({ property, isMobile }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const amenityMarkers = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MapError | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showNeighborhoodBoundary, setShowNeighborhoodBoundary] = useState(true);
  const [showPropertyBoundary, setShowPropertyBoundary] = useState(true);
  const [showWalkingTimes, setShowWalkingTimes] = useState(false);
  const [showTransitTimes, setShowTransitTimes] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'satellite' | 'street'>('map');
  const [showSearch, setShowSearch] = useState(false);
  const [radiusToolActive, setRadiusToolActive] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [radiusData, setRadiusData] = useState<{ radius: number; amenities: number } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize map and fetch coordinates
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate property data
        const validation = validatePropertyData(property);
        if (!validation.valid) {
          throw new Error(`Invalid property data: ${validation.errors.join(', ')}`);
        }

        // Get coordinates from property or geocode address
        let coords = coordinates;
        if (!coords) {
          const address = `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`;
          
          // Retry geocoding with backoff
          coords = await retryWithBackoff(
            () => geocodeAddress(address),
            { maxAttempts: 3, delayMs: 500 },
            'Geocoding'
          );

          if (!coords) {
            throw new Error('Unable to locate property on map');
          }

          // Validate coordinates
          if (!validateCoordinates(coords.lat, coords.lng)) {
            throw new Error('Invalid coordinates returned from geocoding');
          }

          setCoordinates(coords);
        }

        // Create map instance
        if (mapContainer.current && !map.current) {
          map.current = createMapInstance(mapContainer.current, {
            center: [coords.lng, coords.lat],
            zoom: 15,
          });

          // Add property marker
          new mapboxgl.Marker({ color: '#7C3AED' })
            .setLngLat([coords.lng, coords.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2">
                  <h3 class="font-semibold text-sm">${property.listing_title || property.address}</h3>
                  <p class="text-xs text-gray-600">${property.city}, ${property.state}</p>
                </div>`
              )
            )
            .addTo(map.current);

          // Parse and add amenity markers (with error handling)
          try {
            if (property.nearby_amenities && property.nearby_amenities.length > 0) {
              const parsedAmenities = AmenityMarkers.parseAmenities(
                property.nearby_amenities,
                coords.lat,
                coords.lng
              );
              setAmenities(parsedAmenities);
              const markers = AmenityMarkers.addToMap(map.current, parsedAmenities);
              amenityMarkers.current = markers;
            }
          } catch (amenityErr) {
            console.warn('Failed to load amenities:', amenityErr);
            // Continue without amenities - graceful degradation
          }

          // Add neighborhood boundary (with error handling)
          try {
            const neighborhoodBoundary = BoundaryOverlays.createMockNeighborhoodBoundary(
              coords.lng,
              coords.lat
            );
            BoundaryOverlays.addNeighborhoodBoundary(map.current, neighborhoodBoundary);
          } catch (boundaryErr) {
            console.warn('Failed to load neighborhood boundary:', boundaryErr);
          }

          // Add property boundary (with error handling)
          try {
            const propertyBoundary = BoundaryOverlays.createMockPropertyBoundary(
              coords.lng,
              coords.lat
            );
            BoundaryOverlays.addPropertyBoundary(map.current, propertyBoundary);
          } catch (boundaryErr) {
            console.warn('Failed to load property boundary:', boundaryErr);
          }

          // Add mock commute times (walking)
          try {
            const mockWalkingData = CommuteTimesLayer.createMockIsochrone(coords.lng, coords.lat);
            CommuteTimesLayer.addWalkingTimes(map.current, mockWalkingData);
            CommuteTimesLayer.toggleLayer(map.current, 'walking-isochrone', false);
          } catch (commuteErr) {
            console.warn('Failed to load walking times:', commuteErr);
          }

          // Add mock commute times (transit)
          try {
            const mockTransitData = CommuteTimesLayer.createMockIsochrone(coords.lng, coords.lat);
            CommuteTimesLayer.addTransitTimes(map.current, mockTransitData);
            CommuteTimesLayer.toggleLayer(map.current, 'transit-isochrone', false);
          } catch (commuteErr) {
            console.warn('Failed to load transit times:', commuteErr);
          }

          // Handle map load - set loading to false after a short delay
          const handleMapLoad = () => {
            setLoading(false);
          };

          // If map is already loaded, set loading to false immediately
          if (map.current.loaded()) {
            setLoading(false);
          } else {
            map.current.on('load', handleMapLoad);
          }

          // Timeout fallback - if map doesn't load in 5 seconds, force it
          const timeoutId = setTimeout(() => {
            if (loading) {
              console.warn('Map load timeout - forcing completion');
              setLoading(false);
            }
          }, 5000);

          // Handle map errors
          map.current.on('error', (e) => {
            clearTimeout(timeoutId);
            const mapError = classifyError(e, 'Mapbox GL JS');
            logMapError(mapError);
            setError(mapError);
          });

          return () => {
            clearTimeout(timeoutId);
            if (map.current) {
              map.current.off('load', handleMapLoad);
            }
          };
        }
      } catch (err) {
        const mapError = classifyError(err, 'Map initialization');
        logMapError(mapError);
        setError(mapError);
        setLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [property, coordinates, retryCount]);

  // Handle amenity visibility toggle
  useEffect(() => {
    if (!map.current) return;
    amenityMarkers.current.forEach((marker) => {
      marker.getElement().style.display = showAmenities ? 'block' : 'none';
    });
  }, [showAmenities]);

  // Handle neighborhood boundary visibility toggle
  useEffect(() => {
    if (!map.current) return;
    BoundaryOverlays.toggleBoundary(map.current, 'neighborhood-boundary', showNeighborhoodBoundary);
  }, [showNeighborhoodBoundary]);

  // Handle property boundary visibility toggle
  useEffect(() => {
    if (!map.current) return;
    BoundaryOverlays.toggleBoundary(map.current, 'property-boundary', showPropertyBoundary);
  }, [showPropertyBoundary]);

  // Handle walking times visibility toggle
  useEffect(() => {
    if (!map.current) return;
    CommuteTimesLayer.toggleLayer(map.current, 'walking-isochrone', showWalkingTimes);
  }, [showWalkingTimes]);

  // Handle transit times visibility toggle
  useEffect(() => {
    if (!map.current) return;
    CommuteTimesLayer.toggleLayer(map.current, 'transit-isochrone', showTransitTimes);
  }, [showTransitTimes]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <MapErrorDisplay
            error={error}
            onRetry={() => {
              setError(null);
              setRetryCount((prev) => prev + 1);
            }}
            onDismiss={() => setError(null)}
          />
        </div>
      </div>
    );
  }

  const handleDirections = () => {
    if (coordinates) {
      const { handleGetDirections } = DirectionsButton({
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: `${property.address}, ${property.city}, ${property.state}`,
      });
      handleGetDirections();
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="flex-1 bg-gray-100 relative"
        style={{ minHeight: isMobile ? '100%' : '400px' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Controls */}
        {!loading && map.current && (
          <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} z-20`}>
            <MapControls
              map={map.current}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSearchClick={() => setShowSearch(!showSearch)}
              onRadiusToolClick={() => setRadiusToolActive(!radiusToolActive)}
              onDirectionsClick={handleDirections}
              onStreetViewClick={() => setShowStreetView(true)}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Search Box */}
        {coordinates && (
          <SearchBox
            map={map.current}
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
            propertyLng={coordinates.lng}
            propertyLat={coordinates.lat}
          />
        )}

        {/* Radius Tool */}
        {coordinates && (
          <RadiusTool
            map={map.current}
            isActive={radiusToolActive}
            onRadiusChange={(radius, amenities) => {
              setRadiusData({ radius, amenities });
            }}
          />
        )}

        {/* Street View Modal */}
        {coordinates && (
          <StreetViewModal
            isOpen={showStreetView}
            onClose={() => setShowStreetView(false)}
            lat={coordinates.lat}
            lng={coordinates.lng}
            address={`${property.address}, ${property.city}, ${property.state}`}
          />
        )}
      </div>

      {/* Map Controls Panel */}
      <div className="bg-white border-t p-4 space-y-3 max-h-48 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Map Layers</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAmenities}
                onChange={(e) => setShowAmenities(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Nearby Amenities ({amenities.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showNeighborhoodBoundary}
                onChange={(e) => setShowNeighborhoodBoundary(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Neighborhood Boundary</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPropertyBoundary}
                onChange={(e) => setShowPropertyBoundary(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Property Boundary</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWalkingTimes}
                onChange={(e) => setShowWalkingTimes(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Walking Times</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTransitTimes}
                onChange={(e) => setShowTransitTimes(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Transit Times</span>
            </label>
            {radiusToolActive && radiusData && (
              <div className="text-sm text-gray-600 mt-2 p-2 bg-purple-50 rounded">
                <p>Radius: {(radiusData.radius / 1000).toFixed(2)} km</p>
                <p>Amenities inside: {radiusData.amenities}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
