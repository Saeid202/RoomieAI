
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function AddPropertyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Property submitted",
        description: "Your property has been saved and is pending review.",
      });
    }, 1500);
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
                <Input id="title" placeholder="e.g., Spacious 2-bedroom apartment in Downtown" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Select defaultValue="apartment">
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
                  <Select defaultValue="rent">
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
                  <Input id="bedrooms" type="number" min={0} defaultValue={1} required />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" min={0} step={0.5} defaultValue={1} required />
                </div>
                <div>
                  <Label htmlFor="price">Price ($/month)</Label>
                  <Input id="price" type="number" min={0} required />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Full property address" required />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your property in detail..." 
                  rows={5}
                  required
                />
              </div>
              
              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {["Parking", "Laundry", "Dishwasher", "Air Conditioning", "Furnished", "Pets Allowed"].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input type="checkbox" id={`amenity-${amenity}`} className="rounded border-gray-300" />
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
                disabled={isSubmitting}
                className="bg-roomie-purple hover:bg-roomie-dark"
              >
                {isSubmitting ? "Submitting..." : "Add Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
