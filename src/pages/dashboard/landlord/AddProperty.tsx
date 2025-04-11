
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Image as ImageIcon, X } from "lucide-react";

export default function AddPropertyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Preview images
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImageUrls(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload images first
      let imagePathsForDB: string[] = [];
      
      if (images.length > 0) {
        setUploading(true);
        
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${user?.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('properties')
            .upload(filePath, image);
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }
          
          imagePathsForDB.push(filePath);
        }
        
        setUploading(false);
      }

      // Collect form data
      const formData = new FormData(e.currentTarget);
      const propertyData = {
        title: formData.get('title') as string,
        type: formData.get('type') as string,
        listing_type: formData.get('listing-type') as string,
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        price: Number(formData.get('price')),
        address: formData.get('address') as string,
        description: formData.get('description') as string,
        amenities: formData.getAll('amenities') as string[],
        images: imagePathsForDB,
        user_id: user?.id
      };

      const { error } = await supabase
        .from('properties')
        .insert(propertyData);

      if (error) throw error;

      toast({
        title: "Property Added",
        description: "Your property has been saved and is pending review.",
      });

      // Reset form and images
      e.currentTarget.reset();
      setImages([]);
      setImageUrls([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive"
      });
      console.error('Property submission error:', error);
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
        <p className="text-muted-foreground mt-1">List your property to find tenants or co-owners</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Provide information about your property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" name="title" placeholder="e.g., Spacious 2-bedroom apartment in Downtown" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Select name="type" defaultValue="apartment">
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="listing-type">Listing Type</Label>
                  <Select name="listing-type" defaultValue="rent">
                    <SelectTrigger>
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="co-ownership">Co-ownership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={1} required />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" name="bathrooms" type="number" min={0} step={0.5} defaultValue={1} required />
                </div>
                <div>
                  <Label htmlFor="price">Price ($/month)</Label>
                  <Input id="price" name="price" type="number" min={0} required />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="Full property address" required />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Describe your property in detail..." 
                  rows={5}
                  required
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Property Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  
                  {imageUrls.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={url} 
                              alt={`Property image ${index+1}`} 
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4"
                      >
                        <Upload size={16} className="mr-2" />
                        Add More Images
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center cursor-pointer py-6"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">Drag and drop images or click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload high-quality images of your property (max 10MB each)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {["Parking", "Laundry", "Dishwasher", "Air Conditioning", "Furnished", "Pets Allowed"].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`amenity-${amenity}`} 
                        name="amenities" 
                        value={amenity}
                        className="rounded border-gray-300" 
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">Cancel</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || uploading}
                className="bg-roomie-purple hover:bg-roomie-dark"
              >
                {uploading ? "Uploading Images..." : isSubmitting ? "Submitting..." : "Add Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
