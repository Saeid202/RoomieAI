
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertyPreviewHeaderProps {
  title: string;
  address: string;
  propertyType: string;
  furnishedStatus?: string;
  imageUrl?: string;
  onBack: () => void;
}

export function PropertyPreviewHeader({ 
  title, 
  address, 
  propertyType, 
  furnishedStatus, 
  imageUrl, 
  onBack 
}: PropertyPreviewHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Editor
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 pb-0">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <div className="flex items-center text-muted-foreground">
            <MapPin size={16} className="mr-1" />
            {address}
          </div>
        </CardHeader>
        
        <div className="relative">
          {imageUrl ? (
            <div className="aspect-[16/9]">
              <img 
                src={imageUrl} 
                alt={title} 
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
              {propertyType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
            {furnishedStatus && (
              <Badge variant="outline" className="bg-white">
                {furnishedStatus}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
