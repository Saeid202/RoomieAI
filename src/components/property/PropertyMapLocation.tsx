
import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Map, MapPin } from "lucide-react";

interface PropertyMapLocationProps {
  address: string;
}

export function PropertyMapLocation({ address }: PropertyMapLocationProps) {
  const [mapUrl, setMapUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (address) {
      setIsLoading(true);
      // For demo purposes, we're just creating a Google Maps static image URL
      // In a real implementation, you would use a proper maps API
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=600x300&markers=color:red|${encodedAddress}&key=YOUR_API_KEY`;
      
      // For demo, we'll just show a placeholder
      setMapUrl("https://via.placeholder.com/600x300?text=Property+Location+Map");
      setIsLoading(false);
    }
  }, [address]);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-base">Property Location</Label>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Map size={16} />
          Open Full Map
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="h-[200px] bg-slate-100 flex items-center justify-center">
            <span className="text-muted-foreground">Loading map...</span>
          </div>
        ) : mapUrl ? (
          <div className="relative">
            <img 
              src={mapUrl} 
              alt="Property location map" 
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <MapPin size={32} className="text-roomie-purple" />
            </div>
          </div>
        ) : (
          <div className="h-[200px] bg-slate-100 flex items-center justify-center">
            <span className="text-muted-foreground">Enter an address to see the map</span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        The exact location will be shared with approved applicants only.
      </div>
    </div>
  );
}
