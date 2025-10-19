import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Property } from "@/services/propertyService";

interface MapModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Replace with a default location if needed
const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832,
};

export function MapModal({ property, isOpen, onClose }: MapModalProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center =
    property && property.latitude && property.longitude
      ? { lat: property.latitude, lng: property.longitude }
      : defaultCenter;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{property?.listing_title}</DialogTitle>
          <DialogDescription>
            {property?.address}, {property?.city}, {property?.state}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
            >
              {property && property.latitude && property.longitude && (
                <Marker position={{ lat: property.latitude, lng: property.longitude }} />
              )}
            </GoogleMap>
          ) : (
            <div>Loading Map...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
