import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapCoordinates } from "@/types/address";

interface PropertyMapProps {
  center?: MapCoordinates;
  selectedAddress?: string;
  className?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  center,
  selectedAddress,
  className = "w-full h-64 rounded-lg",
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
    
    const bboxWest = center.lng - lngRange;
    const bboxSouth = center.lat - latRange;  
    const bboxEast = center.lng + lngRange;
    const bboxNorth = center.lat + latRange;
    
    const mapURL = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxWest},${bboxSouth},${bboxEast},${bboxNorth}&layer=mapnik&marker=${center.lat},${center.lng}`;

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