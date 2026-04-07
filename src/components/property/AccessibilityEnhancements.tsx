/**
 * Accessibility Enhancements for Interactive Property Map
 * 
 * This module provides accessibility utilities and enhancements for the map feature:
 * - Keyboard navigation support
 * - ARIA labels and live regions
 * - Screen reader announcements
 * - Focus management
 * - High contrast support
 */

import { useEffect, useRef } from 'react';

/**
 * Hook for managing keyboard navigation in the map modal
 */
export const useMapKeyboardNavigation = (
  mapRef: React.RefObject<any>,
  onClose: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mapRef.current) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowUp':
          e.preventDefault();
          mapRef.current.panBy(0, -50);
          break;
        case 'ArrowDown':
          e.preventDefault();
          mapRef.current.panBy(0, 50);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          mapRef.current.panBy(-50, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          mapRef.current.panBy(50, 0);
          break;
        case '+':
        case '=':
          e.preventDefault();
          mapRef.current.zoomTo(mapRef.current.getZoom() + 1, { duration: 300 });
          break;
        case '-':
          e.preventDefault();
          mapRef.current.zoomTo(mapRef.current.getZoom() - 1, { duration: 300 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mapRef, onClose]);
};

/**
 * Hook for managing focus within the modal
 */
export const useModalFocusManagement = (
  modalRef: React.RefObject<HTMLDivElement>,
  isOpen: boolean
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, modalRef]);
};

/**
 * Hook for announcing changes to screen readers
 */
export const useAriaLiveAnnouncement = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      const div = document.createElement('div');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', priority);
      div.setAttribute('aria-atomic', 'true');
      div.className = 'sr-only';
      document.body.appendChild(div);
      announcementRef.current = div;
    }

    announcementRef.current.textContent = message;
  };

  return { announce, announcementRef };
};

/**
 * Component for screen reader only content
 */
export const ScreenReaderOnly = ({ children }: { children: React.ReactNode }) => (
  <div className="sr-only" role="status" aria-live="polite">
    {children}
  </div>
);

/**
 * Accessibility utilities for map controls
 */
export const AccessibilityUtils = {
  /**
   * Get accessible label for zoom level
   */
  getZoomLabel: (zoom: number): string => {
    if (zoom < 5) return 'Zoomed out';
    if (zoom < 10) return 'Zoomed in';
    if (zoom < 15) return 'Very zoomed in';
    return 'Maximum zoom';
  },

  /**
   * Get accessible label for view mode
   */
  getViewModeLabel: (mode: 'map' | 'satellite' | 'street'): string => {
    const labels: Record<string, string> = {
      map: 'Street map view',
      satellite: 'Satellite view',
      street: 'Street view',
    };
    return labels[mode] || mode;
  },

  /**
   * Get accessible label for amenity type
   */
  getAmenityLabel: (type: string): string => {
    const labels: Record<string, string> = {
      school: 'School',
      transit: 'Public transit',
      restaurant: 'Restaurant',
      park: 'Park',
      hospital: 'Hospital',
      shopping: 'Shopping',
      coffee: 'Coffee shop',
      gym: 'Gym',
    };
    return labels[type] || type;
  },

  /**
   * Format distance for accessibility
   */
  formatDistance: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} meters`;
    }
    return `${(meters / 1000).toFixed(1)} kilometers`;
  },

  /**
   * Get accessible label for radius
   */
  getRadiusLabel: (radiusMeters: number, amenitiesCount: number): string => {
    const distance = AccessibilityUtils.formatDistance(radiusMeters);
    return `Radius of ${distance} with ${amenitiesCount} amenities inside`;
  },
};

/**
 * Keyboard shortcut help text
 */
export const KeyboardShortcuts = {
  map: [
    { key: '↑↓←→', description: 'Pan map' },
    { key: '+', description: 'Zoom in' },
    { key: '−', description: 'Zoom out' },
    { key: 'ESC', description: 'Close modal' },
  ],
  streetView: [
    { key: '↑↓←→', description: 'Look around' },
    { key: '+', description: 'Zoom in' },
    { key: '−', description: 'Zoom out' },
    { key: 'ESC', description: 'Close street view' },
  ],
};

/**
 * ARIA labels for common map elements
 */
export const AriaLabels = {
  mapContainer: 'Interactive property map',
  propertyMarker: 'Property location marker',
  amenityMarker: (type: string, name: string) => `${AccessibilityUtils.getAmenityLabel(type)}: ${name}`,
  searchBox: 'Search for nearby locations',
  radiusTool: 'Draw radius to explore nearby area',
  directionsButton: 'Get directions to property',
  streetViewButton: 'View street level imagery',
  zoomIn: 'Zoom in (+ key)',
  zoomOut: 'Zoom out (- key)',
  viewToggle: (mode: string) => `Switch to ${AccessibilityUtils.getViewModeLabel(mode as any)}`,
  layerToggle: (layer: string, enabled: boolean) => `${layer} ${enabled ? 'shown' : 'hidden'}`,
  bottomSheet: 'Property details panel',
  closeButton: 'Close map modal (ESC key)',
};
