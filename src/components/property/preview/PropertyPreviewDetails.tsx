
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PropertyPreviewDetailsProps {
  propertyType: string;
  yearBuilt?: string;
  parkingType?: string;
  petPolicy?: string;
  availability?: string;
  virtualTourUrl?: string;
  additionalImages?: string[];
}

export function PropertyPreviewDetails({
  propertyType,
  yearBuilt,
  parkingType,
  petPolicy,
  availability,
  virtualTourUrl,
  additionalImages = []
}: PropertyPreviewDetailsProps) {
  return (
    <div>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Property Details</h3>
          
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Property Type</dt>
              <dd className="font-medium">
                {propertyType === "rent" ? "Rental" : "For Sale"}
              </dd>
            </div>
            
            {yearBuilt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Year Built</dt>
                <dd className="font-medium">{yearBuilt}</dd>
              </div>
            )}
            
            {parkingType && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Parking</dt>
                <dd className="font-medium">{parkingType}</dd>
              </div>
            )}
            
            {petPolicy && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pet Policy</dt>
                <dd className="font-medium">{petPolicy}</dd>
              </div>
            )}
            
            {availability && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="font-medium">{availability}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
      
      {virtualTourUrl && (
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            View Virtual Tour
          </Button>
        </div>
      )}
      
      {additionalImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">More Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {additionalImages.slice(0, 6).map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Property view ${index + 1}`}
                className="aspect-square object-cover rounded-md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
