
import { Badge } from "@/components/ui/badge";

interface PropertyPreviewDescriptionProps {
  description: string;
  amenities?: string[];
  utilities?: string[];
}

export function PropertyPreviewDescription({
  description,
  amenities = [],
  utilities = []
}: PropertyPreviewDescriptionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Description</h3>
      <p className="text-muted-foreground whitespace-pre-line">{description}</p>
      
      {amenities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map(amenity => (
              <div key={amenity} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-roomie-purple mr-2" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {utilities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Utilities Included</h3>
          <div className="flex flex-wrap gap-2">
            {utilities.map(utility => (
              <Badge key={utility} variant="outline">
                {utility}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
