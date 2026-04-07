import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Property } from '@/services/propertyService';
import { PropertyMapModal } from './PropertyMapModal';

interface MapModalTriggerProps {
  property: Property;
  className?: string;
}

export const MapModalTrigger = ({ property, className = '' }: MapModalTriggerProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsMapOpen(true);
    }
  };

  const address = `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`;

  return (
    <>
      <button
        onClick={() => setIsMapOpen(true)}
        onKeyDown={handleKeyDown}
        className={`flex items-center gap-2 text-gray-700 font-medium hover:text-purple-600 transition-colors cursor-pointer group ${className}`}
        aria-label={`Open map for ${address}`}
        title="Click to view on map"
      >
        <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
        <span className="group-hover:underline">{address}</span>
      </button>

      {isMapOpen && (
        <PropertyMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          property={property}
        />
      )}
    </>
  );
};
