
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyMediaProps {
  formData: {
    imageUrls: string[];
    virtualTourUrl: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export function PropertyMedia({ 
  formData, 
  handleChange, 
  fileInputRef, 
  handleImageUpload, 
  removeImage 
}: PropertyMediaProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label htmlFor="images">Property Images</Label>
          <Button 
            type="button" 
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Upload Image
          </Button>
          <Input 
            id="images"
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>
        
        {formData.imageUrls.length === 0 ? (
          <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
            No images uploaded yet. Click the Upload button to add photos.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.imageUrls.map((url, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <CardContent className="p-0">
                  <img 
                    src={url} 
                    alt={`Property image ${index + 1}`} 
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          Upload high-quality images of your property. The first image will be used as the main image.
        </div>
      </div>
      
      <div>
        <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
        <Input 
          id="virtualTourUrl" 
          name="virtualTourUrl" 
          placeholder="e.g. https://my-virtual-tour.com/property"
          value={formData.virtualTourUrl}
          onChange={handleChange}
        />
        <div className="text-xs text-muted-foreground mt-2">
          Add a link to a virtual tour or video of the property if available.
        </div>
      </div>
    </div>
  );
}
