
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  COMMON_AMENITIES, 
  COMMON_UTILITIES, 
  FURNISHED_OPTIONS, 
  PET_POLICY_OPTIONS 
} from "@/services/propertyService";

interface PropertyAmenitiesProps {
  formData: {
    amenities: string[];
    petPolicy: string;
    utilities: string[];
    furnishedStatus: string;
  };
  handleCheckboxChange: (name: string, value: string, checked: boolean) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function PropertyAmenities({ 
  formData, 
  handleCheckboxChange, 
  handleSelectChange 
}: PropertyAmenitiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_AMENITIES.map((amenity) => (
            <div className="flex items-center space-x-2" key={amenity}>
              <Checkbox 
                id={`amenity-${amenity}`} 
                checked={formData.amenities.includes(amenity)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("amenities", amenity, checked as boolean)
                }
              />
              <Label 
                htmlFor={`amenity-${amenity}`}
                className="cursor-pointer"
              >
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petPolicy">Pet Policy</Label>
          <Select 
            value={formData.petPolicy} 
            onValueChange={(value) => handleSelectChange("petPolicy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pet policy" />
            </SelectTrigger>
            <SelectContent>
              {PET_POLICY_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="furnishedStatus">Furnished Status</Label>
          <Select 
            value={formData.furnishedStatus} 
            onValueChange={(value) => handleSelectChange("furnishedStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select furnished status" />
            </SelectTrigger>
            <SelectContent>
              {FURNISHED_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Utilities Included</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_UTILITIES.map((utility) => (
            <div className="flex items-center space-x-2" key={utility}>
              <Checkbox 
                id={`utility-${utility}`} 
                checked={formData.utilities.includes(utility)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("utilities", utility, checked as boolean)
                }
              />
              <Label 
                htmlFor={`utility-${utility}`}
                className="cursor-pointer"
              >
                {utility}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
