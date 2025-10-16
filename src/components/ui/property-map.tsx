import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapCoordinates } from "@/types/address";

interface PropertyMapProps {
  center?: MapCoordinates;
  selectedAddress?: string;
  className?: string;
  facilityMarker?: {
    name: string;
    coordinates: { lat: number; lng: number };
    distance: number;
  };
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  center,
  selectedAddress,
  className = "w-full h-64 rounded-lg",
  facilityMarker
}) => {
  const toFixedIfFloat = (value: number, decimals: number): string => {
    if(typeof value !== 'number') return value.toString();
    if(!isFinite(value)) return value.toString();
    return value.toFixed(decimals);
  };

  if (selectedAddress && center && !isNaN(center.lat) && !isNaN(center.lng)) {
    // Create better bounding box for Canadian location viewing
    const latRange = 0.005; // Reduced for closer view
    const lngRange = 0.008;
    
    // If we have a facility marker, adjust the bounding box to include both locations
    let bboxWest = center.lng - lngRange;
    let bboxSouth = center.lat - latRange;  
    let bboxEast = center.lng + lngRange;
    let bboxNorth = center.lat + latRange;

    if (facilityMarker) {
      // Expand bounding box to include facility marker
      bboxWest = Math.min(bboxWest, facilityMarker.coordinates.lng - lngRange);
      bboxSouth = Math.min(bboxSouth, facilityMarker.coordinates.lat - latRange);
      bboxEast = Math.max(bboxEast, facilityMarker.coordinates.lng + lngRange);
      bboxNorth = Math.max(bboxNorth, facilityMarker.coordinates.lat + latRange);
    }
    
    const mapURL = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxWest},${bboxSouth},${bboxEast},${bboxNorth}&layer=mapnik&marker=${center.lat},${center.lng}${facilityMarker ? `&marker=${facilityMarker.coordinates.lat},${facilityMarker.coordinates.lng}` : ''}`;

    return (
      <div className={cn(className, "overflow-hidden border-2 border-blue-200 rounded-xl shadow-lg bg-blue-50")}>
        <div className="relative">
          <iframe
            className="w-full h-full border-0"
            src={mapURL}
            loading="lazy"
            width="100%"
            height="100%"
            title="Canadian Property Location Map"
            allowFullScreen
          />
          {selectedAddress && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 text-sm shadow-md border">
              <div className="flex items-center gap-1 text-blue-700">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{selectedAddress}</span>
              </div>
            </div>
          )}
          {facilityMarker && (
            <div className="absolute top-2 right-2 bg-green-100/90 backdrop-blur-sm rounded-md px-3 py-2 text-sm shadow-md border border-green-300">
              <div className="flex items-center gap-1 text-green-700">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{facilityMarker.name}</span>
                <span className="text-xs text-green-600">({facilityMarker.distance}m)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className, "flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg text-center")}>
      <div className="border-gray-200 rounded-lg p-8 items-center max-w-sm">
        <MapPin className="mx-auto h-12 w-12 text-blue-500 mb-3" />
        {selectedAddress ? (
          <p className="text-base text-stone-700 truncate break-anywhere">{selectedAddress}</p>
        ) : (
          <p className="text-gray-600 text-sm">{center?.lat && center?.lng ? "No address name provided" : "Click a suggested address to open the map"}</p>
        )}
      </div>
    </div>
  );
};

export default PropertyMap;