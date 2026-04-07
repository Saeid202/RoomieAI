import { useEffect, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  address: string;
}

export const StreetViewModal = ({ isOpen, onClose, lat, lng, address }: StreetViewModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
      setError('Google Maps API not loaded. Please check your API key configuration.');
      console.error('Google Maps API not loaded');
      return;
    }

    try {
      // Initialize Street View
      const streetView = new google.maps.StreetViewPanorama(containerRef.current, {
        position: { lat, lng },
        pov: {
          heading,
          pitch,
        },
        zoom,
        addressControl: true,
        fullscreenControl: true,
        motionTrackingControl: true,
        panControl: true,
        zoomControl: true,
      });

      streetViewRef.current = streetView;

      // Listen for POV changes
      streetView.addListener('pov_changed', () => {
        const pov = streetView.getPov();
        setHeading(Math.round(pov.heading));
        setPitch(Math.round(pov.pitch));
      });

      // Listen for zoom changes
      streetView.addListener('zoom_changed', () => {
        setZoom(streetView.getZoom());
      });

      setError(null);
    } catch (err) {
      setError('Failed to load Street View. This location may not have street view coverage.');
      console.error('Street View error:', err);
    }

    return () => {
      // Cleanup
      if (streetViewRef.current) {
        google.maps.event.clearListeners(streetViewRef.current, 'pov_changed');
        google.maps.event.clearListeners(streetViewRef.current, 'zoom_changed');
        streetViewRef.current = null;
      }
    };
  }, [isOpen, lat, lng, heading, pitch, zoom]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!streetViewRef.current) return;

      const pov = streetViewRef.current.getPov();
      const step = 15;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowUp':
          e.preventDefault();
          streetViewRef.current.setPov({ heading: pov.heading, pitch: Math.min(90, pov.pitch + step) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          streetViewRef.current.setPov({ heading: pov.heading, pitch: Math.max(-90, pov.pitch - step) });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          streetViewRef.current.setPov({ heading: (pov.heading - step + 360) % 360, pitch: pov.pitch });
          break;
        case 'ArrowRight':
          e.preventDefault();
          streetViewRef.current.setPov({ heading: (pov.heading + step) % 360, pitch: pov.pitch });
          break;
        case '+':
        case '=':
          e.preventDefault();
          streetViewRef.current.setZoom(Math.min(5, streetViewRef.current.getZoom() + 1));
          break;
        case '-':
          e.preventDefault();
          streetViewRef.current.setZoom(Math.max(0, streetViewRef.current.getZoom() - 1));
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!streetViewRef.current) return;

    const pov = streetViewRef.current.getPov();
    const step = 15;

    switch (direction) {
      case 'up':
        streetViewRef.current.setPov({ heading: pov.heading, pitch: Math.min(90, pov.pitch + step) });
        break;
      case 'down':
        streetViewRef.current.setPov({ heading: pov.heading, pitch: Math.max(-90, pov.pitch - step) });
        break;
      case 'left':
        streetViewRef.current.setPov({ heading: (pov.heading - step + 360) % 360, pitch: pov.pitch });
        break;
      case 'right':
        streetViewRef.current.setPov({ heading: (pov.heading + step) % 360, pitch: pov.pitch });
        break;
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!streetViewRef.current) return;

    const currentZoom = streetViewRef.current.getZoom();
    if (direction === 'in') {
      streetViewRef.current.setZoom(Math.min(5, currentZoom + 1));
    } else {
      streetViewRef.current.setZoom(Math.max(0, currentZoom - 1));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-h-screen max-w-4xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Street View</h2>
            <p className="text-sm text-gray-500">{address}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close street view (ESC)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Street View Container */}
        <div className="flex-1 overflow-hidden relative">
          {error ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-6">
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={containerRef}
                className="w-full h-full bg-gray-100"
                role="region"
                aria-label="Street view panorama"
              />

              {/* Navigation Controls */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
                {/* Pan Controls */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePan('up')}
                    className="h-8 w-8"
                    aria-label="Look up (↑)"
                    title="Look up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePan('left')}
                      className="h-8 w-8"
                      aria-label="Look left (←)"
                      title="Look left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePan('down')}
                      className="h-8 w-8"
                      aria-label="Look down (↓)"
                      title="Look down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePan('right')}
                      className="h-8 w-8"
                      aria-label="Look right (→)"
                      title="Look right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="border-t pt-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom('in')}
                    className="flex-1"
                    aria-label="Zoom in (+)"
                    title="Zoom in"
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom('out')}
                    className="flex-1"
                    aria-label="Zoom out (-)"
                    title="Zoom out"
                  >
                    −
                  </Button>
                </div>
              </div>

              {/* Info Display */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
                <p className="font-semibold mb-1">Navigation</p>
                <p>↑↓←→ to look around</p>
                <p>+/− to zoom</p>
                <p>ESC to close</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 text-xs text-gray-600">
          <p>Use arrow keys to navigate. Use +/- to zoom. Drag to look around. Press ESC to close.</p>
        </div>
      </div>
    </div>
  );
};
