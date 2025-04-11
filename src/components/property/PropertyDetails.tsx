
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PARKING_OPTIONS } from "@/services/propertyService";

interface PropertyDetailsProps {
  formData: {
    squareFeet: string;
    yearBuilt: string;
    parkingType: string;
    lotSize: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function PropertyDetails({ formData, handleChange, handleSelectChange }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Additional Property Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="squareFeet">Square Footage</Label>
          <Input 
            id="squareFeet" 
            name="squareFeet" 
            type="number" 
            placeholder="Property size in sq ft"
            value={formData.squareFeet}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="yearBuilt">Year Built</Label>
          <Input 
            id="yearBuilt" 
            name="yearBuilt" 
            type="number" 
            placeholder="Year the property was built"
            value={formData.yearBuilt}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parkingType">Parking</Label>
          <Select 
            value={formData.parkingType} 
            onValueChange={(value) => handleSelectChange("parkingType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parking option" />
            </SelectTrigger>
            <SelectContent>
              {PARKING_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
          <Input 
            id="lotSize" 
            name="lotSize" 
            type="number" 
            placeholder="Size of the land"
            value={formData.lotSize}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
