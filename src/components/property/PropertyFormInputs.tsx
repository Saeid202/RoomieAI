
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyType } from "@/services/propertyService";

interface PropertyFormInputsProps {
  formData: {
    title: string;
    description: string;
    address: string;
    price: string;
    bedrooms: string;
    bathrooms: string;
    propertyType: PropertyType;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function PropertyFormInputs({ formData, handleChange, handleSelectChange }: PropertyFormInputsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Property Title</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="e.g. Modern 2-bedroom apartment"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Describe your property..."
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          name="address" 
          placeholder="Full property address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            placeholder={formData.propertyType === 'rent' ? "Monthly rent" : "Sale price"}
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="propertyType">Listing Type</Label>
          <Select 
            value={formData.propertyType} 
            onValueChange={(value) => handleSelectChange("propertyType", value as PropertyType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">For Rent (with tenant applications)</SelectItem>
              <SelectItem value="sale">For Sale (without tenant applications)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input 
            id="bedrooms" 
            name="bedrooms" 
            type="number" 
            placeholder="Number of bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input 
            id="bathrooms" 
            name="bathrooms" 
            type="number" 
            placeholder="Number of bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
