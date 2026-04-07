import { useState } from 'react';
import { ZoomIn, ZoomOut, Map, Satellite, Navigation, Search, Circle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';

interface MapControlsProps {
  map: mapboxgl.Map | null;
  viewMode: 'map' | 'satellite' | 'street';
  onViewModeChange: (mode: 'map' | 'satellite' | 'street') => void;
  onSearchClick: () => void;
  onRadiusToolClick: () => void;
  onDirectionsClick: () => void;
  onStreetViewClick: () => void;
  isMobile: boolean;
}

export const MapControls = ({
  map,
  viewMode,
  onViewModeChange,
  onSearchClick,
  onRadiusToolClick,
  onDirectionsClick,
  onStreetViewClick,
  isMobile,
}: MapControlsProps) => {
  const handleZoomIn = () => {
    if (map) {
      map.zoomTo(map.getZoom() + 1, { duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomTo(map.getZoom() - 1, { duration: 300 });
    }
  };

  const handleViewModeChange = (mode: 'map' | 'satellite' | 'street') => {
    if (map) {
      const styles: Record<string, string> = {
        map: 'mapbox://styles/mapbox/streets-v12',
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        street: 'mapbox://styles/mapbox/streets-v12', // Street view handled separately
      };
      map.setStyle(styles[mode]);
      onViewModeChange(mode);
    }
  };

  const controlsClass = isMobile
    ? 'flex gap-2 flex-wrap'
    : 'flex flex-col gap-2';

  const buttonClass = isMobile ? 'h-10 w-10' : 'h-10 w-10';

  return (
    <div className={`flex ${controlsClass} p-2 bg-white rounded-lg shadow-md`}>
      {/* Zoom Controls */}
      <div className={isMobile ? 'flex gap-1' : 'flex flex-col gap-1'}>
        <Button
          variant="outline"
          size="icon"
          className={buttonClass}
          onClick={handleZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={buttonClass}
          onClick={handleZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className={isMobile ? 'flex gap-1' : 'flex flex-col gap-1'}>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          size="icon"
          className={buttonClass}
          onClick={() => handleViewModeChange('map')}
          title="Map view"
          aria-label="Map view"
        >
          <Map className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'satellite' ? 'default' : 'outline'}
          size="icon"
          className={buttonClass}
          onClick={() => handleViewModeChange('satellite')}
          title="Satellite view"
          aria-label="Satellite view"
        >
          <Satellite className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Button */}
      <Button
        variant="outline"
        size="icon"
        className={buttonClass}
        onClick={onSearchClick}
        title="Search locations"
        aria-label="Search locations"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Radius Tool Button */}
      <Button
        variant="outline"
        size="icon"
        className={buttonClass}
        onClick={onRadiusToolClick}
        title="Radius tool"
        aria-label="Radius tool"
      >
        <Circle className="h-4 w-4" />
      </Button>

      {/* Directions Button */}
      <Button
        variant="outline"
        size="icon"
        className={buttonClass}
        onClick={onDirectionsClick}
        title="Get directions"
        aria-label="Get directions"
      >
        <Navigation className="h-4 w-4" />
      </Button>

      {/* Street View Button */}
      <Button
        variant="outline"
        size="icon"
        className={buttonClass}
        onClick={onStreetViewClick}
        title="Street view"
        aria-label="Street view"
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  );
};
