import { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Property } from '@/services/propertyService';

interface MobileLayoutProps {
  property: Property;
  mapComponent: React.ReactNode;
}

export const MobileLayout = ({ property, mapComponent }: MobileLayoutProps) => {
  const [bottomSheetHeight, setBottomSheetHeight] = useState(30); // 30% of viewport
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const newHeight = Math.max(20, Math.min(80, bottomSheetHeight + (deltaY / window.innerHeight) * 100));
    setBottomSheetHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Snap to positions
    if (bottomSheetHeight < 40) {
      setBottomSheetHeight(30);
    } else if (bottomSheetHeight < 60) {
      setBottomSheetHeight(50);
    } else {
      setBottomSheetHeight(80);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, bottomSheetHeight]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Map (fills remaining space) */}
      <div className="flex-1 overflow-hidden">
        {mapComponent}
      </div>

      {/* Bottom Sheet */}
      <div
        ref={bottomSheetRef}
        className="bg-white border-t border-gray-200 shadow-lg overflow-hidden flex flex-col transition-all duration-300"
        style={{
          height: `${bottomSheetHeight}vh`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing bg-gray-50 border-b border-gray-100"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <PropertyDetailsPanel property={property} />
        </div>
      </div>
    </div>
  );
};

const PropertyDetailsPanel = ({ property }: { property: Property }) => {
  return (
    <div className="space-y-4">
      {/* Price Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
          Price
        </h3>
        <p className="text-2xl font-bold text-purple-600">
          ${property.monthly_rent || (property as any).sales_price}
          {property.monthly_rent && <span className="text-xs font-normal text-gray-600 ml-2">/month</span>}
        </p>
      </div>

      {/* Key Details */}
      <div>
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
          Key Details
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {property.bedrooms !== null && (
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 uppercase">Bedrooms</div>
              <div className="text-base font-bold text-blue-900">{property.bedrooms}</div>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-xs font-semibold text-green-600 uppercase">Bathrooms</div>
              <div className="text-base font-bold text-green-900">{property.bathrooms}</div>
            </div>
          )}
          {property.square_footage && (
            <div className="bg-purple-50 p-2 rounded border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 uppercase">Sqft</div>
              <div className="text-base font-bold text-purple-900">{property.square_footage}</div>
            </div>
          )}
          {property.parking && (
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <div className="text-xs font-semibold text-orange-600 uppercase">Parking</div>
              <div className="text-base font-bold text-orange-900 truncate">{property.parking}</div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            About
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
            {property.description}
          </p>
        </div>
      )}

      {/* Nearby Amenities */}
      {property.nearby_amenities && property.nearby_amenities.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            Nearby
          </h3>
          <div className="flex flex-wrap gap-1">
            {property.nearby_amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
            {property.nearby_amenities.length > 3 && (
              <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-xs">
                +{property.nearby_amenities.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
          Location
        </h3>
        <p className="text-xs text-gray-600">
          {property.address}
          <br />
          {property.city}, {property.state} {property.zip_code}
        </p>
      </div>
    </div>
  );
};
