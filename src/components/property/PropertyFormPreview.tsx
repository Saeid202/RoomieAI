
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BedDouble, Bath, Home, BarChart3, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PropertyFormPreviewProps {
  formData: {
    title: string;
    description: string;
    address: string;
    price: string;
    bedrooms: string;
    bathrooms: string;
    propertyType: string;
    imageUrls: string[];
    squareFeet?: string;
    yearBuilt?: string;
    amenities?: string[];
    petPolicy?: string;
    utilities?: string[];
    furnishedStatus?: string;
    availability?: string;
    virtualTourUrl?: string;
    parkingType?: string;
  };
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function PropertyFormPreview({ 
  formData, 
  onBack, 
  onSubmit,
  isSubmitting 
}: PropertyFormPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Editor
        </Button>
        
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-roomie-purple hover:bg-roomie-dark"
        >
          {isSubmitting ? "Submitting..." : "Confirm & List Property"}
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 pb-0">
          <CardTitle className="text-2xl">{formData.title}</CardTitle>
          <div className="flex items-center text-muted-foreground">
            <MapPin size={16} className="mr-1" />
            {formData.address}
          </div>
        </CardHeader>
        
        <div className="relative">
          {formData.imageUrls.length > 0 ? (
            <div className="aspect-[16/9]">
              <img 
                src={formData.imageUrls[0]} 
                alt={formData.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] bg-slate-200 flex items-center justify-center">
              <p className="text-muted-foreground">No images uploaded</p>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-roomie-purple mr-2">
              {formData.propertyType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
            {formData.furnishedStatus && (
              <Badge variant="outline" className="bg-white">
                {formData.furnishedStatus}
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              ${parseFloat(formData.price).toLocaleString()}
              {formData.propertyType === "rent" && <span className="text-base font-normal">/month</span>}
            </h2>
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <BedDouble size={20} className="mr-2 text-muted-foreground" />
                <span>{formData.bedrooms} {parseInt(formData.bedrooms) === 1 ? "Bed" : "Beds"}</span>
              </div>
              
              <div className="flex items-center">
                <Bath size={20} className="mr-2 text-muted-foreground" />
                <span>{formData.bathrooms} {parseFloat(formData.bathrooms) === 1 ? "Bath" : "Baths"}</span>
              </div>
              
              {formData.squareFeet && (
                <div className="flex items-center">
                  <Home size={20} className="mr-2 text-muted-foreground" />
                  <span>{parseInt(formData.squareFeet).toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">{formData.description}</p>
              
              {formData.amenities && formData.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-roomie-purple mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.utilities && formData.utilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Utilities Included</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.utilities.map(utility => (
                      <Badge key={utility} variant="outline">
                        {utility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-4">Property Details</h3>
                  
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Property Type</dt>
                      <dd className="font-medium">
                        {formData.propertyType === "rent" ? "Rental" : "For Sale"}
                      </dd>
                    </div>
                    
                    {formData.yearBuilt && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Year Built</dt>
                        <dd className="font-medium">{formData.yearBuilt}</dd>
                      </div>
                    )}
                    
                    {formData.parkingType && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Parking</dt>
                        <dd className="font-medium">{formData.parkingType}</dd>
                      </div>
                    )}
                    
                    {formData.petPolicy && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Pet Policy</dt>
                        <dd className="font-medium">{formData.petPolicy}</dd>
                      </div>
                    )}
                    
                    {formData.availability && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Availability</dt>
                        <dd className="font-medium">{formData.availability}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
              
              {formData.virtualTourUrl && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View Virtual Tour
                  </Button>
                </div>
              )}
              
              {formData.imageUrls.length > 1 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">More Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.imageUrls.slice(1, 7).map((url, index) => (
                      <img 
                        key={index} 
                        src={url} 
                        alt={`Property view ${index + 2}`}
                        className="aspect-square object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
