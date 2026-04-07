import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Property } from '@/services/propertyService';
import { initializeMapbox } from '@/services/mapboxService';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { MapErrorBoundary } from './MapErrorBoundary';

// Lazy load MapContainer to defer Mapbox GL JS bundle
const MapContainer = lazy(() => import('./MapContainer').then(m => ({ default: m.MapContainer })));

interface PropertyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export const PropertyMapModal = ({ isOpen, onClose, property }: PropertyMapModalProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mapboxReady, setMapboxReady] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize Mapbox on mount
  useEffect(() => {
    const ready = initializeMapbox();
    setMapboxReady(ready);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!mapboxReady) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const mapComponent = (
    <MapErrorBoundary>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Initializing map...</p>
            </div>
          </div>
        }
      >
        <MapContainer property={property} isMobile={isMobile} />
      </Suspense>
    </MapErrorBoundary>
  );

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col ${
        isMobile
          ? 'w-full h-full max-h-screen'
          : 'w-full h-[90vh] max-w-6xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {property.listing_title || property.address}
            </h2>
            <p className="text-sm text-gray-500">
              {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close map"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Layout Container */}
        <div className="flex-1 overflow-hidden">
          {isMobile ? (
            <MobileLayout property={property} mapComponent={mapComponent} />
          ) : (
            <DesktopLayout property={property} mapComponent={mapComponent} />
          )}
        </div>
      </div>
    </div>
  );
};
